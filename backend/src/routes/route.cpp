#include "route.h"

namespace HTTPServerMetricsDashboard {

Route::Route(const std::string& method, const std::string& path)
    : method(std::move(method)), path(std::move(path)) {}

std::string_view Route::getMethod() const { return method; }

std::string_view Route::getPath() const { return path; }

}  // namespace HTTPServerMetricsDashboard