#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLIENT_DIR="$ROOT_DIR/client"
SERVER_DIR="$ROOT_DIR/server"
DIST_DIR="/var/www/postalcard/client-dist"

DOMAIN="${DOMAIN:-}"
TLS="${TLS:-0}"

print_usage() { echo "Usage: DOMAIN=your.domain TLS=1 ./deploy_prod.sh"; }

echo "Starting deployment..."

# 1) Build frontend
echo "Building frontend..."
cd "$CLIENT_DIR"
if command -v npm >/dev/null 2>&1; then
  npm ci --silent
  npm run build --silent
else
  echo "Error: npm not found" >&2; exit 1
fi

# 2) Publish frontend artifacts to web root
echo "Publishing frontend to $DIST_DIR..."
sudo mkdir -p "$DIST_DIR"
sudo rm -rf "$DIST_DIR"/*
sudo cp -r "$CLIENT_DIR/dist/." "$DIST_DIR"/
sudo chown -R www-data:www-data "$DIST_DIR"

# 3) Prepare backend (server)
echo "Installing server dependencies..."
cd "$SERVER_DIR"
if [ -f "package.json" ]; then
  if command -v npm >/dev/null 2>&1; then
    npm ci --silent
  fi
fi

# 4) Ensure environment config exists in production
ENV_FILE="$SERVER_DIR/.env"
if [ -f "$ENV_FILE" ]; then
  echo "Using production env at $ENV_FILE"
else
  echo "Warning: No production env found at $ENV_FILE. Create one with DB credentials and JWT_SECRET."
fi

# 5) Create systemd service for the API (if not exists)
SERVICE_NAME="postalcard-api"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"

if [ ! -f "$SERVICE_FILE" ]; then
  echo "Creating systemd service for API..."
  sudo tee "$SERVICE_FILE" >/dev/null <<'EOF'
[Unit]
Description=PostalCard API
After=network.target

[Service]
WorkingDirectory=SERVER_DIR
ExecStart=/usr/bin/node SERVER_DIR/index.js
Restart=on-failure
User=www-data
Environment=NODE_ENV=production
EnvironmentFile=SERVER_DIR/.env

[Install]
WantedBy=multi-user.target
EOF
  # Replace placeholders
  sudo sed -i "s|SERVER_DIR|$SERVER_DIR|g" "$SERVICE_FILE"
fi

sudo systemctl daemon-reload
sudo systemctl enable "$SERVICE_NAME"
sudo systemctl restart "$SERVICE_NAME" || true

# 6) Nginx configuration (static frontend + API proxy)
NGINX_SITE="/etc/nginx/sites-available/postalcard"
sudo rm -f "$NGINX_SITE"
sudo tee "$NGINX_SITE" >/dev/null <<'EOF'
server {
  listen 80;
  server_name DOMAIN_PLACEHOLDER;

  root DIST_DIR_PLACEHOLDER;
  index index.html;

  location / {
    try_files $uri /index.html;
    expires 1y;
    add_header Cache-Control "public, max-age=31536000, immutable";
  }

  location /api/ {
    proxy_pass http://127.0.0.1:5000/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
EOF
sudo sed -i "s|DOMAIN_PLACEHOLDER|$DOMAIN|g" "$NGINX_SITE"
sudo sed -i "s|DIST_DIR_PLACEHOLDER|$DIST_DIR|g" "$NGINX_SITE"
sudo ln -sf "$NGINX_SITE" /etc/nginx/sites-enabled/postalcard
sudo nginx -t
sudo systemctl reload nginx

# 7) TLS optional
if [ "$TLS" == "1" ]; then
  if command -v certbot >/dev/null 2>&1; then
    sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN"
  else
    echo "Certbot not installed. Skipping TLS setup."
  fi
fi

# 8) Firewall (basic)
if command -v ufw >/dev/null 2>&1; then
  sudo ufw allow 'Nginx Full'
  sudo ufw --force enable || true
fi

echo "Deployment completed."
echo "Verify at http://$DOMAIN and API at http://$DOMAIN/api/..."
exit 0
