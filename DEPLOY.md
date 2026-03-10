# 🚀 Panduan Deploy ke VPS

## Prerequisites di VPS

- Ubuntu 20.04+ / Debian 11+
- Node.js 18+
- PostgreSQL 14+
- Nginx (reverse proxy)
- PM2 (process manager)

---

## Step 1: Install Dependencies di VPS

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx
```

---

## Step 2: Setup PostgreSQL

```bash
# Login ke PostgreSQL
sudo -u postgres psql

# Buat database dan user
CREATE DATABASE kpbu_spam;
CREATE USER kpbu_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE kpbu_spam TO kpbu_user;
\q
```

---

## Step 3: Clone Repository

```bash
# Buat folder aplikasi
sudo mkdir -p /var/www/kpbu-spam
sudo chown $USER:$USER /var/www/kpbu-spam

# Clone dari GitHub
cd /var/www/kpbu-spam
git clone https://github.com/USERNAME/REPO_NAME.git .
```

---

## Step 4: Setup Environment

```bash
# Copy template environment
cp .env.example .env

# Edit .env
nano .env
```

Isi `.env`:
```env
DATABASE_URL="postgresql://kpbu_user:your_secure_password@localhost:5432/kpbu_spam"
NEXTAUTH_SECRET="generate-random-32-char-string-here"
NEXTAUTH_URL="https://yourdomain.com"
```

> 💡 Generate secret: `openssl rand -base64 32`

---

## Step 5: Install & Build

```bash
# Install dependencies
npm install

# Setup database
npx prisma db push
npx prisma db seed

# Build production
npm run build
```

---

## Step 6: Setup PM2

```bash
# Start dengan PM2
pm2 start npm --name "kpbu-spam" -- start

# Save PM2 config
pm2 save

# Auto-start on reboot
pm2 startup
```

---

## Step 7: Setup Nginx

```bash
# Buat config Nginx
sudo nano /etc/nginx/sites-available/kpbu-spam
```

Isi config:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Aktifkan:
```bash
sudo ln -s /etc/nginx/sites-available/kpbu-spam /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## Step 8: Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## 🔄 Update Deployment

### Branch Strategy

```
gg-dev  →  ug-dev  →  refactor  →  main (belum diupdate)
                ↑
           VPS saat ini (ug-dev)
```

| Branch | Deskripsi |
|--------|-----------|
| `gg-dev` | Base development, kalkulasi FAHP/PAT/LCM |
| `ug-dev` | Fitur LCM stats + PAT overall scores — **VPS pakai ini** |
| `refactor` | Refactor besar: icons, types, utils, 16 komponen baru |
| `main` | Production (belum di-merge dari refactor) |

### Update VPS ke branch terbaru (dari `ug-dev`):
- path project sesuaikan dengan path di VPS

```bash
cd /var/www/kpbu-spam
git pull origin ug-dev
npm install          # pastikan dependencies up-to-date
npm run build
pm2 restart kpbu-spam
```

### Jika ingin deploy branch `refactor` ke VPS:

> ⚠️ `refactor` branch menambah dependency `lucide-react` — wajib `npm install`

```bash
cd /var/www/kpbu-spam
git fetch origin
git checkout refactor
git pull origin refactor
npm install          # PENTING: install lucide-react
npm run build
pm2 restart kpbu-spam
```

### Update biasa (setelah merge ke branch aktif VPS):

```bash
cd /var/www/kpbu-spam
git pull
npm install
npm run build
pm2 restart kpbu-spam
```

---

## 📋 Commands Cheatsheet

| Command | Fungsi |
|---------|--------|
| `pm2 status` | Cek status aplikasi |
| `pm2 logs kpbu-spam` | Lihat logs |
| `pm2 restart kpbu-spam` | Restart aplikasi |
| `pm2 stop kpbu-spam` | Stop aplikasi |

---

## ⚠️ Troubleshooting

### Database connection error
```bash
# Cek PostgreSQL status
sudo systemctl status postgresql

# Cek connection
psql -h localhost -U kpbu_user -d kpbu_spam
```

### Port 3000 sudah dipakai
```bash
# Cek proses
lsof -i :3000

# Kill jika perlu
kill -9 <PID>
```

### Permission denied
```bash
sudo chown -R $USER:$USER /var/www/kpbu-spam
```
