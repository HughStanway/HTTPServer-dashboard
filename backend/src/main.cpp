#include <deque>
#include <fstream>
#include <httpserver>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>

#include "auth/auth.h"

int main() {
  using namespace HTTPServerMetricsDashboard;

  // 0. Load credentials
  Auth auth;
  if (!auth.loadCredentials(".env/credentials")) {
    return 1;
  }

  // Initialize server
  HTTPServer::Server server("backend/src/config.toml");
  server.installSignalHandlers();

  // 1. API: Metrics Endpoint
  HTTPServer::Router::instance().addRoute(
      "GET", "/api/metrics", [&](const HTTPServer::HttpRequest& req) {
        if (!auth.isAuthorized(req)) {
          HTTPServer::HttpResponse res;
          return res.setStatus(HTTPServer::StatusCode::Unauthorized)
              .setBody("{\"error\":\"Unauthorized\"}")
              .addHeader("Content-Type", "application/json");
        }

        auto snapshot = HTTPServer::Metrics::instance().snapshot();
        std::stringstream json;
        json << "{"
             << "\"activeConnections\":" << snapshot.d_activeConnections << ","
             << "\"totalRequests\":" << snapshot.d_totalRequests << ","
             << "\"responses2xx\":" << snapshot.d_responses2xx << ","
             << "\"responses3xx\":" << snapshot.d_responses3xx << ","
             << "\"responses4xx\":" << snapshot.d_responses4xx << ","
             << "\"responses5xx\":" << snapshot.d_responses5xx << ","
             << "\"bytesReceived\":" << snapshot.d_totalBytesReceived << ","
             << "\"bytesSent\":" << snapshot.d_totalBytesSent << ","
             << "\"totalProcessingTimeMs\":"
             << snapshot.d_totalRequestProcessingTimeMs << "}";

        HTTPServer::HttpResponse res;
        return res.setStatus(HTTPServer::StatusCode::OK)
            .setBody(json.str())
            .addHeader("Content-Type", "application/json");
      });

  // 1.1 API: Logs Endpoint
  HTTPServer::Router::instance().addRoute(
      "GET", "/api/logs", [&](const HTTPServer::HttpRequest& req) {
        if (!auth.isAuthorized(req)) {
          HTTPServer::HttpResponse res;
          return res.setStatus(HTTPServer::StatusCode::Unauthorized)
              .setBody("{\"error\":\"Unauthorized\"}")
              .addHeader("Content-Type", "application/json");
        }

        std::ifstream logFile("logs/server.log");
        std::deque<std::string> lines;
        std::string line;
        if (logFile.is_open()) {
          while (std::getline(logFile, line)) {
            lines.push_back(line);
            if (lines.size() > 1000) {
              lines.pop_front();
            }
          }
          logFile.close();
        }

        std::stringstream json;
        json << "{\"logs\": [";
        for (size_t i = 0; i < lines.size(); ++i) {
          // Basic JSON escaping for quotes
          std::string escaped = lines[i];
          size_t pos = 0;
          while ((pos = escaped.find('"', pos)) != std::string::npos) {
            escaped.replace(pos, 1, "\\\"");
            pos += 2;
          }
          json << "\"" << escaped << "\"" << (i < lines.size() - 1 ? "," : "");
        }
        json << "]}";

        HTTPServer::HttpResponse res;
        return res.setStatus(HTTPServer::StatusCode::OK)
            .setBody(json.str())
            .addHeader("Content-Type", "application/json");
      });

  // 2. Static Assets Mapping
  HTTPServer::Router::instance().addStaticDirectoryRoute(
      "/assets", "frontend/dist/assets/");

  // 3. SPA Fallback / Dashboard Route
  HTTPServer::Router::instance().addRoute(
      "GET", "/", [&](const HTTPServer::HttpRequest& req) {
        // We don't protect the initial HTML load because the frontend will
        // handle the login screen and its own auth state. However, the API is
        // protected.
        return HTTPServer::Responses::file(req, "frontend/dist/index.html");
      });

  server.start();
  return 0;
}
