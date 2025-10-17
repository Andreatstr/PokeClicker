# Deployment Guide

This guide explains how to deploy the PokéClicker application to `http://it2810-26.idi.ntnu.no/project2/`

## Overview

- Frontend: Served via Apache at `/project2/`
- Backend: GraphQL API proxied through Apache at `/project2/graphql`
- Backend runs on `localhost:3001` and is reverse-proxied by Apache

## Prerequisites

- Apache web server with required modules
- Node.js and npm/pnpm installed
- MongoDB instance (optional, app can run without database)
- Access to server with sudo privileges

## Quick Deployment

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:

1. Build the frontend
2. Build the backend
3. Deploy frontend to `/var/www/html/project2`
4. Deploy backend to `~/project2-backend`
5. Provide instructions for Apache configuration and backend service setup

## Manual Deployment Steps

### 1. Build Frontend

```bash
pnpm install
pnpm run build
```

The built files will be in the `dist/` directory.

### 2. Build Backend

```bash
cd backend
npm install
npm run build
cd ..
```

The compiled backend will be in `backend/dist/`.

### 3. Deploy Frontend

Copy the built frontend to Apache directory:

```bash
sudo cp -r dist /var/www/html/project2
sudo chown -R www-data:www-data /var/www/html/project2
sudo chmod -R 755 /var/www/html/project2
```

### 4. Configure Apache

Enable required modules:

```bash
sudo a2enmod proxy proxy_http headers rewrite
```

Copy the Apache configuration:

```bash
sudo cp apache-config.conf /etc/apache2/sites-available/project2.conf
sudo a2ensite project2
sudo systemctl reload apache2
```

### 5. Deploy Backend

Copy backend files:

```bash
mkdir -p ~/project2-backend
cp -r backend/dist ~/project2-backend/
cp -r backend/node_modules ~/project2-backend/
cp backend/package.json ~/project2-backend/
cp backend/.env.example ~/project2-backend/.env
```

Configure environment variables:

```bash
cd ~/project2-backend
nano .env
```

Set the following variables in `.env`:

- `PORT=3001`
- `MONGODB_URI=your-mongodb-connection-string`
- `JWT_SECRET=your-jwt-secret`

### 6. Start Backend Service

For development/testing:

```bash
cd ~/project2-backend
npm start
```

For production (using PM2):

```bash
npm install -g pm2
cd ~/project2-backend
pm2 start dist/index.js --name project2-backend
pm2 save
pm2 startup  # Follow instructions to enable startup on boot
```

## Configuration Details

### Vite Configuration

The `vite.config.ts` already has the base path configured:

```typescript
export default defineConfig({
  base: '/project2/',
  // ...
});
```

### Apollo Client Configuration

The Apollo Client in `src/lib/apolloClient.ts` automatically uses:

- Production: `/project2/graphql` (proxied by Apache)
- Development: `http://localhost:3001/` (direct connection)

### Apache Configuration

The `apache-config.conf` file configures:

- Frontend serving at `/project2/`
- SPA routing (all routes serve `index.html`)
- GraphQL proxy from `/project2/graphql` to `http://localhost:3001/`
- CORS headers for frontend-backend communication

## Testing

After deployment, test the following:

1. Frontend accessible: `http://it2810-26.idi.ntnu.no/project2/`
2. GraphQL endpoint: `http://it2810-26.idi.ntnu.no/project2/graphql?query={health{status}}`
3. SPA routing: Navigate to `http://it2810-26.idi.ntnu.no/project2/pokedex` and refresh
4. Backend communication: Try logging in or fetching Pokemon data

## Troubleshooting

### Frontend shows 404 on refresh

Ensure Apache rewrite rules are enabled and the configuration is correct.

### Backend not accessible

Check that:

- Backend service is running: `pm2 status` or `ps aux | grep node`
- Backend is listening on port 3001: `netstat -tulpn | grep 3001`
- Apache proxy modules are enabled: `apache2ctl -M | grep proxy`

### CORS errors

Verify that the Apache configuration includes the CORS headers for both the frontend directory and the GraphQL location.

### Frontend can't connect to backend

Check the browser console for the GraphQL endpoint URL. It should be `/project2/graphql` in production.

## Monitoring

Monitor the backend service:

```bash
# Using PM2
pm2 logs project2-backend
pm2 monit

# Check Apache logs
sudo tail -f /var/log/apache2/project2-error.log
sudo tail -f /var/log/apache2/project2-access.log
```

## Updating the Deployment

To update after making changes:

1. Pull latest changes: `git pull`
2. Run deployment script: `./deploy.sh`
3. Restart backend: `pm2 restart project2-backend`
4. Reload Apache: `sudo systemctl reload apache2`
