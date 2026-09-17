#!/usr/bin/env bash
#
# TechHowDaily — full stack provisioning, one run.
#
#   WordPress (headless, port 8080)  +  Next.js front end (port 80)
#   + nginx + MariaDB + PHP + Node + systemd + CI/CD deploy hook
#
# Usage on the VM:
#     chmod +x setup.sh
#     ./setup.sh
#
# Safe to re-run. Steps that are already done are skipped.
# Everything it generates is printed at the end and saved to
# /var/www/CREDENTIALS.txt (readable only by you).

set -euo pipefail

# ─────────────────────────────────────────────────────────── settings ──
REPO_URL="${REPO_URL:-https://github.com/muhammad-shoaib-ali/thd.git}"
WP_DIR="/var/www/wp"
APP_DIR="/var/www/thd"
DB_NAME="thd_wp"
DB_USER="thd_wp"
CRED_FILE="/var/www/CREDENTIALS.txt"

say()  { printf "\n\033[1;36m==> %s\033[0m\n" "$*"; }
ok()   { printf "    \033[0;32m✓\033[0m %s\n" "$*"; }
warn() { printf "    \033[0;33m!\033[0m %s\n" "$*"; }
die()  { printf "\n\033[0;31mFAILED: %s\033[0m\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] && die "Run as ubuntu, not root. The script uses sudo where needed."
sudo -v || die "This needs sudo."

# ────────────────────────────────────────────────────────── 0. inputs ──
say "Gathering settings"

PUBLIC_IP="$(curl -s -m 10 https://api.ipify.org || true)"
if [[ -z "$PUBLIC_IP" ]]; then
  read -rp "    Could not detect the public IP. Enter it: " PUBLIC_IP
fi
ok "Public IP: $PUBLIC_IP"

read -rp "    WordPress admin username [shoaib]: " WP_ADMIN
WP_ADMIN="${WP_ADMIN:-shoaib}"
read -rp "    WordPress admin email: " WP_EMAIL
[[ -z "$WP_EMAIL" ]] && die "An email is required."
read -rsp "    WordPress admin password (hidden): " WP_PASS; echo
[[ ${#WP_PASS} -lt 8 ]] && die "Use at least 8 characters."

# Generated, never typed, never in chat or git.
DB_PASS="$(openssl rand -base64 24 | tr -d '/+=' | head -c 28)"
REVALIDATE_SECRET="$(openssl rand -hex 32)"

SITE_URL="http://${PUBLIC_IP}"
WP_URL="http://${PUBLIC_IP}:8080"

# ───────────────────────────────────────────────────────── 1. firewall ──
say "Opening ports 80 and 8080 on the instance"
for port in 80 8080; do
  if sudo iptables -C INPUT -p tcp --dport "$port" -m state --state NEW -j ACCEPT 2>/dev/null; then
    ok "port $port already allowed"
  else
    sudo iptables -I INPUT 1 -p tcp --dport "$port" -m state --state NEW -j ACCEPT
    ok "port $port opened"
  fi
done
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq iptables-persistent >/dev/null 2>&1 || true
sudo netfilter-persistent save >/dev/null
ok "rules saved (survive reboot)"
warn "The Oracle CONSOLE also needs ingress rules for 80 and 8080."
warn "VCN > Subnets > Security Lists > Default > Add Ingress Rules"

# ───────────────────────────────────────────────────────────── 2. swap ──
say "Swap"
if swapon --show | grep -q /swapfile; then
  ok "already present"
else
  sudo fallocate -l 4G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile >/dev/null
  sudo swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
  ok "4G swap added"
fi

# ───────────────────────────────────────────────────────── 3. packages ──
say "Installing packages"
sudo apt-get update -qq

# This VM is Ubuntu 26.04 "resolute", which has no php8.3. Detect whatever
# PHP the distro actually ships rather than hardcoding a version.
PHPV="$(apt-cache search --names-only '^php[0-9]+\.[0-9]+-fpm$' \
        | grep -o 'php[0-9]\+\.[0-9]\+' | sort -V | tail -1)"
[[ -z "$PHPV" ]] && die "No PHP FPM package found in the archive."
ok "PHP package family: $PHPV"

sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq \
  nginx mariadb-server unzip curl git rsync \
  "${PHPV}-fpm" "${PHPV}-mysql" "${PHPV}-curl" "${PHPV}-gd" \
  "${PHPV}-mbstring" "${PHPV}-xml" "${PHPV}-zip" "${PHPV}-intl" \
  || die "Package install failed."
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y -qq "${PHPV}-imagick" \
  || warn "imagick unavailable — WordPress will use GD instead, which is fine."

if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - >/dev/null
  sudo apt-get install -y -qq nodejs
fi
ok "node $(node -v)"
ok "php  $(php -v | head -1 | awk '{print $2}')"

PHP_SOCK="$(ls /run/php/*-fpm.sock 2>/dev/null | head -1)"
[[ -z "$PHP_SOCK" ]] && { sudo systemctl start "${PHPV}-fpm"; sleep 2; PHP_SOCK="$(ls /run/php/*-fpm.sock | head -1)"; }
[[ -z "$PHP_SOCK" ]] && die "PHP-FPM socket not found."
ok "PHP socket: $PHP_SOCK"

sudo systemctl enable --now nginx mariadb "${PHPV}-fpm" >/dev/null 2>&1

# ───────────────────────────────────────────────────────── 4. database ──
say "Database"
if sudo mysql -e "USE ${DB_NAME}" 2>/dev/null; then
  ok "database ${DB_NAME} already exists — keeping it and its password"
  DB_PASS="$(sudo grep -oP "define\(\s*'DB_PASSWORD',\s*'\K[^']+" ${WP_DIR}/wp-config.php 2>/dev/null || echo "$DB_PASS")"
else
  sudo mysql <<SQL
CREATE DATABASE ${DB_NAME} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
ALTER USER '${DB_USER}'@'localhost' IDENTIFIED BY '${DB_PASS}';
GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';
FLUSH PRIVILEGES;
SQL
  ok "database and user created"
fi

# ────────────────────────────────────────────────────────── 5. wp-cli ──
say "WP-CLI"
if ! command -v wp >/dev/null; then
  curl -sO https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar && sudo mv wp-cli.phar /usr/local/bin/wp
fi
ok "$(wp --version --allow-root 2>/dev/null | head -1)"
WP="sudo -u www-data wp --path=${WP_DIR}"

# ───────────────────────────────────────────────────── 6. the repository ──
say "Fetching the project"
if [[ -d "${APP_DIR}/.git" ]]; then
  sudo chown -R ubuntu:ubuntu "$APP_DIR"
  git -C "$APP_DIR" fetch origin main -q && git -C "$APP_DIR" reset --hard origin/main -q
  ok "repo updated"
else
  sudo mkdir -p "$APP_DIR" && sudo chown -R ubuntu:ubuntu "$APP_DIR"
  git clone -q "$REPO_URL" "$APP_DIR" || die "Clone failed. Is $REPO_URL public?"
  ok "repo cloned"
fi
[[ -f "${APP_DIR}/package.json" ]] || die "No package.json in the repo — wrong URL or empty repo."

# ─────────────────────────────────────────────────────── 7. wordpress ──
say "WordPress core"
sudo mkdir -p "$WP_DIR"
if [[ ! -f "${WP_DIR}/wp-load.php" ]]; then
  sudo -u www-data wp core download --path="$WP_DIR" --quiet || {
    sudo chown -R www-data:www-data "$WP_DIR"; sudo -u www-data wp core download --path="$WP_DIR" --quiet; }
  ok "core downloaded"
else
  ok "core already present"
fi
sudo chown -R www-data:www-data "$WP_DIR"

if [[ ! -f "${WP_DIR}/wp-config.php" ]]; then
  $WP config create --dbname="$DB_NAME" --dbuser="$DB_USER" --dbpass="$DB_PASS" \
     --dbhost=localhost --skip-check --quiet
  ok "wp-config.php created"
fi

# Headless settings. wp config set is idempotent, so re-running is safe.
$WP config set WP_HOME    "$WP_URL"  --type=constant --quiet
$WP config set WP_SITEURL "$WP_URL"  --type=constant --quiet
$WP config set THD_FRONTEND_URL     "$SITE_URL"                            --type=constant --quiet
$WP config set THD_REVALIDATE_URL   "http://127.0.0.1:3000/api/revalidate" --type=constant --quiet
$WP config set THD_REVALIDATE_SECRET "$REVALIDATE_SECRET"                  --type=constant --quiet
$WP config set DISALLOW_FILE_EDIT true  --raw --type=constant --quiet
$WP config set WP_MEMORY_LIMIT '256M'   --type=constant --quiet
ok "headless constants set"

# ────────────────────────────────────────────────── 8. nginx (both sites) ──
say "nginx"
sudo tee /etc/nginx/sites-available/wp >/dev/null <<EOF
server {
    listen 8080;
    server_name _;
    root ${WP_DIR};
    index index.php;
    client_max_body_size 64M;
    location / { try_files \$uri \$uri/ /index.php?\$args; }
    location ~ \.php\$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:${PHP_SOCK};
        fastcgi_read_timeout 120;
    }
    location ~* /(?:uploads|files)/.*\.php\$ { deny all; }
    location = /xmlrpc.php { deny all; }
}
EOF

sudo tee /etc/nginx/sites-available/thd >/dev/null <<'EOF'
server {
    listen 80 default_server;
    server_name _;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60;
    }
    location /_next/static/ {
        proxy_pass http://127.0.0.1:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
EOF

sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -sf /etc/nginx/sites-available/wp   /etc/nginx/sites-enabled/wp
sudo ln -sf /etc/nginx/sites-available/thd  /etc/nginx/sites-enabled/thd
sudo nginx -t >/dev/null 2>&1 || die "nginx config test failed. Run: sudo nginx -t"
sudo systemctl reload nginx
ok "both sites live"

# ──────────────────────────────────────────── 9. install WordPress itself ──
say "Installing WordPress"
if $WP core is-installed 2>/dev/null; then
  ok "already installed — skipping"
else
  $WP core install --url="$WP_URL" --title="TechHowDaily Admin" \
     --admin_user="$WP_ADMIN" --admin_password="$WP_PASS" \
     --admin_email="$WP_EMAIL" --skip-email --quiet
  ok "installed"
fi

say "Theme, plugins and settings"
sudo mkdir -p "${WP_DIR}/wp-content/mu-plugins"
sudo cp -f "${APP_DIR}/wordpress/mu-plugins/"*.php "${WP_DIR}/wp-content/mu-plugins/" 2>/dev/null \
  && ok "mu-plugins installed" || warn "no mu-plugins found in the repo"
sudo cp -rf "${APP_DIR}/wordpress/themes/thd-headless" "${WP_DIR}/wp-content/themes/" 2>/dev/null \
  && ok "headless theme copied" || warn "theme folder not found in the repo"
sudo chown -R www-data:www-data "${WP_DIR}/wp-content"

$WP theme activate thd-headless --quiet 2>/dev/null && ok "headless theme active" \
  || warn "could not activate the theme — check Appearance > Themes"
for t in $($WP theme list --status=inactive --field=name 2>/dev/null); do
  $WP theme delete "$t" --quiet 2>/dev/null || true
done

$WP plugin install wp-graphql --activate --quiet 2>/dev/null && ok "WPGraphQL active" \
  || warn "WPGraphQL install failed — add it from the admin"
$WP plugin install post-views-counter --activate --quiet 2>/dev/null && ok "Post Views Counter active" \
  || warn "views plugin failed — ticker will fall back to most-recent"

$WP rewrite structure '/%postname%/' --quiet
$WP rewrite flush --quiet
$WP option update blog_public 0 --quiet        # keep this subdomain out of Google
$WP option update default_comment_status closed --quiet
$WP option update timezone_string 'Asia/Karachi' --quiet
ok "permalinks, noindex, comments, timezone"

say "Categories and pages"
create_cat() {
  $WP term list category --field=slug | grep -qx "$2" \
    || $WP term create category "$1" --slug="$2" --description="$3" --quiet
}
create_cat "AI Tools" "ai-tools"  "Chat, agents, image, audio. Tested on real work, not demos."
create_cat "How-To"   "how-to"    "Step-by-step, with the version numbers we used."
create_cat "Apps"     "apps"      "Mobile and desktop, after a fortnight of real use."
create_cat "Software" "software"  "Installers, licences, and what the free tier actually gives you."
create_cat "Fixes"    "fixes"     "Error messages, decoded, with the fix that worked."
create_cat "Reviews"  "reviews"   "Bought, used, and reported honestly — including the returns."
ok "six categories"

# Make a real category the default, then remove Uncategorized. Posts in an
# unrouted category are dropped by the front end, so this matters.
AI_ID="$($WP term list category --slug=ai-tools --field=term_id | head -1)"
[[ -n "$AI_ID" ]] && $WP option update default_category "$AI_ID" --quiet
UNCAT="$($WP term list category --slug=uncategorized --field=term_id | head -1 || true)"
[[ -n "${UNCAT:-}" ]] && $WP term delete category "$UNCAT" --quiet 2>/dev/null && ok "Uncategorized removed"

for slug in about how-we-test contact write-for-us privacy terms disclaimer affiliate-disclosure corrections; do
  title="$(echo "$slug" | tr '-' ' ' | sed 's/\b\(.\)/\u\1/g')"
  $WP post list --post_type=page --field=post_name | grep -qx "$slug" \
    || $WP post create --post_type=page --post_status=publish \
         --post_title="$title" --post_name="$slug" \
         --post_content="<p>Write this page in WordPress. It is live at /${slug}/ on the site.</p>" --quiet
done
ok "nine pages"

if [[ "$($WP post list --post_type=post --post_status=publish --format=count)" == "0" ]]; then
  $WP post create --post_status=publish --post_title="Hello from WordPress" \
    --post_category="$AI_ID" \
    --post_content="<p>If you can read this on the front end, WordPress and Next.js are talking.</p><h2>A heading</h2><p>Replace this with a real guide.</p>" --quiet
  ok "one starter post created"
fi

# ─────────────────────────────────────────────────── 10. the front end ──
say "Building the front end"
cat > "${APP_DIR}/.env.production" <<EOF
WORDPRESS_GRAPHQL_ENDPOINT=${WP_URL}/graphql
NEXT_PUBLIC_SITE_URL=${SITE_URL}
REVALIDATE_SECRET=${REVALIDATE_SECRET}
WP_VIEWS_FIELD=views
EOF
chmod 600 "${APP_DIR}/.env.production"
ok ".env.production written"

cd "$APP_DIR"
npm ci --no-audit --no-fund
set -a; . "${APP_DIR}/.env.production"; set +a
npm run build || die "Build failed. Check the output above."
ok "built"

say "systemd service"
sudo tee /etc/systemd/system/thd.service >/dev/null <<EOF
[Unit]
Description=TechHowDaily Next.js
After=network.target nginx.service

[Service]
Type=simple
User=ubuntu
WorkingDirectory=${APP_DIR}
EnvironmentFile=${APP_DIR}/.env.production
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable thd >/dev/null 2>&1
sudo systemctl restart thd
sleep 6
systemctl is-active --quiet thd && ok "service running" || warn "service not running — sudo journalctl -u thd -n 40"

# ────────────────────────────────────────────────────────── 11. CI/CD ──
say "CI/CD deploy hook"
cat > "${APP_DIR}/deploy.sh" <<EOF
#!/bin/bash
set -e
cd ${APP_DIR}
git fetch origin main
git reset --hard origin/main
npm ci --no-audit --no-fund
npm run build
sudo systemctl restart thd
echo "deployed \$(git rev-parse --short HEAD)"
EOF
chmod +x "${APP_DIR}/deploy.sh"

echo "ubuntu ALL=(ALL) NOPASSWD: /bin/systemctl restart thd" | sudo tee /etc/sudoers.d/thd >/dev/null
sudo chmod 440 /etc/sudoers.d/thd

if [[ ! -f ~/.ssh/deploy ]]; then
  ssh-keygen -t ed25519 -f ~/.ssh/deploy -N "" -C "github-actions" -q
  cat ~/.ssh/deploy.pub >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
fi
ok "deploy key ready"

# ──────────────────────────────────────────────────── 12. verification ──
say "Checking"
check() { printf "    %-34s %s\n" "$1" "$(curl -s -o /dev/null -m 15 -w '%{http_code}' "$2")"; }
check "front end  /"              "http://127.0.0.1/"
check "front end  /ai-tools/"     "http://127.0.0.1/ai-tools/"
check "front end  /privacy/"      "http://127.0.0.1/privacy/"
check "front end  /sitemap.xml"   "http://127.0.0.1/sitemap.xml"
check "wordpress  /wp-admin/"     "http://127.0.0.1:8080/wp-admin/"
printf "    %-34s %s\n" "graphql returns posts" \
  "$(curl -s -m 15 http://127.0.0.1:8080/graphql -H 'Content-Type: application/json' \
      -d '{"query":"{ posts(first:1){ nodes { title } } }"}' | head -c 90)"

USING_SAMPLE="$(curl -s -m 15 http://127.0.0.1/ | grep -c 'We ran the same 40 tasks' || true)"
if [[ "$USING_SAMPLE" == "0" ]]; then
  ok "front end is serving YOUR WordPress content"
else
  warn "front end is showing sample data — the WordPress connection failed"
  warn "check: sudo journalctl -u thd -n 40 | grep '\\[wp:'"
fi

# ───────────────────────────────────────────────────── 13. credentials ──
sudo tee "$CRED_FILE" >/dev/null <<EOF
TechHowDaily — generated $(date -u '+%Y-%m-%d %H:%M UTC')

SITE          ${SITE_URL}
WP ADMIN      ${WP_URL}/wp-admin
  username    ${WP_ADMIN}
  email       ${WP_EMAIL}
  password    (the one you typed)

DATABASE      ${DB_NAME} / ${DB_USER}
  password    ${DB_PASS}

REVALIDATE_SECRET
  ${REVALIDATE_SECRET}
  (also in ${APP_DIR}/.env.production and ${WP_DIR}/wp-config.php)

PHP           ${PHPV}   socket ${PHP_SOCK}

SERVICE       sudo systemctl status thd
LOGS          sudo journalctl -u thd -f
REDEPLOY      ${APP_DIR}/deploy.sh
EOF
sudo chown ubuntu:ubuntu "$CRED_FILE"; chmod 600 "$CRED_FILE"

say "DONE"
cat <<EOF

    Site        ${SITE_URL}
    WP admin    ${WP_URL}/wp-admin      (user: ${WP_ADMIN})

    Credentials saved to ${CRED_FILE}

  ── Two things left, both by hand ────────────────────────────────

  1. ORACLE CONSOLE — add ingress rules if you have not:
       Networking > VCN > Subnets > Security Lists > Default
       Add: 0.0.0.0/0  TCP  port 80
       Add: 0.0.0.0/0  TCP  port 8080

  2. GITHUB — repo > Settings > Secrets and variables > Actions:
       VM_HOST  ${PUBLIC_IP}
       VM_USER  ubuntu
       VM_KEY   the private key printed below

  ── Deploy key for GitHub Actions (copy all of it) ───────────────

EOF
cat ~/.ssh/deploy
echo
