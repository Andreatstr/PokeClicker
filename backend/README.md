# PokéClicker Backend

GraphQL backend for the PokéClicker application.

## Prerequisites

### MongoDB Installation

**Windows:**

1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer and follow the setup wizard
3. Select "Install MongoDB as a Service" to run MongoDB automatically
4. MongoDB will start on `mongodb://localhost:27017`

**macOS (via Homebrew):**

```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**

```bash
# Import MongoDB GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Update `.env` with your MongoDB connection details if needed (defaults work for local development)

## Development

Start the development server with hot-reload:

```bash
npm run dev
```

The server will start at `http://localhost:3001/`

## Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Production

Run the compiled server:

```bash
npm start
```

## Available Queries

### Health Check

```graphql
query {
  health {
    status
    timestamp
  }
}
```

### Hello

```graphql
query {
  hello
}
```

## Testing

You can test the GraphQL server using:

- Apollo Studio Explorer at `http://localhost:3001/`
- curl:
  ```bash
  curl -X POST http://localhost:3001/ \
    -H "Content-Type: application/json" \
    -d '{"query":"{ health { status timestamp } }"}'
  ```

## Project Structure

```
backend/
├── src/
│   ├── index.ts       # Server entry point
│   ├── schema.ts      # GraphQL type definitions
│   ├── resolvers.ts   # GraphQL resolvers
│   └── db.ts          # MongoDB connection
├── dist/              # Compiled JavaScript (generated)
├── .env               # Environment variables (not in git)
├── .env.example       # Environment variables template
├── package.json
└── tsconfig.json
```

## Environment Variables

Create a `.env` file based on `.env.example`:

- `PORT` - Server port (default: 3001)
- `MONGODB_URI` - MongoDB connection string (default: mongodb://localhost:27017)
- `MONGODB_DB_NAME` - Database name (default: pokeclicker_db)
