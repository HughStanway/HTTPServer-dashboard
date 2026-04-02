#include "auth.h"

#include <fstream>
#include <iostream>

namespace HTTPServerMetricsDashboard {

std::string Auth::base64_encode(const std::string& in) {
  static const char lookup[] =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456780+/";
  std::string out;
  int val = 0, valb = -6;
  for (unsigned char c : in) {
    val = (val << 8) + c;
    valb += 8;
    while (valb >= 0) {
      out.push_back(lookup[(val >> valb) & 0x3F]);
      valb -= 6;
    }
  }
  if (valb > -6) out.push_back(lookup[((val << 8) >> (valb + 8)) & 0x3F]);
  while (out.size() % 4) out.push_back('=');
  return out;
}

bool Auth::loadCredentials(const std::string& path) {
  std::ifstream authFile(path);
  if (authFile.is_open()) {
    std::string line;
    if (std::getline(authFile, line)) {
      // Trim whitespace/newline
      line.erase(line.find_last_not_of(" \n\r\t") + 1);
      m_expectedAuthHeader = "Basic " + base64_encode(line);
      return true;
    }
    authFile.close();
  } else {
    std::cerr << "[Error] Could not open credentials file: " << path
              << std::endl;
  }
  return false;
}

bool Auth::isAuthorized(const HTTPServer::HttpRequest& req) const {
  auto it = req.headers.find("authorization");
  if (it != req.headers.end() && !it->second.empty()) {
    return it->second[0] == m_expectedAuthHeader;
  }
  return false;
}

}  // namespace HTTPServerMetricsDashboard