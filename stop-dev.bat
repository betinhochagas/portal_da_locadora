@echo off
echo ========================================
echo  Portal da Locadora - Parar Ambiente
echo ========================================
echo.

echo [1/2] Parando containers do Docker...
docker-compose down
if errorlevel 1 (
    echo [ERRO] Falha ao parar containers
    pause
    exit /b 1
)
echo [OK] Containers parados
echo.

echo [2/2] Encerrando processos Node.js...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo [INFO] Nenhum processo Node.js encontrado
) else (
    echo [OK] Processos Node.js encerrados
)
echo.

echo ========================================
echo  Ambiente parado com sucesso!
echo ========================================
echo.
pause
