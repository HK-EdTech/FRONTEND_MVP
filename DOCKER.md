# Docker Setup Guide

This guide explains how to use Docker with the ATS Resume Analyzer project.

## Prerequisites

- Docker installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose installed (comes with Docker Desktop)

## Quick Start (Development)

### Start the application:
```bash
cd FRONTEND_MVP
docker-compose up
```

### Start in detached mode (runs in background):
```bash
docker-compose up -d
```

### Stop the application:
```bash
docker-compose down
```

### View logs:
```bash
docker-compose logs -f frontend
```

## Access the Application

Once running, open your browser to:
- **Frontend:** http://localhost:3010

## Development Mode

The development setup includes:
- ✅ Hot reload - Changes to code automatically refresh
- ✅ Volume mounting - Your local code is synced with the container
- ✅ Source maps - Easy debugging

### Rebuild after dependency changes:
```bash
docker-compose up --build
```

## Production Mode

### Build and run production version:
```bash
docker-compose -f docker-compose.prod.yml up --build
```

### Stop production:
```bash
docker-compose -f docker-compose.prod.yml down
```

## Common Commands

### Install new npm packages:
```bash
# Option 1: Inside running container
docker-compose exec frontend npm install package-name

# Option 2: Rebuild
docker-compose up --build
```

### Run shell inside container:
```bash
docker-compose exec frontend sh
```

### Clean up everything (remove volumes):
```bash
docker-compose down -v
```

### Remove all Docker images and containers:
```bash
docker system prune -a
```

## File Structure

```
FRONTEND_MVP/
├── docker-compose.yml          # Development configuration
├── docker-compose.prod.yml     # Production configuration
├── DOCKER.md                   # This file
└── frontend_mvp/
    ├── Dockerfile              # Multi-stage Docker image
    ├── .dockerignore          # Files to exclude from build
    └── ...
```

## Troubleshooting

### Port already in use
If port 3010 is already in use, change it in `docker-compose.yml`:
```yaml
ports:
  - "3011:3010"  # Change 3011 to any available port
```

### Changes not reflecting
1. Make sure you're running in development mode
2. Try rebuilding: `docker-compose up --build`
3. Clear Next.js cache: `docker-compose exec frontend rm -rf .next`

### Container won't start
1. Check logs: `docker-compose logs frontend`
2. Verify Docker is running
3. Try: `docker-compose down && docker-compose up --build`

## Tips

- Use `docker-compose up -d` to run in background
- Use `docker-compose logs -f` to follow logs
- Changes to `package.json` require rebuild
- Press `Ctrl+C` to stop (if not in detached mode)

## Environment Variables

Create a `.env` file in the `frontend_mvp` folder if needed:
```env
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Then add to `docker-compose.yml`:
```yaml
env_file:
  - ./frontend_mvp/.env
```
