#ifndef INCLUDE_ROUTE_METRICS_H
#define INCLUDE_ROUTE_METRICS_H

#include <httpserver>

#include "route.h"

namespace HTTPServerMetricsDashboard {

class RouteMetrics : public Route {
 public:
  RouteMetrics();

  HTTPServer::HttpResponse handle(
      const HTTPServer::HttpRequest& req) const override;
};

}  // namespace HTTPServerMetricsDashboard

#endif