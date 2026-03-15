.PHONY: all backend frontend clean run

all: frontend backend

backend:
	mkdir -p build && cd build && cmake ../backend && make

frontend:
	cd frontend && npm install && npm run build

run: all
	./build/dashboard_server

clean:
	rm -rf build frontend/dist frontend/node_modules
