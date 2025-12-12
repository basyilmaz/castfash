@echo off
echo ==========================================
echo   CastFash - Hostinger VPS'e Gonder
echo ==========================================
echo.

set SERVER=root@31.220.111.123
set DEST=/opt/castfash

echo [1/3] Dosyalar sunucuya kopyalaniyor...
echo Bu islem birkac dakika surebilir...
echo.

REM Ana dosyalari kopyala
scp -r backend %SERVER%:%DEST%/
scp -r frontend %SERVER%:%DEST%/
scp docker-compose.yml %SERVER%:%DEST%/
scp -r deploy %SERVER%:%DEST%/

echo.
echo [2/3] Deploy scripti calistiriliyor...
echo.

ssh %SERVER% "cd %DEST% && cp deploy/.env.production .env && chmod +x deploy/deploy.sh && ./deploy/deploy.sh"

echo.
echo ==========================================
echo   Deployment Tamamlandi!
echo ==========================================
echo.
echo Frontend: http://31.220.111.123:3000
echo Backend:  http://31.220.111.123:3002
echo API Docs: http://31.220.111.123:3002/api/docs
echo.
pause
