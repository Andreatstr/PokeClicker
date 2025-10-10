# PokéClicker Backend

GraphQL backend for the PokéClicker application.

## Setup

Install dependencies:
```bash
npm install
```

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
│   └── resolvers.ts   # GraphQL resolvers
├── dist/              # Compiled JavaScript (generated)
├── package.json
└── tsconfig.json
```

## Environment Variables

- `PORT` - Server port (default: 3001)
