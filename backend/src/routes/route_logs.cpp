#include "route_logs.h"

#include <deque>
#include <fstream>
#include <sstream>

namespace HTTPServerMetricsDashboard {

RouteLogs::RouteLogs() : Route("GET", "/api/logs") {}

HTTPServer::HttpResponse RouteLogs::handle(
    const HTTPServer::HttpRequest& req) const {
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
}

}  // namespace HTTPServerMetricsDashboard