# Deployment Guide - Jones County XC

This guide covers deploying the Jones County Cross Country website to AWS Lightsail with HTTPS support.

## Prerequisites

- AWS Lightsail instance running Ubuntu
- Domain name pointed to your Lightsail IP (optional, but recommended for HTTPS)
- GitHub repository with Actions enabled
- SSH access to your server

## Initial Server Setup

### 1. Connect to Your Lightsail Server

```bash
ssh ubuntu@your-server-ip
```

### 2. Run the Setup Script

On your local machine, copy the setup script to the server:

```bash
scp server-setup.sh ubuntu@your-server-ip:~/
```

On the server, run the setup script:

```bash
sudo bash server-setup.sh
```

This script will:
- Install nginx, certbot, and MySQL
- Set up the application directories
- Configure nginx for HTTPS
- Set up Let's Encrypt SSL certificate (if domain provided)
- Create the MySQL database
- Configure the firewall

### 3. Configure GitHub Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Server Access:**
- `SERVER_IP`: Your Lightsail server IP address
- `SERVER_USER`: `ubuntu`
- `SSH_PRIVATE_KEY`: Your SSH private key (content of your .pem file)

**Backend Configuration:**
- `ADMIN_USERNAME`: Admin username for authentication (e.g., `admin`)
- `ADMIN_PASSWORD`: Strong password for admin login
- `JWT_SECRET`: Random 32+ character string (generate with: `openssl rand -base64 32`)

**Database Configuration:**
- `DB_HOST`: `127.0.0.1`
- `DB_USER`: `jones_xc`
- `DB_PASSWORD`: Your MySQL password (set during setup)
- `DB_NAME`: `jones_county_xc`

## Automatic Deployment

Once GitHub Secrets are configured, deployment is automatic:

1. **Push to main branch:**
   ```bash
   git push origin main
   ```

2. **GitHub Actions will:**
   - Build the frontend (React + Vite)
   - Build the backend (Go binary)
   - Create the .env file with secrets
   - Deploy files to the server
   - Restart the backend service

3. **Monitor deployment:**
   - Go to GitHub → Actions tab
   - Watch the "Deploy to Lightsail" workflow
   - Check logs for any errors

## Manual Deployment (Alternative)

If you prefer to deploy manually:

### Build Locally

```bash
# Build frontend
cd frontend
npm ci
npm run build

# Build backend for Linux
cd ../backend
GOOS=linux GOARCH=amd64 go build -o server main.go
```

### Deploy to Server

```bash
# Copy frontend
scp -r frontend/dist/* ubuntu@your-server-ip:/var/www/jones-county-xc/frontend/

# Copy backend
scp backend/server ubuntu@your-server-ip:/var/www/jones-county-xc/backend/
scp backend/.env ubuntu@your-server-ip:/var/www/jones-county-xc/backend/

# Restart service
ssh ubuntu@your-server-ip "sudo systemctl restart jones-county-xc"
```

## Verification

### Check Backend Service

```bash
ssh ubuntu@your-server-ip
sudo systemctl status jones-county-xc
```

Expected output:
```
● jones-county-xc.service - Jones County XC Backend
   Loaded: loaded
   Active: active (running)
```

### Check Backend Logs

```bash
sudo journalctl -u jones-county-xc -f
```

### Test API Endpoints

```bash
# Health check
curl https://your-domain.com/health

# Public endpoint
curl https://your-domain.com/api/athletes

# Login endpoint
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your_password"}'
```

### Test Full Application

1. **Open in browser:** `https://your-domain.com`
2. **Navigate to:** `/admin` (should redirect to `/login`)
3. **Login** with admin credentials
4. **Test CRUD operations** for athletes, meets, and results
5. **Logout** and verify redirect

## HTTPS Configuration

### Using Let's Encrypt (Recommended)

If you have a domain name:

```bash
sudo certbot --nginx -d your-domain.com
```

Certbot will:
- Obtain SSL certificate
- Update nginx configuration
- Set up auto-renewal

### Certificate Renewal

Certificates auto-renew, but you can test:

```bash
sudo certbot renew --dry-run
```

### Using Self-Signed Certificate

For testing without a domain:

```bash
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/selfsigned.key \
  -out /etc/ssl/certs/selfsigned.crt
```

Update nginx config to use these certificates.

## Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u jones-county-xc -n 50

# Common issues:
# - Database connection failed: Check DB credentials in .env
# - Port already in use: Check if another process is using port 8080
# - Permission denied: Check file permissions
```

### Frontend Not Loading

```bash
# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Check nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

### Database Connection Issues

```bash
# Check MySQL status
sudo systemctl status mysql

# Test database connection
mysql -u jones_xc -p jones_county_xc
```

### SSL Certificate Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew

# Check nginx SSL configuration
sudo nginx -t
```

## File Structure on Server

```
/var/www/jones-county-xc/
├── frontend/
│   ├── index.html
│   ├── assets/
│   └── ...
└── backend/
    ├── server (executable)
    └── .env (secrets)

/etc/nginx/sites-available/
└── jones-county-xc (nginx config)

/etc/systemd/system/
└── jones-county-xc.service (backend service)
```

## Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Strong admin password set
- [ ] JWT secret is random and secure (32+ characters)
- [ ] Database password is strong
- [ ] Firewall configured (UFW)
- [ ] Security headers enabled in nginx
- [ ] Backend running in release mode (GIN_MODE=release)
- [ ] SSH key-based authentication only
- [ ] Regular system updates scheduled

## Monitoring

### Check Service Status

```bash
# Backend
sudo systemctl status jones-county-xc

# Nginx
sudo systemctl status nginx

# MySQL
sudo systemctl status mysql
```

### View Logs

```bash
# Backend logs (real-time)
sudo journalctl -u jones-county-xc -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Resource Usage

```bash
# Disk usage
df -h

# Memory usage
free -h

# Process list
top
```

## Backup

### Database Backup

```bash
# Create backup
mysqldump -u jones_xc -p jones_county_xc > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u jones_xc -p jones_county_xc < backup_20260225.sql
```

### Application Backup

```bash
# Backup entire application
tar -czf jones-xc-backup-$(date +%Y%m%d).tar.gz /var/www/jones-county-xc
```

## Updating

To deploy updates:

1. Make changes locally
2. Commit and push to GitHub
3. GitHub Actions automatically deploys
4. Verify changes on production

For emergency rollback:
```bash
# Stop service
sudo systemctl stop jones-county-xc

# Restore previous version
# (copy from backup)

# Start service
sudo systemctl start jones-county-xc
```

## Support

For issues or questions:
- Check logs first (backend and nginx)
- Review GitHub Actions logs
- Verify all secrets are set correctly
- Test locally before deploying
