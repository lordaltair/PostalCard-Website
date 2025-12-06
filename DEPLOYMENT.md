# Deployment Guide for Postal Card Project (Ubuntu VPS)

This guide walks you through deploying the Postal Card application (PERN Stack: PostgreSQL, Express, React, Node.js) to an Ubuntu server.

## Prerequisites

*   A VPS running Ubuntu 20.04 or 22.04.
*   Root or sudo access.
*   A domain name (optional, but recommended).

---

## Step 1: Initial Server Setup

Update your system and install necessary packages.

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx
```

### Install Node.js (v20)
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

### Install PostgreSQL
```bash
sudo apt install -y postgresql postgresql-contrib
```

### Install PM2 (Process Manager)
```bash
sudo npm install -g pm2
```

---

## Step 2: Database Setup

Login to PostgreSQL and create the database and user.

```bash
sudo -u postgres psql
```

Inside the PostgreSQL shell run the following commands. **Change 'your_password' to a secure password.**

```sql
CREATE DATABASE postal_card_db;
CREATE USER postal_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE postal_card_db TO postal_user;
\q
```

---

## Step 3: Project Setup

Navigate to your web directory (or home directory) and clone your project. Since your project is local, you might need to upload it using SCP, FTP, or push to GitHub first.

Assuming your project is at `~/postal-card`:

```bash
mkdir -p ~/postal-card
# ... Upload your files here ...
```

Or clone from git:
```bash
git clone <your-repo-url> ~/postal-card
cd ~/postal-card
```

---

## Step 4: Backend Deployment

1.  **Navigate to server directory:**
    ```bash
    cd ~/postal-card/server
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file for production.
    ```bash
    cp .env.example .env  # or nano .env
    ```
    Update the content:
    ```env
    PORT=5000
    DB_NAME=postal_card_db
    DB_USER=postal_user
    DB_PASS=your_secure_password
    DB_HOST=localhost
    JWT_SECRET=your_long_random_secret_string
    FRONTEND_URL=https://your-domain.com
    ```

4.  **Start the Server with PM2:**
    ```bash
    pm2 start index.js --name "postal-server"
    pm2 save
    pm2 startup
    ```

---

## Step 5: Frontend Deployment

1.  **Navigate to client directory:**
    ```bash
    cd ~/postal-card/client
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Build the Project:**
    **Important:** Since Vite is static, it needs to know the API URL at build time.
    ```bash
    # Create production env file (or just pass inline)
    echo "VITE_API_BASE_URL=https://your-domain.com/api" > .env.production
    
    # Build
    npm run build
    ```

4.  **Move Build Files to Web Root:**
    We'll let Nginx serve these files.
    ```bash
    sudo mkdir -p /var/www/postal-card
    sudo cp -r dist/* /var/www/postal-card/
    ```
    
    *Note: If you re-deploy, you'll need to run the build and copy steps again.*

---

## Step 6: Nginx Configuration

Configure Nginx to serve the React frontend and proxy API requests to the Node.js backend.

1.  **Create Config File:**
    ```bash
    sudo nano /etc/nginx/sites-available/postal-card
    ```

2.  **Paste Configuration:**
    Replace `your-domain.com` with your actual domain or IP address.

    ```nginx
    server {
        listen 80;
        server_name your-domain.com www.your-domain.com;

        root /var/www/postal-card;
        index index.html;

        # Serve Frontend
        location / {
            try_files $uri $uri/ /index.html;
        }

        # Proxy API Requests to Backend
        location /api {
            proxy_pass http://localhost:5000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # Serve Uploaded Files
        location /uploads {
            alias /home/ubuntu/postal-card/server/uploads; # Check this path matches your structure!
            try_files $uri $uri/ =404;
        }
    }
    ```

3.  **Enable Site:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/postal-card /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## Step 7: SSL (HTTPS) - Optional but Recommended

If you have a domain name, secure it with Let's Encrypt.

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com -d www.your-domain.com
```

---

## Step 8: Permissions

Ensure your backend can write to the uploads folder.

```bash
# Assuming your user is 'ubuntu' and Nginx user is 'www-data'
# But since Node runs as 'ubuntu', it should be fine.
# Just ensure the directory exists.
mkdir -p ~/postal-card/server/uploads
```

## Update & Maintenance

To update the application later:

1.  **Backend:**
    ```bash
    cd ~/postal-card/server
    git pull
    npm install
    pm2 restart postal-server
    ```

2.  **Frontend:**
    ```bash
    cd ~/postal-card/client
    git pull
    npm install
    npm run build
    sudo cp -r dist/* /var/www/postal-card/
    ```
