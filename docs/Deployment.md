# Deployment Guide

## Prerequisites
- Docker & Docker Compose
- PostgreSQL Server (or Neon.tech)

## Using Docker Compose
1. Clone the repository.
2. Copy `.env.example` to `.env` and fill values.
3. Run `docker-compose up -d --build`.
4. The application will be exposed via Nginx on port 80/443.