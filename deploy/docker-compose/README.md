# RespondNow - Docker Compose Deployment

## Prerequisites

- Docker Engine 20.10+
- Docker Compose v2.0+

## Quick Start

1. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

2. Build and start services:
   ```bash
   docker-compose up -d --build
   ```

3. Access the application:
   - **Portal**: http://localhost:8191
   - **Server API**: http://localhost:8080
   - **Swagger UI**: http://localhost:8080/swagger-ui.html
   - **Actuator**: http://localhost:8080/actuator

## Services

| Service | Port | Description |
|---------|------|-------------|
| respondnow-portal | 8191 | React Frontend |
| respondnow-server | 8080 | Spring Boot API |
| mongo1 | 27017 | MongoDB |

## Commands

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild specific service
docker-compose up -d --build respondnow-server
```

## Default Credentials

- **Email**: admin@respondnow.io
- **Password**: respondnow
