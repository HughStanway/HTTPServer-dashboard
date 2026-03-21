#include "dispatcher.h"

#include <httpserver>

namespace HTTPServerMetricsDashboard {

void Dispatcher::addRoute(std::unique_ptr<Route> route) {
  routes.push_back(std::move(route));
}

void Dispatcher::registerRoutes(const Auth& auth) {
  for (const auto& rd : routes) {
    HTTPServer::Router::instance().addRoute(
        std::string(rd->getMethod()), std::string(rd->getPath()),
        [&auth, routePtr = rd.get()](const HTTPServer::HttpRequest& req) {
          if (routePtr->isProtected() && !auth.isAuthorized(req)) {
            return HTTPServer::HttpResponse()
                .setStatus(HTTPServer::StatusCode::Unauthorized)
                .setBody("{\"error\":\"Unauthorized\"}")
                .addHeader("Content-Type", "application/json");
          }
          return routePtr->handle(req);
        });
  }
}

}  // namespace HTTPServerMetricsDashboard