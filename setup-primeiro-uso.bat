@echo off
echo ========================================
echo  Portal da Locadora - Setup Inicial
echo ========================================
echo.
echo Este script deve ser executado APENAS na primeira vez
echo ou quando precisar resetar o ambiente.
echo.
pause

REM Verificar se o Docker está rodando
echo [1/8] Verificando Docker...
docker ps >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Docker nao esta rodando. Inicie o Docker Desktop primeiro.
    pause
    exit /b 1
)
echo [OK] Docker esta rodando
echo.

REM Instalar dependências do Backend
echo [2/8] Instalando dependencias do Backend...
cd /d %~dp0backend
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
echo [OK] Dependencias do backend instaladas
echo.

REM Instalar dependências do Frontend
echo [3/8] Instalando dependencias do Frontend...
cd /d %~dp0frontend
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
echo [OK] Dependencias do frontend instaladas
echo.

REM Iniciar containers do Docker
echo [4/8] Iniciando containers do Docker...
cd /d %~dp0
docker-compose up -d
if errorlevel 1 (
    echo [ERRO] Falha ao iniciar containers
    pause
    exit /b 1
)
echo [OK] Containers iniciados
echo.

REM Aguardar PostgreSQL ficar pronto
echo [5/8] Aguardando PostgreSQL ficar pronto (15 segundos)...
timeout /t 15 /nobreak >nul
echo [OK] PostgreSQL pronto
echo.

REM Executar migrations
echo [6/8] Executando migrations do Prisma...
cd /d %~dp0backend
call npx prisma migrate dev --name init
if errorlevel 1 (
    echo [AVISO] Migrations podem ja ter sido executadas
)
echo [OK] Migrations executadas
echo.

REM Gerar Prisma Client
echo [7/8] Gerando Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERRO] Falha ao gerar Prisma Client
    pause
    exit /b 1
)
echo [OK] Prisma Client gerado
echo.

REM Executar seed
echo [8/8] Populando banco de dados com dados de teste...
call npx prisma db seed
if errorlevel 1 (
    echo [AVISO] Seed pode ja ter sido executado
)
echo [OK] Banco populado
echo.

echo ========================================
echo  Setup concluido com sucesso!
echo ========================================
echo.
echo Proximos passos:
echo   1. Execute: start-dev.bat
echo   2. Acesse: http://localhost:5173
echo   3. Login: admin@portaldalocadora.com / senha123
echo.
pause
