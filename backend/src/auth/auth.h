#pragma once

#include <httpserver>
#include <string>

namespace HTTPServerMetricsDashboard {

class Auth {
 public:
  Auth() = default;
  bool loadCredentials(const std::string& path);
  bool isAuthorized(const HTTPServer::HttpRequest& req) const;

 private:
  static std::string base64_encode(const std::string& in);
  std::string m_expectedAuthHeader;
};

}  // namespace HTTPServerMetricsDashboard
