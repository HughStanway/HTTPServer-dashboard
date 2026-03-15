cmake_minimum_required(VERSION 3.15)
project(HTTPServerDashboard)

set(CMAKE_CXX_STANDARD 20)

find_package(HttpServer REQUIRED)

add_executable(dashboard_server src/main.cpp src/auth.cpp)

target_include_directories(dashboard_server PRIVATE
    /opt/homebrew/include
)

target_link_libraries(dashboard_server PRIVATE
    HttpServer::httpserver_lib
)