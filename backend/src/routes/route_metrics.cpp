#include "route_metrics.h"

#include <sstream>

namespace HTTPServerMetricsDashboard {

RouteMetrics::RouteMetrics() : Route("GET", "/api/metrics") {}

HTTPServer::HttpResponse RouteMetrics::handle(
    const HTTPServer::HttpRequest& req) const {
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
}

}  // namespace HTTPServerMetricsDashboard