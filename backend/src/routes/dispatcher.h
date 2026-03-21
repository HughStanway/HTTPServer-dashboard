#ifndef INCLUDE_DISPATCHER_H
#define INCLUDE_DISPATCHER_H

#include <memory>
#include <vector>

#include "../auth/auth.h"
#include "route.h"

namespace HTTPServerMetricsDashboard {

class Dispatcher {
 public:
  Dispatcher() = default;
  ~Dispatcher() = default;

  void addRoute(std::unique_ptr<Route> route);
  void registerRoutes(const Auth& auth);

 private:
  std::vector<std::unique_ptr<Route>> routes;
};

}  // namespace HTTPServerMetricsDashboard

#endif
