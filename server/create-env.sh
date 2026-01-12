#!/bin/bash

# Script to create .env file for Sanskrit-Setu server

ENV_FILE=".env"

if [ -f "$ENV_FILE" ]; then
    echo "⚠ .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 0
    fi
fi

echo "Creating .env file..."
echo ""

# Get database user
read -p "PostgreSQL user (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

# Get database password
read -sp "PostgreSQL password: " DB_PASSWORD
echo ""

# Get database name
read -p "Database name (default: sanskrit_setu): " DB_NAME
DB_NAME=${DB_NAME:-sanskrit_setu}

# Generate a random JWT secret
JWT_SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | base64 | tr -d '\n')

cat > "$ENV_FILE" << EOF
# Server Configuration
PORT=3000
FRONTEND_URL=http://localhost:8080

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT Secret
JWT_SECRET=$JWT_SECRET
EOF

echo ""
echo "✓ .env file created successfully!"
echo ""
echo "Next step: Run 'npm run dev' to start the server"
