#!/bin/bash

# Jones County XC Server Setup Script
# This script sets up the Lightsail server with HTTPS support

set -e

echo "Jones County XC - Server Setup"
echo "================================"

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
    echo "Please run with sudo: sudo bash server-setup.sh"
    exit 1
fi

# Get domain name from user (optional - can use IP if no domain)
read -p "Enter your domain name (or press Enter to use IP only): " DOMAIN_NAME

# Update system
echo "Updating system packages..."
apt update && apt upgrade -y

# Install required packages
echo "Installing nginx, certbot, and MySQL..."
apt install -y nginx certbot python3-certbot-nginx mysql-server

# Create application directory
echo "Creating application directories..."
mkdir -p /var/www/jones-county-xc/frontend
mkdir -p /var/www/jones-county-xc/backend
chown -R ubuntu:ubuntu /var/www/jones-county-xc

# Copy nginx configuration
echo "Configuring nginx..."
if [ -f "nginx-site.conf" ]; then
    cp nginx-site.conf /etc/nginx/sites-available/jones-county-xc
    ln -sf /etc/nginx/sites-available/jones-county-xc /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
fi

# If domain provided, set up Let's Encrypt
if [ ! -z "$DOMAIN_NAME" ]; then
    echo "Setting up Let's Encrypt for $DOMAIN_NAME..."

    # Update nginx config with domain
    sed -i "s/server_name _;/server_name $DOMAIN_NAME;/g" /etc/nginx/sites-available/jones-county-xc

    # Test nginx config
    nginx -t

    # Reload nginx
    systemctl reload nginx

    # Get Let's Encrypt certificate
    echo "Obtaining SSL certificate..."
    certbot --nginx -d $DOMAIN_NAME --non-interactive --agree-tos --email admin@$DOMAIN_NAME

    # Update nginx config to use Let's Encrypt certs
    sed -i "s|ssl_certificate /etc/ssl/certs/ssl-cert-snakeoil.pem;|ssl_certificate /etc/letsencrypt/live/$DOMAIN_NAME/fullchain.pem;|g" /etc/nginx/sites-available/jones-county-xc
    sed -i "s|ssl_certificate_key /etc/ssl/private/ssl-cert-snakeoil.key;|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN_NAME/privkey.pem;|g" /etc/nginx/sites-available/jones-county-xc
else
    echo "No domain provided. Using self-signed certificate for now."
    echo "To set up Let's Encrypt later, run: sudo certbot --nginx -d yourdomain.com"
fi

# Test and reload nginx
nginx -t
systemctl reload nginx
systemctl enable nginx

# Set up MySQL database
echo "Setting up MySQL database..."
mysql -e "CREATE DATABASE IF NOT EXISTS jones_county_xc;"
mysql -e "CREATE USER IF NOT EXISTS 'jones_xc'@'localhost' IDENTIFIED BY 'your_secure_password';"
mysql -e "GRANT ALL PRIVILEGES ON jones_county_xc.* TO 'jones_xc'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"

echo "Running database schema..."
if [ -f "backend/schema.sql" ]; then
    mysql jones_county_xc < backend/schema.sql
fi

# Set up firewall
echo "Configuring firewall..."
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 3306/tcp
ufw --force enable

# Create systemd service (will be created by GitHub Actions)
echo "Backend service will be created by GitHub Actions on first deployment."

echo ""
echo "================================"
echo "Server setup complete!"
echo ""
echo "Next steps:"
echo "1. Update GitHub Secrets with these values:"
echo "   - SERVER_IP: Your Lightsail server IP"
echo "   - SERVER_USER: ubuntu"
echo "   - SSH_PRIVATE_KEY: Your SSH private key"
echo "   - ADMIN_USERNAME: admin (or your choice)"
echo "   - ADMIN_PASSWORD: your_secure_password"
echo "   - JWT_SECRET: $(openssl rand -base64 32)"
echo "   - DB_HOST: 127.0.0.1"
echo "   - DB_USER: jones_xc"
echo "   - DB_PASSWORD: your_secure_password"
echo "   - DB_NAME: jones_county_xc"
echo ""
echo "2. Push code to GitHub to trigger automatic deployment"
echo "3. Access your site at: https://${DOMAIN_NAME:-your-server-ip}"
echo ""
echo "================================"
