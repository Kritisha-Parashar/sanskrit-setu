#!/usr/bin/env node


const { Pool } = require('pg');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createDatabase() {
  // To get database connection details from environment or ask user
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432');
  const dbName = process.env.DB_NAME || 'postgres';
  const dbUser = process.env.DB_USER || 'kavya';
  const dbPassword = process.env.DB_PASSWORD;

  console.log('\nSanskrit-Setu Database Setup\n');
  console.log('Current configuration:');
  console.log(`  Host: ${dbHost}`);
  console.log(`  Port: ${dbPort}`);
  console.log(`  Database: ${dbName}`);
  console.log(`  User: ${dbUser}\n`);

  // Connect to PostgreSQL (using default 'postgres' database to create our database)
  const adminPool = new Pool({
    host: dbHost,
    port: dbPort,
    database: 'postgres', // Connect to default database first
    user: dbUser,
    password: dbPassword
  });

  try {
    // Check if database exists
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`✅ Database '${dbName}' already exists`);
      const recreate = await question('Do you want to recreate it? (This will DELETE all data!) [y/N]: ');
      if (recreate.toLowerCase() === 'y') {
        // Terminate existing connections
        await adminPool.query(
          `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
          [dbName]
        );
        await adminPool.query(`DROP DATABASE ${dbName}`);
        console.log(`🗑️  Database '${dbName}' dropped`);
      } else {
        console.log('Keeping existing database');
        await adminPool.end();
        return;
      }
    }

    // Create database
    console.log(`\n🔨 Creating database '${dbName}'...`);
    await adminPool.query(`CREATE DATABASE ${dbName}`);
    console.log(`✅ Database '${dbName}' created successfully`);

    await adminPool.end();

    // Now connect to the new database and create tables
    const appPool = new Pool({
      host: dbHost,
      port: dbPort,
      database: dbName,
      user: dbUser,
      password: dbPassword
    });

    console.log('\n🔨 Creating tables and indexes...');
    
    // Read and execute migrations
    const migrationsPath = path.join(__dirname, 'src', 'db', 'migrations.sql');
    const migrationsSQL = fs.readFileSync(migrationsPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = migrationsSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await appPool.query(statement);
        } catch (error) {
          // Ignore "already exists" errors
          if (!error.message.includes('already exists') && !error.message.includes('duplicate')) {
            console.error('Error executing statement:', error.message);
            throw error;
          }
        }
      }
    }

    console.log('✅ Tables and indexes created successfully');
    console.log('\n🎉 Database setup complete!');
    console.log('\nYou can now start the server with: npm run dev');

    await appPool.end();
  } catch (error) {
    console.error('\n❌ Error setting up database:', error.message);
    if (error.code === '3D000') {
      console.error('   Database does not exist. Make sure PostgreSQL is running.');
    } else if (error.code === '28P01') {
      console.error('   Authentication failed. Check your DB_USER and DB_PASSWORD in .env');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('   Could not connect to PostgreSQL. Make sure it is running.');
    }
    process.exit(1);
  }
}

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  No .env file found. Creating one from .env.example...');
  const envExamplePath = path.join(__dirname, '.env.example');
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created. Please update it with your database credentials.');
    console.log('   Then run this script again.\n');
    rl.close();
    process.exit(0);
  } else {
    console.log('❌ .env.example not found. Please create a .env file manually.');
    rl.close();
    process.exit(1);
  }
}

createDatabase()
  .then(() => {
    rl.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    rl.close();
    process.exit(1);
  });
