CLANG_FORMAT ?= clang-format

.PHONY: all backend frontend clean run format format-check

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
