#!/usr/bin/env bash

# Chakra Clicker - Dev Runner Orchestrator (Linux / macOS / WSL)
set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR"

# Cores ANSI
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

# Limpeza e encerramento elegante
cleanup() {
    echo ""
    echo -e "${YELLOW}[!] Encerrando processos e liberando portas 5000 e 5173...${NC}"
    for port in 5000 5173; do
        if command -v lsof >/dev/null 2>&1; then
            pids=$(lsof -ti :"$port" 2>/dev/null || true)
            if [ -n "$pids" ]; then
                kill -9 $pids 2>/dev/null || true
            fi
        elif command -v fuser >/dev/null 2>&1; then
            fuser -k "${port}/tcp" 2>/dev/null || true
        fi
    done
    echo -e "${GREEN}[OK] Sessao encerrada com sucesso.${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo -e "${CYAN}=======================================================${NC}"
echo -e "${BOLD}${MAGENTA}             CHAKRA CLICKER - DEV RUNNER               ${NC}"
echo -e "${CYAN}=======================================================${NC}"

# 1. Verificacao de dependencias no PATH
if command -v python3 >/dev/null 2>&1; then
    PYTHON_CMD="python3"
elif command -v python >/dev/null 2>&1; then
    PYTHON_CMD="python"
else
    echo -e "${RED}[ERRO] Python 3 nao foi encontrado no PATH.${NC}"
    exit 1
fi

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}[ERRO] Node.js nao foi encontrado no PATH.${NC}"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}[ERRO] npm nao foi encontrado no PATH.${NC}"
    exit 1
fi

echo -e "${GREEN}[+] Verificando ambiente Python e Node.js... OK${NC}"

# 2. Limpeza de processos zumbis
for port in 5000 5173; do
    if command -v lsof >/dev/null 2>&1; then
        pids=$(lsof -ti :"$port" 2>/dev/null || true)
        if [ -n "$pids" ]; then
            kill -9 $pids 2>/dev/null || true
        fi
    elif command -v fuser >/dev/null 2>&1; then
        fuser -k "${port}/tcp" 2>/dev/null || true
    fi
done

echo -e "${GREEN}[+] Verificando portas 5000 e 5173... Limpas${NC}"

# 3. Setup Virtualenv Python (.venv)
if [ ! -f ".venv/bin/python" ]; then
    echo -e "${YELLOW}[*] Criando ambiente virtual Python (.venv)...${NC}"
    "$PYTHON_CMD" -m venv .venv
    echo -e "${YELLOW}[*] Instalando dependencias Python em .venv...${NC}"
    .venv/bin/pip install -r requirements.txt --quiet
else
    if ! .venv/bin/python -c "import flask" 2>/dev/null; then
        echo -e "${YELLOW}[*] Instalando dependencias Python ausentes...${NC}"
        .venv/bin/pip install -r requirements.txt --quiet
    fi
fi

# 4. Setup Node.js (node_modules)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[*] Instalando dependencias Node.js (npm install)...${NC}"
    npm install
fi

# 5. Informacoes de execucao
echo -e "${CYAN}[>] Backend Flask rodando em:  http://localhost:5000${NC}"
echo -e "${MAGENTA}[>] Frontend Vite rodando em:   http://localhost:5173${NC}"
echo "-------------------------------------------------------"
echo -e "${BOLD}Pressione [Ctrl + C] para encerrar todos os servidores.${NC}"
echo -e "${CYAN}=======================================================${NC}"

# 6. Auto-launch do navegador em segundo plano
(sleep 3 && {
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:5173 >/dev/null 2>&1
    elif command -v open >/dev/null 2>&1; then
        open http://localhost:5173 >/dev/null 2>&1
    fi
}) &

# 7. Execucao unificada com prioridade para o .venv
export PATH="$SCRIPT_DIR/.venv/bin:$PATH"
npx concurrently -k -n "BACKEND,FRONTEND" -c "cyan,magenta" "python script.py" "npm run dev"
