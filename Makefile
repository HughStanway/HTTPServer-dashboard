CLANG_FORMAT ?= clang-format

.PHONY: all backend frontend clean run format format-check docker-build docker-up docker-down docker-deploy

all: frontend backend

backend:
	mkdir -p build && cd build && cmake ../backend && make

frontend:
	cd frontend && npm install && npm run build

run: all
	./build/dashboard_server

clean:
	rm -rf build frontend/dist frontend/node_modules

format:
	@find backend -type f \( -name "*.cpp" -o -name "*.h" \) \
	-exec $(CLANG_FORMAT) -i {} +

format-check:
	@find backend -type f \( -name "*.cpp" -o -name "*.h" \) \
	-exec $(CLANG_FORMAT) --dry-run --Werror {} +

deploy:
	./scripts/docker.sh

install-service:
	@if [ "$$(uname -s)" != "Linux" ]; then \
		echo "Error: This target is only supported on Linux (Ubuntu Server). Detected OS: $$(uname -s)"; \
		exit 1; \
	fi
	@echo "Installing systemd service..."
	sudo cp scripts/dashboard-server.service /etc/systemd/system/
	sudo systemctl daemon-reload
	sudo systemctl enable dashboard-server
	@echo "--------------------------------------------------------"
	@echo "Service installed and enabled."
	@echo "IMPORTANT: Edit /etc/systemd/system/dashboard-server.service"
	@echo "to set the correct User and WorkingDirectory."
	@echo "Then run: sudo systemctl restart dashboard-server"
	@echo "--------------------------------------------------------"

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-deploy:
	./scripts/deploy_docker.sh
