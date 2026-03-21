#ifndef INCLUDE_ROUTE_H
#define INCLUDE_ROUTE_H

#include <httpserver>
#include <string>
#include <vector>

namespace HTTPServerMetricsDashboard {

class Route {
 public:
  /* Constructors and Destructors */
  Route(const std::string& method, const std::string& path);
  virtual ~Route() = default;

  /* Getters */
  std::string_view getMethod() const;
  std::string_view getPath() const;

  /* Virtual Methods */
  virtual bool isProtected() const { return true; }
  virtual HTTPServer::HttpResponse handle(
      const HTTPServer::HttpRequest& req) const = 0;

 private:
  const std::string method;
  const std::string path;
};

}  // namespace HTTPServerMetricsDashboard

#endif
