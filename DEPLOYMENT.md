# Production Deployment Guide

This guide explains how to deploy GreatReading to production with PostgreSQL.

## Prerequisites

- PostgreSQL 14+ installed
- Python 3.11+ with uv
- Node.js 18+ with npm
- Reverse proxy (nginx/caddy) for HTTPS

## Database Setup

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

### 2. Create Database and User

```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE greatreading;
CREATE USER greatreading_user WITH PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE greatreading TO greatreading_user;
\q
```

### 3. Configure Connection

Create `backend/.env` file:

```env
# Production Database
DATABASE_URL=postgresql://greatreading_user:your-secure-password@localhost:5432/greatreading

# Security - Generate a strong secret key
SECRET_KEY=your-production-secret-key-min-32-chars-random

# CORS - Add your production domain
BACKEND_CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Optional: Increase token expiration for production
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# File Upload
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIR=/var/www/greatreading/uploads
```

**Generate a secure SECRET_KEY:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Backend Deployment

### Option 1: systemd Service (Recommended)

Create `/etc/systemd/system/greatreading.service`:

```ini
[Unit]
Description=GreatReading API
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/greatreading/backend
Environment="PATH=/var/www/greatreading/backend/.venv/bin"
ExecStart=/var/www/greatreading/backend/.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 3000

Restart=on-failure
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

**Enable and start:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable greatreading
sudo systemctl start greatreading
sudo systemctl status greatreading
```

### Option 2: Gunicorn with Multiple Workers

Install gunicorn:
```bash
cd backend
uv add gunicorn
```

Run:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3000
```

Update systemd service to use gunicorn:
```ini
ExecStart=/var/www/greatreading/backend/.venv/bin/gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:3000
```

## Frontend Deployment

### 1. Build Frontend

```bash
cd frontend
npm install
npm run build
```

This creates a `dist/` directory with static files.

### 2. Serve Static Files

**Option A: nginx**

Create `/etc/nginx/sites-available/greatreading`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Frontend
    location / {
        root /var/www/greatreading/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Uploads (if serving from backend)
    location /uploads/ {
        alias /var/www/greatreading/uploads/;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/greatreading /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

**Option B: Caddy (Automatic HTTPS)**

Create `Caddyfile`:

```caddy
yourdomain.com {
    root * /var/www/greatreading/frontend/dist
    encode gzip

    # API proxy
    handle /api/* {
        reverse_proxy localhost:3000
    }

    # Frontend SPA
    try_files {path} /index.html
    file_server
}
```

### 3. HTTPS with Let's Encrypt

**With nginx:**
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

**With Caddy:**
Automatic! Caddy handles HTTPS by default.

## Database Migrations

### Initialize Database Tables

The app automatically creates tables on startup, but for production you should use migrations:

```bash
cd backend

# Initialize alembic (if not already done)
uv run alembic init migrations

# Create migration
uv run alembic revision --autogenerate -m "Initial schema"

# Apply migration
uv run alembic upgrade head
```

## Environment Variables Summary

### Backend (`backend/.env`)

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/greatreading
SECRET_KEY=your-secure-secret-key
BACKEND_CORS_ORIGINS=https://yourdomain.com

# Optional
API_V1_PREFIX=/api/v1
PROJECT_NAME=GreatReading API
VERSION=1.0.0
MAX_UPLOAD_SIZE=52428800
UPLOAD_DIR=/var/www/greatreading/uploads
```

### Frontend (`frontend/.env.production`)

```env
VITE_API_URL=https://yourdomain.com/api/v1
```

Rebuild frontend after changing:
```bash
npm run build
```

## Monitoring and Logs

### View Logs

```bash
# Backend logs (systemd)
sudo journalctl -u greatreading -f

# nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Health Check Endpoint

Check if backend is running:
```bash
curl http://localhost:3000/api/v1/docs
```

## Backup Strategy

### Database Backup

```bash
# Backup
pg_dump -U greatreading_user greatreading > backup.sql

# Restore
psql -U greatreading_user greatreading < backup.sql
```

### Automated Daily Backup

Create `/etc/cron.daily/greatreading-backup`:

```bash
#!/bin/bash
BACKUP_DIR=/var/backups/greatreading
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
pg_dump -U greatreading_user greatreading | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +7 -delete
```

Make executable:
```bash
sudo chmod +x /etc/cron.daily/greatreading-backup
```

## Security Checklist

- ✅ Use strong SECRET_KEY
- ✅ Use PostgreSQL instead of SQLite
- ✅ Enable HTTPS (SSL/TLS)
- ✅ Configure CORS properly
- ✅ Set appropriate file upload limits
- ✅ Run backend as non-root user
- ✅ Keep dependencies updated
- ✅ Regular database backups
- ✅ Monitor logs for errors
- ✅ Use environment variables for secrets

## Performance Optimization

### Backend
- Use multiple Gunicorn workers (4 workers for 4 CPU cores)
- Enable connection pooling for PostgreSQL
- Add Redis for caching (optional)

### Frontend
- Built files are already minified
- Enable gzip compression in nginx/caddy
- Add CDN for static assets (optional)

### Database
- Add indexes for frequently queried columns
- Regularly run VACUUM on PostgreSQL
- Monitor slow queries

## Troubleshooting

### Backend won't start
```bash
# Check logs
sudo journalctl -u greatreading -n 50

# Test database connection
cd backend
uv run python -c "from app.db.database import engine; engine.connect()"
```

### Database connection errors
- Verify PostgreSQL is running: `sudo systemctl status postgresql`
- Check credentials in `.env`
- Verify database exists: `psql -l`
- Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/postgresql-*.log`

### CORS errors
- Verify `BACKEND_CORS_ORIGINS` includes your frontend domain
- Check nginx/caddy proxy headers
- Clear browser cache

## Scaling Considerations

For high-traffic deployments:
- Use PostgreSQL read replicas
- Add Redis for session storage
- Deploy multiple backend instances behind load balancer
- Use CDN for frontend assets
- Consider managed database service (AWS RDS, Digital Ocean Managed PostgreSQL)

## Cost Estimation (Monthly)

**Small deployment:**
- VPS (2 CPU, 4GB RAM): $12-20
- PostgreSQL included in VPS
- Total: ~$15/month

**Medium deployment:**
- VPS (4 CPU, 8GB RAM): $40-60
- Managed PostgreSQL: $15-30
- CDN: $5-10
- Total: ~$60-100/month
