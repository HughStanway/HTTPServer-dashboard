#include <httpserver>

#include <iostream>
#include <sstream>

int main() {
    // Initialize server
    HTTPServer::Server server("src/config.toml");
    server.installSignalHandlers();

    // 1. API: Metrics Endpoint
    HTTPServer::Router::instance().addRoute("GET", "/api/metrics", [](const HTTPServer::HttpRequest& req) {
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
             << "\"totalProcessingTimeMs\":" << snapshot.d_totalRequestProcessingTimeMs
             << "}";

        HTTPServer::HttpResponse res;
        return res.setStatus(HTTPServer::StatusCode::OK)
                  .setBody(json.str())
                  .addHeader("Content-Type", "application/json");
    });

    // 2. Static Assets Mapping 
    // In production, Vite builds to 'dist/'. We serve those files under root or '/assets'
    HTTPServer::Router::instance().addStaticDirectoryRoute("/", "frontend/dist/");

    // 3. SPA Fallback
    // For any route not matched by API or static files, serve the index.html
    HTTPServer::Router::instance().addRoute("GET", "/", [](const HTTPServer::HttpRequest& req) {
        return HTTPServer::Responses::file(req, "frontend/dist/index.html");
    });

    server.start();
    return 0;
}
