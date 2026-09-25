# ==============================================================================
# CHAKRA CLICKER - DEV RUNNER ORCHESTRATOR MAKEFILE
# ==============================================================================

.PHONY: all run dev setup install front back clean clean-all kill help

# Detect Operating System
ifeq ($(OS),Windows_NT)
	DETECTED_OS := Windows
	VENV_DIR := .venv
	PYTHON := $(VENV_DIR)/Scripts/python.exe
	PIP := $(VENV_DIR)/Scripts/pip.exe
	NPM := npm.cmd
	NPX := npx.cmd
	SYSTEM_PYTHON := python
	KILL_PORTS := powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5000,5173 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $$_.OwningProcess -Force -ErrorAction SilentlyContinue }"
	OPEN_BROWSER := powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process 'http://localhost:5173'"
	CLEAN_FILES := powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist, .vite, __pycache__, scripts/__pycache__"
	CLEAN_ALL_FILES := powershell -NoProfile -ExecutionPolicy Bypass -Command "Remove-Item -Recurse -Force -ErrorAction SilentlyContinue dist, .vite, node_modules, .venv, __pycache__, scripts/__pycache__"
	SET_PATH := set "PATH=$(CURDIR)/$(VENV_DIR)/Scripts;$(PATH)" &&
	MKVENV := if not exist "$(VENV_DIR)\Scripts\python.exe" ($(SYSTEM_PYTHON) -m venv $(VENV_DIR))
	MKNPM := if not exist "node_modules" ($(NPM) install)
else
	DETECTED_OS := $(shell uname -s)
	VENV_DIR := .venv
	PYTHON := $(VENV_DIR)/bin/python
	PIP := $(VENV_DIR)/bin/pip
	NPM := npm
	NPX := npx
	SYSTEM_PYTHON := python3
	KILL_PORTS := sh -c 'for p in 5000 5173; do pids=$$(lsof -ti:$$p 2>/dev/null || true); [ -n "$$pids" ] && kill -9 $$pids 2>/dev/null || true; done'
	ifeq ($(DETECTED_OS),Darwin)
		OPEN_BROWSER := open http://localhost:5173
	else
		OPEN_BROWSER := xdg-open http://localhost:5173 2>/dev/null || true
	endif
	CLEAN_FILES := rm -rf dist .vite __pycache__ scripts/__pycache__
	CLEAN_ALL_FILES := rm -rf dist .vite node_modules .venv __pycache__ scripts/__pycache__
	SET_PATH := PATH="$(CURDIR)/$(VENV_DIR)/bin:$$PATH"
	MKVENV := if [ ! -d "$(VENV_DIR)" ]; then $(SYSTEM_PYTHON) -m venv $(VENV_DIR); fi
	MKNPM := if [ ! -d "node_modules" ]; then $(NPM) install; fi
endif

all: run

## setup / install: Cria o ambiente virtual e instala dependências Python e Node.js
setup: install

install:
	@echo "[+] Preparando ambiente ($(DETECTED_OS))..."
	@$(MKVENV)
	@echo "[*] Instalando requisitos Python (requirements.txt)..."
	@$(PIP) install -r requirements.txt --quiet
	@$(MKNPM)
	@echo "[OK] Ambiente configurado com sucesso!"

## kill: Força o encerramento de processos travados nas portas 5000 e 5173
kill:
	@echo "[*] Verificando e liberando portas 5000 e 5173..."
	@$(KILL_PORTS)
	@echo "[+] Portas 5000 e 5173... Limpas"

## run / dev: Prepara o ambiente e sobe Frontend + Backend com concurrently
dev: run

run: kill setup
	@echo "======================================================="
	@echo "             CHAKRA CLICKER - DEV RUNNER               "
	@echo "======================================================="
	@echo "[+] Verificando ambiente Python e Node.js... OK"
	@echo "[+] Verificando portas 5000 e 5173... Limpas"
	@echo "[>] Backend Flask rodando em:  http://localhost:5000"
	@echo "[>] Frontend Vite rodando em:   http://localhost:5173"
	@echo "-------------------------------------------------------"
	@echo "Pressione [Ctrl + C] para encerrar todos os servidores."
	@echo "======================================================="
	@$(SET_PATH) $(NPX) concurrently -k -n "BACKEND,FRONTEND" -c "cyan,magenta" "$(PYTHON) script.py" "$(NPM) run dev"

## front: Executa exclusivamente o servidor frontend Vite
front:
	@echo "[>] Iniciando servidor Frontend Vite (http://localhost:5173)..."
	@$(NPM) run dev

## back: Executa exclusivamente a API Flask com o ambiente virtual
back:
	@echo "[>] Iniciando API Flask (http://localhost:5000)..."
	@$(PYTHON) script.py

## clean: Remove caches temporarios (__pycache__, .vite, dist)
clean:
	@echo "[*] Removendo caches temporarios e build artifacts..."
	@$(CLEAN_FILES)
	@echo "[OK] Caches limpos!"

## clean-all: Remove caches, node_modules e .venv
clean-all: clean
	@echo "[*] Removendo node_modules e .venv..."
	@$(CLEAN_ALL_FILES)
	@echo "[OK] Limpeza completa concluida!"

## help: Exibe o menu com todos os comandos disponiveis
help:
	@echo "======================================================="
	@echo "          CHAKRA CLICKER - MANUAL DO ORQUESTRADOR      "
	@echo "======================================================="
	@echo "Comandos disponiveis:"
	@echo "  make run        - Inicia Frontend e Backend em paralelo (Padrao)"
	@echo "  make setup      - Cria .venv e instala dependencias (npm & pip)"
	@echo "  make front      - Inicia apenas o frontend Vite (porta 5173)"
	@echo "  make back       - Inicia apenas o backend Flask (porta 5000)"
	@echo "  make kill       - Finaliza processos zumbis nas portas 5000 e 5173"
	@echo "  make clean      - Limpa caches (.vite, __pycache__, dist)"
	@echo "  make clean-all  - Limpa caches, node_modules e .venv"
	@echo "  make help       - Exibe este menu de ajuda"
	@echo "======================================================="
