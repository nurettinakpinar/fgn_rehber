# FGN Rehber - Docker Image Export Script (Windows)
# Bu script'i projenin FGN_WEB_REHBER klasöründen çalıştırın.
#
# Kullanım:
#   cd FGN_WEB_REHBER
#   .\deploy\export-images.ps1

$ErrorActionPreference = "Stop"
$outputDir = Join-Path $PSScriptRoot "output"

if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
}

Write-Host "==> Docker image'lari build ediliyor..." -ForegroundColor Cyan
docker compose build
if ($LASTEXITCODE -ne 0) { throw "docker compose build basarisiz oldu." }

Write-Host ""
Write-Host "==> Image adlari docker compose images ile tespit ediliyor..." -ForegroundColor Cyan

$composeImages = docker compose images
$apiImage    = ($composeImages | Select-String "api"    | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)
$clientImage = ($composeImages | Select-String "client" | ForEach-Object { ($_ -split "\s+")[1] } | Select-Object -First 1)

if (-not $apiImage) {
    $projectName = (Split-Path -Leaf (Get-Location)).ToLower()
    $apiImage    = "${projectName}-api"
    $clientImage = "${projectName}-client"
}

$mssqlImage = "mcr.microsoft.com/mssql/server:2022-latest"

Write-Host "    API    : $apiImage"
Write-Host "    Client : $clientImage"
Write-Host "    MSSQL  : $mssqlImage"
Write-Host ""

# MSSQL image'ini Docker content store'a tam olarak yerlestirmek icin
# once pull et (zaten varsa hizlica atlar), sonra save et
Write-Host "==> MSSQL image pull ediliyor (content store'a tam yerlessin diye)..." -ForegroundColor Yellow
docker pull $mssqlImage
if ($LASTEXITCODE -ne 0) { throw "MSSQL image pull basarisiz." }

Write-Host ""
Write-Host "==> API image kaydediliyor    -> output\fgn-api.tar" -ForegroundColor Yellow
docker save $apiImage -o "$outputDir\fgn-api.tar"

Write-Host "==> Client image kaydediliyor -> output\fgn-client.tar" -ForegroundColor Yellow
docker save $clientImage -o "$outputDir\fgn-client.tar"

Write-Host "==> MSSQL image kaydediliyor  -> output\mssql.tar  (biraz zaman alabilir)" -ForegroundColor Yellow
docker save $mssqlImage -o "$outputDir\mssql.tar"

# ---------------------------------------------------------------
# Sunucuda build gerekmeden calisacak docker-compose.prod.yml üret
# build: direktifleri kaldirilir, image: adlari eklenir
# ---------------------------------------------------------------
Write-Host ""
Write-Host "==> Sunucu icin docker-compose.prod.yml olusturuluyor..." -ForegroundColor Cyan

$prodCompose = @"
services:
  mssql:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: mssql_server
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourPassword123!
    ports:
      - "1433:1433"
    volumes:
      - mssql_data:/var/opt/mssql
    networks:
      - appnet

  api:
    image: ${apiImage}:latest
    container_name: dotnet_api
    environment:
      - ASPNETCORE_URLS=http://+:8080
      - Cors__AllowedOrigins=http://localhost
    ports:
      - "8080:8080"
    depends_on:
      - mssql
    networks:
      - appnet

  client:
    image: ${clientImage}:latest
    container_name: react_client
    ports:
      - "80:80"
    depends_on:
      - api
    networks:
      - appnet

networks:
  appnet:
    driver: bridge

volumes:
  mssql_data:
"@

$prodCompose | Out-File -FilePath "$outputDir\docker-compose.yml" -Encoding utf8

Write-Host "==> import-and-run.sh kopyalaniyor..." -ForegroundColor Cyan
Copy-Item -Path (Join-Path $PSScriptRoot "import-and-run.sh") -Destination "$outputDir\import-and-run.sh" -Force

Write-Host ""
Write-Host "Tamamlandi! Asagidaki dosyalari USB ile sunucuya tasiniz:" -ForegroundColor Green
Get-ChildItem $outputDir | ForEach-Object { Write-Host "  $($_.FullName)" }
Write-Host ""
Write-Host "Sunucuda: bash import-and-run.sh" -ForegroundColor Green
