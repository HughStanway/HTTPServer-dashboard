#ifndef INCLUDE_ROUTE_INDEX_H
#define INCLUDE_ROUTE_INDEX_H

#include <httpserver>

#include "route.h"

namespace HTTPServerMetricsDashboard {

class RouteIndex : public Route {
 public:
  RouteIndex();

  bool isProtected() const override { return false; }

  HTTPServer::HttpResponse handle(
      const HTTPServer::HttpRequest& req) const override;
};

}  // namespace HTTPServerMetricsDashboard

#endif