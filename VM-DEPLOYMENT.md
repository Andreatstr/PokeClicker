# VM Deployment Guide - PokéClicker Project 2

Complete guide for deploying backend and database on the NTNU virtual machine.

## Prerequisites

- SSH access to VM: `it2810-26.idi.ntnu.no`
- NTNU VPN connection (if not on NTNU network)
- Your NTNU username and password
- MongoDB should be installed (ask TA if not available)

## Important Notes

- VM is only accessible from NTNU network or via VPN
- One person should manage the backend to avoid conflicts
- Apache is already installed for serving frontend at `/project2`
- Backend will run on port 3001

## Overview

This guide covers:

1. Setting up Node.js with nvm on VM
2. Setting up SSH keys for git.ntnu.no
3. Cloning the repository
4. Setting up MongoDB
5. Deploying backend to run persistently with PM2
6. Configuring auto-start on VM reboot
7. Managing and monitoring the backend service

## Step 1: SSH into VM

From your terminal (make sure you're on NTNU network or VPN):

```bash
ssh your-ntnu-username@it2810-26.idi.ntnu.no
```

If your local username matches your NTNU username:

```bash
ssh it2810-26.idi.ntnu.no
```

## Step 2: Install Node.js with nvm

Node.js is required to run the backend. Install it using nvm (Node Version Manager):

```bash
# Create bash profile if it doesn't exist
touch ~/.bash_profile

# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# Load nvm (or logout and login again)
source ~/.bashrc

# Install latest Node.js
nvm install node

# Verify installation
node --version
npm --version
```

## Step 3: Setup SSH Key for git.ntnu.no

To clone the repository, you need SSH access to git.ntnu.no:

```bash
# Generate SSH key (press Enter for default location, optionally add passphrase)
ssh-keygen -t ed25519 -C "your-email@ntnu.no"

# Start ssh-agent
eval "$(ssh-agent -s)"

# Add your SSH key
ssh-add ~/.ssh/id_ed25519

# Display your public key
cat ~/.ssh/id_ed25519.pub
```

Copy the output and add it to your git.ntnu.no account:

1. Go to https://git.ntnu.no/-/profile/keys
2. Paste your SSH public key
3. Give it a title (e.g., "VM it2810-26")
4. Click "Add key"

Test the connection:

```bash
ssh -T git@git.ntnu.no
```

## Step 4: Clone Repository

```bash
cd ~
git clone git@git.ntnu.no:IT2810-H25/your-repo-name.git
cd your-repo-name
```

If repository already exists (to update):

```bash
cd ~/your-repo-name
git pull origin main
```

## Step 5: Setup MongoDB

### Option A: Using Existing MongoDB on VM

If MongoDB is already installed and running on the VM, get the connection string from your TA or course staff.

### Option B: Install MongoDB on VM (if needed)

```bash
# Check if MongoDB is installed
which mongod

# If not installed, you may need to ask your TA to install it
# Or check if it's available as a module to load
```

### Start MongoDB (if installed locally)

```bash
# Check if MongoDB service is running
systemctl status mongod

# If not running, start it
sudo systemctl start mongod

# Enable auto-start on boot
sudo systemctl enable mongod
```

## Step 4: Install Node.js (if not installed)

Check Node.js version:

```bash
node --version
# Need Node.js 18+ for this project
```

If not installed or version is too old:

```bash
# Check with your TA about available Node.js versions
# Or install using nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

## Step 6: Install PM2 Globally

PM2 is recommended by NTNU guide for running Node.js in the background:

```bash
npm install -g pm2
```

Verify installation:

```bash
pm2 --version
```

## Step 7: Setup Backend

Navigate to backend directory:

```bash
cd ~/your-repo-name/backend
```

Run the setup script:

```bash
./manage-backend.sh setup
```

This will:

- Install dependencies (`npm install`)
- Build TypeScript to JavaScript (`npm run build`)
- Create logs directory
- Copy `.env.example` to `.env` if it doesn't exist

## Step 8: Configure Environment Variables

Edit the `.env` file:

```bash
nano .env
```

Set the following variables:

```env
# Port for backend (default: 3001)
PORT=3001

# MongoDB connection string
# Use localhost if MongoDB is on same VM
MONGODB_URI=mongodb://localhost:27017/pokeclicker

# JWT secret (use a strong random string)
JWT_SECRET=your-super-secret-jwt-key-here

# Node environment
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter).

## Step 9: Start Backend with PM2

Start the backend:

```bash
./manage-backend.sh start
```

This will:

- Start the backend using PM2
- Run in background (persists after logout)
- Auto-restart if it crashes
- Save PM2 process list

## Step 10: Configure PM2 Auto-Start on VM Reboot

Generate PM2 startup script:

```bash
pm2 startup
```

This will output a command like:

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u your-username --hp /home/your-username
```

Copy and run that command. Then save the PM2 process list:

```bash
pm2 save
```

Now the backend will automatically start when the VM reboots!

## Managing the Backend

### Check Status

```bash
./manage-backend.sh status
```

Or directly with PM2:

```bash
pm2 status
pm2 describe project2-backend
```

### View Logs

```bash
./manage-backend.sh logs
```

Or view specific logs:

```bash
pm2 logs project2-backend
pm2 logs project2-backend --err  # Error logs only
pm2 logs project2-backend --out  # Output logs only

# Or view log files directly
tail -f logs/error.log
tail -f logs/out.log
```

### Restart Backend

After making changes or if something goes wrong:

```bash
./manage-backend.sh restart
```

### Stop Backend

```bash
./manage-backend.sh stop
```

## Troubleshooting

### Check if Port 3001 is Already in Use

```bash
# List all processes using port 3001
lsof -i :3001

# Or with netstat
netstat -tulpn | grep 3001

# Or with ss
ss -tulpn | grep 3001
```

If another process is using the port:

```bash
# Kill the process (replace PID with actual process ID)
kill -9 PID

# Or if it's a PM2 process
pm2 list
pm2 delete process-name
```

### Multiple People Starting Backend

**Problem**: If multiple team members try to start the backend, you'll get port conflicts.

**Solution**:

1. Designate one person to manage the backend
2. Before starting, always check if it's running:

```bash
pm2 list
ps aux | grep node
```

3. If needed, stop existing backend first:

```bash
pm2 stop all
pm2 delete all
```

### Backend Won't Start

Check the logs:

```bash
pm2 logs project2-backend --err
```

Common issues:

1. **MongoDB not running**: `sudo systemctl start mongod`
2. **Port already in use**: Kill the process using the port
3. **Missing .env file**: Make sure `.env` exists and is configured
4. **Build failed**: Run `npm run build` manually to see errors

### Health Check

Test if backend is responding:

```bash
# From VM
curl http://localhost:3001/

# Check GraphQL endpoint
curl -X POST http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status timestamp } }"}'
```

### View Resource Usage

```bash
pm2 monit
```

Or:

```bash
pm2 status
```

### Clear Logs

If logs get too large:

```bash
pm2 flush  # Clear all PM2 logs
rm -f logs/*.log  # Clear application logs
```

## IP Address Configuration

### Important Note about localhost vs Actual IP

When backend and frontend are on different machines:

- **Backend on VM** should listen on `0.0.0.0` (all interfaces) or leave default
- **Frontend** must use VM's actual IP address, NOT `localhost`

The Apache configuration handles this by proxying requests from:

```
http://it2810-26.idi.ntnu.no/project2/graphql
```

to:

```
http://localhost:3001/
```

This way, the frontend calls the Apache proxy, and Apache forwards to the backend running on the same VM.

## Testing the Deployment

### 1. Check Backend is Running

```bash
pm2 status
```

Should show `project2-backend` as `online`.

### 2. Test GraphQL Endpoint

```bash
curl -X POST http://localhost:3001/ \
  -H "Content-Type: application/json" \
  -d '{"query":"{ health { status timestamp } }"}'
```

Should return JSON with health status.

### 3. Test from Browser

Once Apache is configured, visit:

```
http://it2810-26.idi.ntnu.no/project2/graphql
```

## Monitoring and Maintenance

### Regular Checks

```bash
# Check backend status
pm2 status

# View recent logs
pm2 logs project2-backend --lines 50

# Check resource usage
pm2 monit

# Check MongoDB status
systemctl status mongod
```

### Updating the Backend

When you push changes to the repository:

```bash
cd ~/your-repo-name
git pull
cd backend
npm install  # If dependencies changed
npm run build
./manage-backend.sh restart
```

### Backup MongoDB Data

```bash
# Create backup
mongodump --db pokeclicker --out ~/backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --db pokeclicker ~/backups/YYYYMMDD/pokeclicker
```

## Quick Reference

```bash
# Start backend
cd ~/your-repo-name/backend
./manage-backend.sh start

# Check status
./manage-backend.sh status

# View logs
./manage-backend.sh logs

# Restart
./manage-backend.sh restart

# Stop
./manage-backend.sh stop

# PM2 commands
pm2 list
pm2 describe project2-backend
pm2 logs project2-backend
pm2 restart project2-backend
pm2 stop project2-backend
pm2 delete project2-backend
```

## Auto-Start Summary

With PM2 configured for auto-start:

1. Backend runs in background
2. Survives SSH logout
3. Auto-restarts if it crashes
4. Starts automatically on VM reboot
5. Logs all output to files

## Next Steps

After backend is deployed:

1. Configure Apache (see `DEPLOYMENT.md`)
2. Test frontend-backend communication
3. Monitor logs for errors
4. Set up regular MongoDB backups

## Getting Help

If you encounter issues:

1. Check logs: `pm2 logs project2-backend --err`
2. Verify MongoDB is running: `systemctl status mongod`
3. Check port availability: `lsof -i :3001`
4. Contact your TA with specific error messages
