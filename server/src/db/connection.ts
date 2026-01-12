import { Pool, PoolConfig } from "pg";
import dotenv from "dotenv";

dotenv.config();

const poolConfig: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "sanskrit_setu",
  user: process.env.DB_USER || "postgres",
};

// Only add password if it's provided in env (allows for peer authentication)
if (process.env.DB_PASSWORD) {
  poolConfig.password = process.env.DB_PASSWORD;
}

export const pool = new Pool(poolConfig);

// Test connection
pool.on("connect", () => {
  console.log("Connected to PostgreSQL database");
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});
