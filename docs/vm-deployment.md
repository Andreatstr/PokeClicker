# VM Deployment-guide - PokéClicker Prosjekt 2

Komplett guide for å deploye backend og database på NTNU virtuell maskin.

## Forutsetninger

- SSH-tilgang til VM: `it2810-26.idi.ntnu.no`
- NTNU VPN-tilkobling (hvis ikke på NTNU-nettverk)
- Ditt NTNU brukernavn og passord
- MongoDB bør være installert (spør TA hvis ikke tilgjengelig)

## Viktige merknader

- VM er kun tilgjengelig fra NTNU-nettverk eller via VPN
- Én person bør administrere backend for å unngå konflikter
- Apache er allerede installert for å serve frontend på `/project2`
- Backend vil kjøre på port 3001

## Oversikt

Denne guiden dekker:

1. Sette opp Node.js med nvm på VM
2. Sette opp SSH-nøkler for git.ntnu.no
3. Klone repositoriet
4. Sette opp MongoDB
5. Deploye backend for å kjøre persistent med PM2
6. Konfigurere auto-start ved VM reboot
7. Administrere og monitorere backend-tjenesten

## Steg 1: SSH inn på VM

Fra terminalen din (sørg for at du er på NTNU-nettverk eller VPN):

```bash
ssh ditt-ntnu-brukernavn@it2810-26.idi.ntnu.no
```

Hvis ditt lokale brukernavn matcher ditt NTNU brukernavn:

```bash
ssh it2810-26.idi.ntnu.no
```

## Steg 2: Installer Node.js med nvm

Node.js er påkrevd for å kjøre backend. Installer det med nvm (Node Version Manager):

```bash
# Opprett bash-profil hvis den ikke eksisterer
touch ~/.bash_profile

# Installer nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Last inn nvm (eller logg ut og inn igjen)
source ~/.bashrc

# Installer siste Node.js
nvm install node

# Verifiser installasjon
node --version
npm --version
```

## Steg 3: Sett opp SSH-nøkkel for git.ntnu.no

For å klone repositoriet trenger du SSH-tilgang til git.ntnu.no:

```bash
# Generer SSH-nøkkel (trykk Enter for standard lokasjon, valgfri passphrase)
ssh-keygen -t ed25519 -C "din-epost@ntnu.no"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Legg til din SSH-nøkkel
ssh-add ~/.ssh/id_ed25519

# Vis din offentlige nøkkel
cat ~/.ssh/id_ed25519.pub
```

Kopier utdataen og legg den til på git.ntnu.no-kontoen din:

1. Gå til https://git.ntnu.no/-/profile/keys
2. Lim inn din offentlige SSH-nøkkel
3. Gi den en tittel (f.eks. "VM it2810-26")
4. Klikk "Add key"

Test tilkoblingen:

```bash
ssh -T git@git.ntnu.no
```

## Steg 4: Klon repositoriet

```bash
cd ~
git clone git@git.ntnu.no:IT2810-H25/T26-Project-2.git
cd T26-Project-2
```

Hvis repositoriet allerede eksisterer (for å oppdatere):

```bash
cd ~/T26-Project-2
git pull origin main
```

## Steg 5: Sett opp MongoDB

### Alternativ A: Bruke eksisterende MongoDB på VM

Hvis MongoDB allerede er installert og kjører på VM, få connection string fra din TA eller kurspersonale.

### Alternativ B: Installer MongoDB på VM (hvis nødvendig)

```bash
# Sjekk om MongoDB er installert
which mongod

# Hvis ikke installert, må du kanskje spørre TA om å installere det
# Eller sjekk om det er tilgjengelig som en modul å laste
```

### Start MongoDB (hvis installert lokalt)

```bash
# Sjekk om MongoDB-tjeneste kjører
systemctl status mongod

# Hvis ikke kjører, start den
sudo systemctl start mongod

# Aktiver auto-start ved oppstart
sudo systemctl enable mongod
```

## Steg 6: Installer PM2 globalt

PM2 er anbefalt av NTNU-guide for å kjøre Node.js i bakgrunnen:

```bash
pnpm install -g pm2
```

Verifiser installasjon:

```bash
pm2 --version
```

## Steg 7: Sett opp backend

Naviger til backend-mappe:

```bash
cd ~/T26-Project-2/backend
```

Kjør setup-skriptet:

```bash
./manage-backend.sh setup
```

Dette vil:

- Installere avhengigheter (`pnpm install`)
- Bygge TypeScript til JavaScript (`pnpm run build`)
- Opprette logger-mappe
- Kopiere `.env.example` til `.env` hvis den ikke eksisterer

## Steg 8: Konfigurer miljøvariabler

Rediger `.env`-filen:

```bash
nano .env
```

Sett følgende variabler:

```env
# Port for backend (standard: 3001)
PORT=3001

# MongoDB connection string
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=pokeclicker_db

# Node-miljø (valgfritt)
NODE_ENV=production
```

Se [README - Miljøvariabler](../README.md#environment-variables) for detaljer.

Lagre og avslutt (Ctrl+X, deretter Y, deretter Enter).

## Steg 9: Start backend med PM2

Start backend:

```bash
./manage-backend.sh start
```

Dette vil:

- Starte backend ved hjelp av PM2
- Kjøre i bakgrunnen (vedvarer etter utlogging)
- Auto-restart hvis den krasjer
- Lagre PM2-prosessliste

## Steg 10: Konfigurer PM2 auto-start ved VM reboot

Generer PM2 oppstartsskript:

```bash
pm2 startup
```

Dette vil gi en kommando som:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ditt-brukernavn --hp /home/ditt-brukernavn
```

Kopier og kjør den kommandoen. Lagre deretter PM2-prosesslisten:

```bash
pm2 save
```

Nå vil backend automatisk starte når VM rebooter!

## Administrere backend

### Sjekk status

```bash
./manage-backend.sh status
```

Eller direkte med PM2:

```bash
pm2 status
pm2 describe project2-backend
```

### Se logger

```bash
./manage-backend.sh logs
```

Eller se spesifikke logger:

```bash
pm2 logs project2-backend
pm2 logs project2-backend --err  # Kun feillogger
pm2 logs project2-backend --out  # Kun output-logger

# Eller se loggfiler direkte
tail -f logs/error.log
tail -f logs/out.log
```

### Restart backend

Etter endringer eller hvis noe går galt:

```bash
./manage-backend.sh restart
```

### Stopp backend

```bash
./manage-backend.sh stop
```

## Feilsøking

### Sjekk om port 3001 allerede er i bruk

```bash
# List alle prosesser som bruker port 3001
lsof -i :3001

# Eller med netstat
netstat -tulpn | grep 3001

# Eller med ss
ss -tulpn | grep 3001
```

Hvis en annen prosess bruker porten:

```bash
# Drep prosessen (erstatt PID med faktisk prosess-ID)
kill -9 PID

# Eller hvis det er en PM2-prosess
pm2 list
pm2 delete prosessnavn
```

### Flere personer starter backend

**Problem**: Hvis flere teammedlemmer prøver å starte backend, får du port-konflikter.

**Løsning**:

1. Utpek én person til å administrere backend
2. Før du starter, sjekk alltid om den kjører:

```bash
pm2 list
ps aux | grep node
```

3. Hvis nødvendig, stopp eksisterende backend først:

```bash
pm2 stop all
pm2 delete all
```

### Backend vil ikke starte

Sjekk loggene:

```bash
pm2 logs project2-backend --err
```

Vanlige problemer:

1. **MongoDB kjører ikke**: `sudo systemctl start mongod`
2. **Port allerede i bruk**: Drep prosessen som bruker porten
3. **Mangler .env-fil**: Sørg for at `.env` eksisterer og er konfigurert
4. **Bygging feilet**: Kjør `pnpm run build` manuelt for å se feil

### Helsesjekk

Test om backend svarer:

```bash
# Fra VM
curl http://localhost:3001/

# Sjekk GraphQL-endepunkt
curl -X POST http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status timestamp } }"}'
```

### Se ressursbruk

```bash
pm2 monit
```

Eller:

```bash
pm2 status
```

### Tøm logger

Hvis logger blir for store:

```bash
pm2 flush  # Tøm alle PM2-logger
rm -f logs/*.log  # Tøm applikasjonslogger
```

## IP-adresse-konfigurasjon

### Viktig merknad om localhost vs faktisk IP

Når backend og frontend er på forskjellige maskiner:

- **Backend på VM** bør lytte på `0.0.0.0` (alle grensesnitt) eller la standardverdi stå
- **Frontend** må bruke VM's faktiske IP-adresse, IKKE `localhost`

Apache-konfigurasjonen håndterer dette ved å proxye forespørsler fra:

```
http://it2810-26.idi.ntnu.no/project2/graphql
```

til:

```
http://localhost:3001/
```

På denne måten kaller frontend Apache-proxyen, og Apache videresender til backend som kjører på samme VM.

## Testing av deployment

### 1. Sjekk at backend kjører

```bash
pm2 status
```

Skal vise `project2-backend` som `online`.

### 2. Test GraphQL-endepunkt

```bash
curl -X POST http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status timestamp } }"}'
```

Skal returnere JSON med helsestatus.

For komplett GraphQL API-dokumentasjon, se [GRAPHQL.md](./GRAPHQL.md)

### 3. Test fra nettleser

Når Apache er konfigurert, besøk:

```
http://it2810-26.idi.ntnu.no/project2/graphql
```

## Monitorering og vedlikehold

### Regelmessige sjekker

```bash
# Sjekk backend-status
pm2 status

# Se nylige logger
pm2 logs project2-backend --lines 50

# Sjekk ressursbruk
pm2 monit

# Sjekk MongoDB-status
systemctl status mongod
```

### Oppdatere backend

Når du pusher endringer til repositoriet:

```bash
cd ~/T26-Project-2
git pull
cd backend
pnpm install  # Hvis avhengigheter endret
pnpm run build
./manage-backend.sh restart
```

### Sikkerhetskopier MongoDB-data

```bash
# Opprett backup
mongodump --db pokeclicker_db --out ~/backups/$(date +%Y%m%d)

# Gjenopprett fra backup
mongorestore --db pokeclicker_db ~/backups/YYYYMMDD/pokeclicker_db
```

## Hurtigreferanse

```bash
# Start backend
cd ~/T26-Project-2/backend
./manage-backend.sh start

# Sjekk status
./manage-backend.sh status

# Se logger
./manage-backend.sh logs

# Restart
./manage-backend.sh restart

# Stopp
./manage-backend.sh stop

# PM2-kommandoer
pm2 list
pm2 describe project2-backend
pm2 logs project2-backend
pm2 restart project2-backend
pm2 stop project2-backend
pm2 delete project2-backend
```

## Auto-start-sammendrag

Med PM2 konfigurert for auto-start:

1. Backend kjører i bakgrunnen
2. Overlever SSH-utlogging
3. Auto-restarter hvis den krasjer
4. Starter automatisk ved VM reboot
5. Logger all output til filer

## Neste steg

Etter backend er deployet:

1. Konfigurer Apache (se [deployment.md](./deployment.md))
2. Test frontend-backend-kommunikasjon
3. Monitorér logger for feil
4. Sett opp regelmessige MongoDB-backups

## Få hjelp

Hvis du møter problemer:

1. Sjekk logger: `pm2 logs project2-backend --err`
2. Verifiser at MongoDB kjører: `systemctl status mongod`
3. Sjekk port-tilgjengelighet: `lsof -i :3001`
4. Kontakt din TA med spesifikke feilmeldinger
