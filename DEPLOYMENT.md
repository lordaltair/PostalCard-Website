# Deployment Guide for Postal Card Project (Ubuntu VPS - IP Address Only)

This guide walks you through deploying the Postal Card application to an Ubuntu server **without a domain name**, using only the VPS IP address.

## Prerequisites

*   A VPS running Ubuntu 20.04 or 22.04.
*   Root or sudo access.
*   **Your VPS Public IP Address** (e.g., `192.0.2.123`).

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

-- Important: Connect to the database and grant schema permissions (Required for Postgres 15+)
\c postal_card_db
GRANT ALL ON SCHEMA public TO postal_user;

\q
```

---

## Step 3: Project Setup

Clone your project from git (e.g., GitHub, GitLab).

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
    Update the content. **Replace `YOUR_SERVER_IP` with your actual IP address.**
    
    ```env
    PORT=5000
    DB_NAME=postal_card_db
    DB_USER=postal_user
    DB_PASS=your_secure_password
    DB_HOST=localhost
    JWT_SECRET=your_long_random_secret_string
    
    # IMPORTANT: Use your IP address here
    FRONTEND_URL=http://YOUR_SERVER_IP
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
    **Important:** Set the API URL to your server's IP address.
    
    ```bash
    # Create production env file
    # Replace YOUR_SERVER_IP
    echo "VITE_API_BASE_URL=http://YOUR_SERVER_IP/api" > .env.production
    
    # Build
    npm run build
    ```

4.  **Move Build Files to Web Root:**
    ```bash
    sudo mkdir -p /var/www/postal-card
    sudo cp -r dist/* /var/www/postal-card/
    ```

---

## Step 6: Nginx Configuration

Configure Nginx to catch all traffic to the IP address.

1.  **Create Config File:**
    ```bash
    sudo nano /etc/nginx/sites-available/postal-card
    ```

2.  **Paste Configuration:**
    
    ```nginx
    server {
        listen 80;
        server_name _;  # Catch-all for IP address access

        root /var/www/postal-card;
        index index.html;

        # Serve Frontend (React Router support)
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
            alias /home/ubuntu/postal-card/server/uploads;
            try_files $uri $uri/ =404;
        }
    }
    ```

3.  **Enable Site:**
    ```bash
    # Remove default site if it exists
    sudo rm /etc/nginx/sites-enabled/default
    
    # Enable our site
    sudo ln -s /etc/nginx/sites-available/postal-card /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

---

## Step 7: Permissions

Ensure your backend can write to the uploads folder.

```bash
mkdir -p ~/postal-card/server/uploads
```

---

## Management & Debugging

### Checking Database (PSQL)
To inspect your database, tables, and data manually:

1.  **Login to PostgreSQL:**
    ```bash
    sudo -u postgres psql
    ```

2.  **Connect to your Database:**
    ```sql
    \c postal_card_db
    ```

3.  **List all Tables:**
    ```sql
    \dt
    ```

4.  **Query Data (e.g., check users):**
    ```sql
    SELECT * FROM "Users";
    ```
    *(Note: Quotes around "Users" are often needed in Sequelize because it capitalizes table names)*

5.  **Exit:**
    ```sql
    \q
    ```

### Server Logs
To check the logs of your backend server:

```bash
pm2 logs postal-server
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
