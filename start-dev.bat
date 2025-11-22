@echo off
echo ========================================
echo  Portal da Locadora - Iniciar Ambiente
echo ========================================
echo.

REM Verificar se o Docker está rodando
echo [1/5] Verificando Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando. Inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)
echo [OK] Docker esta rodando
echo.

REM Iniciar containers do Docker
echo [2/5] Iniciando containers do Docker...
docker-compose up -d
if errorlevel 1 (
    echo [ERRO] Falha ao iniciar containers
    pause
    exit /b 1
)
echo [OK] Containers iniciados
echo.

REM Aguardar PostgreSQL ficar pronto
echo [3/5] Aguardando PostgreSQL ficar pronto...
timeout /t 5 /nobreak >nul
echo [OK] PostgreSQL pronto
echo.

REM Iniciar Backend em uma nova janela
echo [4/5] Iniciando Backend (NestJS)...
start "Backend - NestJS" cmd /k "cd /d %~dp0backend && npm run start:dev"
echo [OK] Backend iniciando em nova janela...
echo.

REM Aguardar backend iniciar
echo Aguardando backend inicializar (10 segundos)...
timeout /t 10 /nobreak >nul

REM Iniciar Frontend em uma nova janela
echo [5/5] Iniciando Frontend (React + Vite)...
start "Frontend - React" cmd /k "cd /d %~dp0frontend && npm run dev"
echo [OK] Frontend iniciando em nova janela...
echo.

echo ========================================
echo  Ambiente iniciado com sucesso!
echo ========================================
echo.
echo Backend:  http://localhost:3000/api/v1
echo Frontend: http://localhost:5173
echo PgAdmin:  http://localhost:5050
echo.
echo Credenciais de login:
echo   Email: admin@portaldalocadora.com
echo   Senha: senha123
echo.
echo Pressione qualquer tecla para fechar esta janela...
echo (Os servidores continuarao rodando nas outras janelas)
pause >nul
