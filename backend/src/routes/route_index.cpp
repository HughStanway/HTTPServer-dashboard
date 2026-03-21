#include "route_index.h"

namespace HTTPServerMetricsDashboard {

RouteIndex::RouteIndex() : Route("GET", "/") {}

HTTPServer::HttpResponse RouteIndex::handle(
    const HTTPServer::HttpRequest& req) const {
  /*
    We don't protect the initial HTML load because the frontend will
    handle the login screen and its own auth state. However, the API is
    protected.
  */
  return HTTPServer::Responses::file(req, "frontend/dist/index.html");
}

}  // namespace HTTPServerMetricsDashboard