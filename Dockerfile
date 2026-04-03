# Stage 1: Frontend Builder
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Library Builder
FROM ubuntu:24.04 AS lib-builder
RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    build-essential \
    git \
    sudo \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /tmp
RUN git clone https://github.com/HughStanway/HTTPServer.git
WORKDIR /tmp/HTTPServer
RUN if [ -f "scripts/install_library.sh" ]; then \
        chmod +x scripts/install_library.sh && ./scripts/install_library.sh; \
    else \
        cmake -B build -G Ninja -DCMAKE_BUILD_TYPE=Release \
        && cmake --build build \
        && cmake --install build; \
    fi

# Stage 3: Backend Builder
FROM ubuntu:24.04 AS backend-builder
RUN apt-get update && apt-get install -y \
    cmake \
    ninja-build \
    build-essential \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed library from lib-builder
COPY --from=lib-builder /usr/local/include/httpserver /usr/local/include/httpserver
COPY --from=lib-builder /usr/local/include/httpserver_impl /usr/local/include/httpserver_impl
COPY --from=lib-builder /usr/local/lib/libhttpserver_lib.a /usr/local/lib/libhttpserver_lib.a
COPY --from=lib-builder /usr/local/lib/cmake/HttpServer /usr/local/lib/cmake/HttpServer

WORKDIR /app
COPY backend/ ./backend/
RUN cmake -B build -S backend -G Ninja -DCMAKE_BUILD_TYPE=Release \
    && cmake --build build

# Stage 4: Runtime
FROM ubuntu:24.04 AS runtime
RUN apt-get update && apt-get install -y \
    libstdc++6 \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy binary
COPY --from=backend-builder /app/build/dashboard_server ./
RUN chmod +x dashboard_server

# Copy frontend assets
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Copy config
COPY backend/src/config.toml ./config.toml

# Copy credentials
COPY --from=backend-builder /app/backend/src/credentials ./credentials

# Expose listening port
EXPOSE 3000

CMD ["./dashboard_server"]
