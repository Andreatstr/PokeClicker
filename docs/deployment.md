# Deployment Guide

This guide explains how to deploy the PokéClicker application to `https://it2810-26.idi.ntnu.no/project2/`

## Overview

- Frontend: Served via Apache at `/project2/`
- Backend: GraphQL API proxied through Apache at `/project2/graphql`
- Backend runs on `localhost:3001` and is reverse-proxied by Apache

## Prerequisites

- Apache webserver with necessary modules
- Node.js and npm installed
- MongoDB instance
- Server access with sudo privileges

## Quick Deployment

Run the automated deployment script:

```bash
./deploy.sh
```

This script will:
1. Build frontend
2. Build backend
3. Deploy frontend to `/var/www/html/project2`
4. Deploy backend to `~/project2-backend`
5. Provide instructions for Apache configuration and backend setup

## Manual Deployment Steps

### 1. Build Frontend

```bash
npm install
npm run build
```

Built files will be in the `dist/` folder.

### 2. Build Backend

```bash
cd backend
npm install
npm run build
cd ..
```

Compiled backend will be in `backend/dist/`.

### 3. Deploy Frontend

Copy built frontend to Apache directory:

```bash
sudo cp -r dist /var/www/html/project2
sudo chown -R www-data:www-data /var/www/html/project2
sudo chmod -R 755 /var/www/html/project2
```

### 4. Configure Apache

Enable necessary modules:

```bash
sudo a2enmod proxy proxy_http headers rewrite
```

Copy Apache configuration:

```bash
sudo cp apache-config.conf /etc/apache2/sites-available/project2.conf
sudo a2ensite project2
sudo systemctl reload apache2
```

### 5. Deploy Backend

Copy backend files (including `.env` which is already configured in the repo):

```bash
mkdir -p ~/project2-backend
cp -r backend/dist ~/project2-backend/
cp -r backend/node_modules ~/project2-backend/
cp backend/package.json ~/project2-backend/
cp backend/.env ~/project2-backend/
```

The backend `.env` file is already committed to the repository with production-ready values:
- `PORT=3001`
- `MONGODB_URI=mongodb://localhost:27017`
- `MONGODB_DB_NAME=pokeclicker_db`
- `JWT_SECRET=secure_jtw_secret_for_development_1761145880`

No additional configuration is needed.

### 6. Start Backend Service

For production (with PM2):

```bash
npm install -g pm2
cd ~/project2-backend
pm2 start dist/index.js --name project2-backend
pm2 save
pm2 startup  # Follow instructions to enable startup on boot
```

## Configuration Details

### Vite Configuration

`vite.config.ts` has base path configured:

```typescript
export default defineConfig({
  base: '/project2/',
  // ...
});
```

### Apollo Client Configuration

Apollo Client in `src/lib/apolloClient.ts` reads the GraphQL URL from `VITE_GRAPHQL_URL`:
- Production (`.env.production`): `/project2/graphql` (proxied by Apache)
- Development (`.env`): `http://localhost:3001/` (direct connection)

All `.env` files are committed to the repository - no configuration needed.

### Apache Configuration

The `apache-config.conf` file configures:
- Frontend serving at `/project2/`
- SPA routing (all routes serve `index.html`)
- GraphQL proxy from `/project2/graphql` to `http://localhost:3001/`
- CORS headers for frontend-backend communication

## Testing Deployment

After deployment, test the following:

1. **Frontend accessible**: `https://it2810-26.idi.ntnu.no/project2/`
2. **GraphQL endpoint**:
   ```bash
   curl https://it2810-26.idi.ntnu.no/project2/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ health { status timestamp } }"}'
   ```
3. **SPA routing**: Navigate to `https://it2810-26.idi.ntnu.no/project2/pokedex` and refresh
4. **Backend communication**: Try fetching Pokémon data through frontend

[GraphQL API Reference](./GRAPHQL.md)

## Troubleshooting

### Frontend shows 404 on refresh

Ensure Apache rewrite rules are enabled and configuration is correct.

### Backend not accessible

Check that:
- Backend service is running: `pm2 status` or `ps aux | grep node`
- Backend is listening on port 3001: `netstat -tulpn | grep 3001`
- Apache proxy modules are enabled: `apache2ctl -M | grep proxy`

### CORS errors

Verify that Apache configuration includes CORS headers for both frontend directory and GraphQL location.

### Frontend cannot connect to backend

Check browser console for GraphQL endpoint URL. It should be `/project2/graphql` in production.

## Monitoring

Monitor backend service:

```bash
# With PM2
pm2 logs project2-backend
pm2 monit

# Check Apache logs
sudo tail -f /var/log/apache2/project2-error.log
sudo tail -f /var/log/apache2/project2-access.log
```

## Updating Deployment

To update after changes:

1. Pull latest changes: `git pull`
2. Run deployment script: `./deploy.sh`
3. Restart backend: `pm2 restart project2-backend`
4. Reload Apache: `sudo systemctl reload apache2`
