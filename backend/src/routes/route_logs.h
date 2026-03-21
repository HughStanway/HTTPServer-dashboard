#ifndef INCLUDE_ROUTE_LOGS_H
#define INCLUDE_ROUTE_LOGS_H

#include <httpserver>

#include "route.h"

namespace HTTPServerMetricsDashboard {

class RouteLogs : public Route {
 public:
  RouteLogs();

  HTTPServer::HttpResponse handle(
      const HTTPServer::HttpRequest& req) const override;
};

}  // namespace HTTPServerMetricsDashboard

#endif