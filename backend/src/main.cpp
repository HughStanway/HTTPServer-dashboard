#include <httpserver>
#include <iostream>
#include <string>

#include "auth/auth.h"
#include "routes/dispatcher.h"
#include "routes/route_index.h"
#include "routes/route_logs.h"
#include "routes/route_metrics.h"

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

  // Initialize and register routes with server
  Dispatcher dispatcher;
  dispatcher.addRoute(std::make_unique<RouteMetrics>());
  dispatcher.addRoute(std::make_unique<RouteLogs>());
  dispatcher.addRoute(std::make_unique<RouteIndex>());
  dispatcher.registerRoutes(auth);

  // Add static assets mapping
  HTTPServer::Router::instance().addStaticDirectoryRoute(
      "/assets", "frontend/dist/assets/");

  server.start();
  return 0;
}
