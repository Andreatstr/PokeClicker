# Setup Guide

**[Home](../README.md)** | **[Setup](./setup.md)** | **[Architecture](./architecture.md)** | **[Testing](./testing.md)** | **[Security](./security.md)** | **[Sustainability](./sustainability.md)** | **[Development Workflow](./development-workflow.md)** | **[AI Usage](./ai-usage.md)**

---

This guide walks you through setting up the PokéClicker project for local development.

## Prerequisites

### Node.js

- Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- Verify installation: `node --version`

### pnpm

This project uses pnpm for package management. Install it globally:

```bash
npm install -g pnpm
```

Verify installation: `pnpm --version`

### MongoDB

<details>
<summary><b>Windows</b></summary>

1. Download MongoDB Community Server from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. Run the installer (.msi file)
3. Select "Complete" installation
4. **Important:** Check "Install MongoDB as a Service" (starts automatically)
5. Verify MongoDB is running:
   - Open "Services" (search in start menu)
   - Find "MongoDB Server" - should show "Running"
6. If not running, right-click and select "Start"

</details>

<details>
<summary><b>macOS</b></summary>

```bash
# Install Homebrew if needed:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB:
brew services start mongodb-community

# Verify it's running:
brew services list | grep mongodb
```

</details>

<details>
<summary><b>Linux (Ubuntu/Debian)</b></summary>

```bash
# Import MongoDB public GPG Key:
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg

# Add MongoDB repository:
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB:
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB:
sudo systemctl start mongod
sudo systemctl enable mongod  # Start automatically at boot

# Verify it's running:
sudo systemctl status mongod
```

</details>

## Installation

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://git.ntnu.no/IT2810-H25/T26-Project-2.git
cd T26-Project-2

# Install all dependencies (root + frontend + backend)
pnpm install
```

This single command installs dependencies for both frontend and backend thanks to pnpm workspaces.

### 2. Populate Database (REQUIRED)

This step is **required** the first time you set up the project:

```bash
# From root directory:
cd backend
pnpm run seed
cd ..
```

This fetches metadata for ~1024 Pokemon from PokéAPI and stores it in MongoDB. Takes approximately **1-2 minutes**. Progress is shown in the terminal.

**You only need to do this once.** Skip this step on subsequent runs.

### 3. Environment Variables

**IMPORTANT**: Create `backend/.env` with a JWT secret:

```env
JWT_SECRET=your_secure_jwt_secret_here
```

The application will not start without this. Other environment variables are optional and have defaults.

See [Environment Variables](#environment-variables) section below for all configuration options.

## Running the Application

### Development Mode

Start both frontend and backend:

```bash
# From root directory:
pnpm run dev
```

This starts:
- Frontend at `http://localhost:5173`
- Backend at `http://localhost:3001`

### Running Tests

Tests must be run from their respective directories:

```bash
# Frontend tests:
cd frontend
pnpm test

# Backend tests:
cd backend
pnpm test

# E2E tests (from root):
pnpm run test:e2e
```

### Other Commands

```bash
# From root directory:
pnpm run build     # Build both frontend and backend
pnpm run lint      # Lint both frontend and backend

# From frontend directory:
cd frontend
pnpm run dev       # Start frontend only
pnpm run build     # Build frontend
pnpm run lint      # Lint frontend

# From backend directory:
cd backend
pnpm run dev       # Start backend only
pnpm run build     # Build backend
pnpm run lint      # Lint backend
```

## Environment Variables

### Backend (`backend/.env`)

**Required:**
```env
JWT_SECRET=your_secure_jwt_secret_here
```

**Optional (with defaults shown):**
```env
# Server
PORT=3001

# MongoDB
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=pokeclicker_db

# JWT
JWT_EXPIRES=7d

# Bcrypt
BCRYPT_SALT_ROUNDS=10

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000        # 15 minutes
RATE_LIMIT_MAX_REQUESTS=1000       # 1000 requests per window
```

### Frontend (`frontend/.env`)

**Optional (with default shown):**
```env
VITE_GRAPHQL_URL=http://localhost:3001/
```

The default `http://localhost:3001/` works for local development. For production deployment, set to `/project2/graphql`.

## Troubleshooting

### Application won't start

If you get "JWT_SECRET must be set in environment variables":
1. Create `backend/.env` file
2. Add `JWT_SECRET=your_secure_secret_here`
3. Restart the backend

### MongoDB Connection Issues

If you get connection errors:
1. Verify MongoDB is running:
   - macOS: `brew services list | grep mongodb`
   - Windows: Check "Services" app for "MongoDB Server"
   - Linux: `sudo systemctl status mongod`
2. Check the connection string in `backend/.env` if you configured one
3. Ensure MongoDB is listening on port 27017 (default)

### Port Already in Use

If port 3001 or 5173 is already in use:
1. Change `PORT` in `backend/.env`
2. Update `VITE_GRAPHQL_URL` in `frontend/.env` to match
3. Or kill the process using the port

### Seed Script Fails

If the seed script fails:
1. Verify MongoDB is running
2. Check internet connection (needs to reach PokéAPI)
3. Wait a few minutes and try again (might be rate limited)
