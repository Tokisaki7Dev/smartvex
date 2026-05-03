.PHONY: dev build stop clean help

help:
	@echo "SmartVex Management Commands:"
	@echo "  make dev      Start all services in development mode"
	@echo "  make build    Rebuild all docker containers"
	@echo "  make stop     Stop all running services"
	@echo "  make clean    Remove all containers and volumes"

dev:
	docker-compose -f docker/docker-compose.yml up

build:
	docker-compose -f docker/docker-compose.yml build

stop:
	docker-compose -f docker/docker-compose.yml stop

clean:
	docker-compose -f docker/docker-compose.yml down -v
