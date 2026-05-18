#!/bin/bash
# FGN Rehber - Docker Image Import & Run Script (Linux)
#
# Bu scripti, tar dosyalarinin oldugu klasorden calistirin.
# Ornek:
#   chmod +x import-and-run.sh
#   sudo bash import-and-run.sh
#
# Gereksinim: Docker ve docker compose kurulu olmali.
#   Kontrol: docker --version && docker compose version

set -e

echo "==> Docker surumu kontrol ediliyor..."
docker --version
docker compose version

echo ""
echo "==> Image'lar yukleniyor..."
docker load -i fgn-api.tar
docker load -i fgn-client.tar
echo "==> MSSQL image yukleniyor (buyuk boyut, bekleniyor)..."
docker load -i mssql.tar

echo ""
echo "==> Servisler baslatiliyor (arka planda)..."
docker compose up -d

echo ""
echo "Tamamlandi!"
echo "Uygulama asagidaki adreslerden erisilebilir olmali:"
echo "  http://<SUNUCU_IP>          (direkt IP ile)"
echo "  http://rehber.fergani.space  (DNS yonlendirmesi yapildiktan sonra)"
echo ""
echo "Servislerin durumunu kontrol etmek icin:"
echo "  docker compose ps"
echo "  docker compose logs -f"
