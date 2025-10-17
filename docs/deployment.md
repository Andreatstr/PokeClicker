# Deployment-guide

Denne guiden forklarer hvordan du deployer PokéClicker-applikasjonen til `http://it2810-26.idi.ntnu.no/project2/`

## Oversikt

- Frontend: Serveres via Apache på `/project2/`
- Backend: GraphQL API proxyet gjennom Apache på `/project2/graphql`
- Backend kjører på `localhost:3001` og er reverse-proxyet av Apache

## Forutsetninger

- Apache webserver med nødvendige moduler
- Node.js og npm/pnpm installert
- MongoDB-instans (valgfritt, appen kan kjøre uten database)
- Tilgang til server med sudo-rettigheter

## Rask deployment

Kjør automatisert deployment-skript:

```bash
./deploy.sh
```

Dette skriptet vil:

1. Bygge frontend
2. Bygge backend
3. Deploye frontend til `/var/www/html/project2`
4. Deploye backend til `~/project2-backend`
5. Gi instruksjoner for Apache-konfigurasjon og backend-oppsett

## Manuelle deployment-steg

### 1. Bygg frontend

```bash
pnpm install
pnpm run build
```

De bygde filene vil være i `dist/`-mappen.

### 2. Bygg backend

```bash
cd backend
npm install
npm run build
cd ..
```

Den kompilerte backenden vil være i `backend/dist/`.

### 3. Deploy frontend

Kopier bygd frontend til Apache-mappe:

```bash
sudo cp -r dist /var/www/html/project2
sudo chown -R www-data:www-data /var/www/html/project2
sudo chmod -R 755 /var/www/html/project2
```

### 4. Konfigurer Apache

Aktiver nødvendige moduler:

```bash
sudo a2enmod proxy proxy_http headers rewrite
```

Kopier Apache-konfigurasjonen:

```bash
sudo cp apache-config.conf /etc/apache2/sites-available/project2.conf
sudo a2ensite project2
sudo systemctl reload apache2
```

### 5. Deploy backend

Kopier backend-filer:

```bash
mkdir -p ~/project2-backend
cp -r backend/dist ~/project2-backend/
cp -r backend/node_modules ~/project2-backend/
cp backend/package.json ~/project2-backend/
cp backend/.env.example ~/project2-backend/.env
```

Konfigurer miljøvariabler:

```bash
cd ~/project2-backend
nano .env
```

Sett følgende variabler i `.env`:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=pokeclicker_db
```

Se [README - Miljøvariabler](../README.md#environment-variables) for detaljer.

### 6. Start backend-tjeneste

For utvikling/testing:

```bash
cd ~/project2-backend
npm start
```

For produksjon (med PM2):

```bash
npm install -g pm2
cd ~/project2-backend
pm2 start dist/index.js --name project2-backend
pm2 save
pm2 startup  # Følg instruksjonene for å aktivere oppstart ved boot
```

## Konfigurasjonsdetaljer

### Vite-konfigurasjon

`vite.config.ts` har allerede base path konfigurert:

```typescript
export default defineConfig({
  base: '/project2/',
  // ...
});
```

### Apollo Client-konfigurasjon

Apollo Client i `src/lib/apolloClient.ts` bruker automatisk:

- Produksjon: `/project2/graphql` (proxyet av Apache)
- Utvikling: `http://localhost:3001/` (direkte tilkobling)

### Apache-konfigurasjon

`apache-config.conf`-filen konfigurerer:

- Frontend-serving på `/project2/`
- SPA-routing (alle ruter server `index.html`)
- GraphQL-proxy fra `/project2/graphql` til `http://localhost:3001/`
- CORS-headers for frontend-backend-kommunikasjon

## Testing

Etter deployment, test følgende:

1. **Frontend tilgjengelig**: `http://it2810-26.idi.ntnu.no/project2/`
2. **GraphQL-endepunkt**:
   ```bash
   curl http://it2810-26.idi.ntnu.no/project2/graphql \
     -H "Content-Type: application/json" \
     -d '{"query":"{ health { status timestamp } }"}'
   ```
3. **SPA-routing**: Naviger til `http://it2810-26.idi.ntnu.no/project2/pokedex` og refresh
4. **Backend-kommunikasjon**: Prøv å hente Pokémon-data gjennom frontend

For GraphQL API-referanse, se [GRAPHQL.md](./GRAPHQL.md)

## Feilsøking

### Frontend viser 404 ved refresh

Sørg for at Apache rewrite-regler er aktivert og konfigurasjonen er korrekt.

### Backend ikke tilgjengelig

Sjekk at:

- Backend-tjeneste kjører: `pm2 status` eller `ps aux | grep node`
- Backend lytter på port 3001: `netstat -tulpn | grep 3001`
- Apache proxy-moduler er aktivert: `apache2ctl -M | grep proxy`

### CORS-feil

Verifiser at Apache-konfigurasjonen inkluderer CORS-headers for både frontend-mappen og GraphQL-lokasjonen.

### Frontend kan ikke koble til backend

Sjekk nettleserkonsollet for GraphQL-endepunkt-URL. Det skal være `/project2/graphql` i produksjon.

## Monitorering

Monitorér backend-tjenesten:

```bash
# Med PM2
pm2 logs project2-backend
pm2 monit

# Sjekk Apache-logger
sudo tail -f /var/log/apache2/project2-error.log
sudo tail -f /var/log/apache2/project2-access.log
```

## Oppdatere deployment

For å oppdatere etter endringer:

1. Pull siste endringer: `git pull`
2. Kjør deployment-skript: `./deploy.sh`
3. Restart backend: `pm2 restart project2-backend`
4. Reload Apache: `sudo systemctl reload apache2`
