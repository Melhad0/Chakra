@echo off
setlocal enabledelayedexpansion

title Chakra Clicker - Dev Runner Orchestrator
cd /d "%~dp0"

echo =======================================================
echo              CHAKRA CLICKER - DEV RUNNER
echo =======================================================

:: 1. Verificacao de ferramentas no PATH
where python >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Python nao foi encontrado no PATH do sistema!
    echo        Instale o Python 3: https://www.python.org/
    echo        Marque a opcao "Add Python to PATH" durante a instalacao.
    echo =======================================================
    pause
    exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
    echo [ERRO] Node.js nao foi encontrado no PATH do sistema!
    echo        Instale o Node.js LTS: https://nodejs.org/
    echo =======================================================
    pause
    exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
    echo [ERRO] npm nao foi encontrado no PATH do sistema!
    echo =======================================================
    pause
    exit /b 1
)

echo [+] Verificando ambiente Python e Node.js... OK

:: 2. Limpeza de processos zumbis nas portas 5000 e 5173
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo [+] Verificando portas 5000 e 5173... Limpas

:: 3. Zero-Configuration Setup: Python Virtualenv (.venv)
if not exist ".venv\Scripts\python.exe" (
    echo [*] Ambiente virtual Python ausente. Criando .venv...
    python -m venv .venv
    echo [*] Instalando dependencias Python em .venv...
    call .venv\Scripts\pip.exe install -r requirements.txt --quiet
) else (
    if not exist ".venv\Lib\site-packages\flask" (
        echo [*] Instalando dependencias Python pendentes...
        call .venv\Scripts\pip.exe install -r requirements.txt --quiet
    )
)

:: 4. Zero-Configuration Setup: Node.js (node_modules)
if not exist "node_modules" (
    echo [*] Dependencias Node.js ausentes. Executando npm install...
    call npm.cmd install
)

:: 5. Informacoes de execucao e abertura automatica do navegador
echo [^>] Backend Flask rodando em:  http://localhost:5000
echo [^>] Frontend Vite rodando em:   http://localhost:5173
echo -------------------------------------------------------
echo Pressione [Ctrl + C] para encerrar todos os servidores.
echo =======================================================

:: Auto-launch do navegador em segundo plano apos 3 segundos (sem quebrar redirecionamento)
start "" /b cmd /c "ping -n 4 127.0.0.1 >nul & start http://localhost:5173"

:: 6. Prioriza o Python do ambiente virtual
set "PATH=%~dp0.venv\Scripts;%PATH%"

:: 7. Execucao unificada com concurrently
call npx.cmd concurrently -k -n "BACKEND,FRONTEND" -c "cyan,magenta" "python script.py" "npm.cmd run dev"

:: 8. Limpeza final ao sair
echo.
echo [*] Encerrando conexoes e liberando portas...
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5000 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)
for /f "tokens=5" %%a in ('netstat -aon 2^>nul ^| findstr ":5173 " ^| findstr "LISTENING"') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo [OK] Sessao finalizada com sucesso.
