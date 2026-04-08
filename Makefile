.PHONY: help install infra infra-down infra-clean infra-logs infra-status dev stop restart clean build lint test

ENV_FILE := env/.env.local
COMPOSE := docker compose --env-file $(ENV_FILE) -f docker/dev/docker-compose.infra.dev.yml

help:
	@echo "Goosee — commandes disponibles"
	@echo ""
	@echo "  make install        Installer toutes les dépendances (yarn)"
	@echo ""
	@echo "  make infra          Démarrer l'infra Docker (postgres x4, rabbitmq, minio, mailhog, adminer)"
	@echo "  make infra-down     Arrêter l'infra (volumes conservés)"
	@echo "  make infra-clean    Arrêter l'infra et SUPPRIMER les volumes (reset DB)"
	@echo "  make infra-logs     Suivre les logs de l'infra"
	@echo "  make infra-status   État des containers infra"
	@echo ""
	@echo "  make dev            Démarre l'infra puis lance tous les services en natif (turbo)"
	@echo "  make stop           Arrête tout (infra)"
	@echo "  make restart        Stop + dev"
	@echo "  make clean          Reset complet (infra + volumes)"
	@echo ""
	@echo "  make build          Build de tous les workspaces (turbo)"
	@echo "  make lint           Lint de tous les workspaces (turbo)"
	@echo "  make test           Tests de tous les workspaces (turbo)"

install:
	yarn install

infra:
	@if [ ! -f $(ENV_FILE) ]; then \
		echo "❌ $(ENV_FILE) introuvable. Copie env/.env.local.example vers env/.env.local"; \
		exit 1; \
	fi
	$(COMPOSE) up -d
	@echo "✅ Infra démarrée. Vérifie avec : make infra-status"

infra-down:
	$(COMPOSE) down

infra-clean:
	$(COMPOSE) down -v --remove-orphans

infra-logs:
	$(COMPOSE) logs -f

infra-status:
	$(COMPOSE) ps

dev: infra
	@echo "⏳ Attente que l'infra soit prête..."
	@sleep 3
	@echo "🚀 Démarrage des services natifs via turbo..."
	yarn dev

stop: infra-down

restart: stop dev

clean: infra-clean

build:
	yarn build

lint:
	yarn lint

test:
	yarn test
