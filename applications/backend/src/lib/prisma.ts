import { PrismaClient } from "@prisma/client";
import os from "os";
import process from "process";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function logSystemInfo() {
  console.log("[System Info]");
  console.log(`  Platform: ${process.platform}`);
  console.log(`  Arch: ${process.arch}`);
  console.log(`  CPUs: ${os.cpus().length} x ${os.cpus()[0]?.model}`);
  console.log(`  Total Memory: ${(os.totalmem() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Free Memory: ${(os.freemem() / 1024 / 1024).toFixed(2)} MB`);
  console.log(`  Node Version: ${process.version}`);
  console.log(`  PID: ${process.pid}`);
  console.log(`  Uptime: ${process.uptime().toFixed(2)}s`);
  console.log(`  Env: ${process.env.NODE_ENV}`);
  console.log(`  DATABASE_URL: ${process.env.DATABASE_URL}`);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL + "?connection_limit=10&pool_timeout=20&connect_timeout=60",
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

let isConnected = false;
let lastError: any = null;

function logConnectionConfig() {
  console.log("[DB Connection Config]");
  console.log(`  URL: ${process.env.DATABASE_URL}`);
  console.log(`  Connection Limit: 10`);
  console.log(`  Pool Timeout: 20`);
  console.log(`  Connect Timeout: 60`);
}

/**
 * Attempt to connect to the database, retrying with exponential backoff
 * and max retries. Logs all errors and system info for debugging.
 */
export async function connectWithRetry(maxRetries = 20, baseDelay = 2000) {
  let attempt = 0;
  logSystemInfo();
  logConnectionConfig();
  while (!isConnected && attempt < maxRetries) {
    try {
      attempt += 1;
      console.log(`[DB] Attempting to connect (attempt ${attempt})...`);
      await prisma.$connect();
      isConnected = true;
      lastError = null;
      console.log(`[DB] Connected successfully on attempt ${attempt}`);
      break;
    } catch (err: any) {
      lastError = err;
      isConnected = false;
      console.error(`[DB] Connection failed (attempt ${attempt}): ${err.message}`, err);
      if (attempt >= maxRetries) {
        console.error(`[DB] Max retries (${maxRetries}) reached. Exiting process.`);
        process.exit(1);
      }
      // Exponential backoff with jitter
      const delay = Math.min(baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000, 60000);
      console.log(`[DB] Retrying in ${(delay / 1000).toFixed(2)} seconds...`);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
}

// Initial connection on startup
connectWithRetry();

// Monitor the connection and auto-reconnect if lost
setInterval(async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    if (!isConnected) {
      isConnected = true;
      console.log("[DB] Database reconnected");
    }
  } catch (err: any) {
    if (isConnected) {
      isConnected = false;
      console.error("[DB] Connection lost, attempting to reconnect...", err);
    }
    await connectWithRetry();
  }
}, 30000); // check every 30 seconds

// Graceful shutdown
process.on("beforeExit", async () => {
  console.log("[DB] beforeExit: disconnecting from database...");
  await prisma.$disconnect();
  console.log("[DB] Disconnected.");
});

process.on("SIGINT", async () => {
  console.log("[DB] SIGINT: disconnecting from database...");
  await prisma.$disconnect();
  console.log("[DB] Disconnected. Exiting.");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("[DB] SIGTERM: disconnecting from database...");
  await prisma.$disconnect();
  console.log("[DB] Disconnected. Exiting.");
  process.exit(0);
});

// Debug: log unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (reason, promise) => {
  console.error("[DB] Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[DB] Uncaught Exception:", err);
});
