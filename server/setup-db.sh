#!/bin/bash

# Database setup script for Sanskrit-Setu
# This script creates the database and sets up the necessary tables

echo "Setting up PostgreSQL database for Sanskrit-Setu..."

# Try to create database with current user
if createdb sanskrit_setu 2>/dev/null; then
    echo "✓ Database 'sanskrit_setu' created successfully"
elif psql -lqt | cut -d \| -f 1 | grep -qw sanskrit_setu; then
    echo "✓ Database 'sanskrit_setu' already exists"
else
    echo "⚠ Failed to create database with current user"
    echo ""
    echo "Please run one of the following commands manually:"
    echo ""
    echo "Option 1 (if you have postgres user access):"
    echo "  sudo -u postgres createdb sanskrit_setu"
    echo ""
    echo "Option 2 (if you have psql access as postgres user):"
    echo "  psql -U postgres -c 'CREATE DATABASE sanskrit_setu;'"
    echo ""
    echo "Option 3 (using psql interactively):"
    echo "  psql -U postgres"
    echo "  CREATE DATABASE sanskrit_setu;"
    echo "  \\q"
    exit 1
fi

echo ""
echo "Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a .env file in the server/ directory with your database credentials"
echo "2. Run 'npm run dev' in the server/ directory to start the server"
echo "   (The server will automatically create the tables on startup)"
