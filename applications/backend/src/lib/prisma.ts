import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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

// Track whether we're currently connected
let isConnected = false;

/**
 * Attempt to connect to the database, retrying every 5 seconds
 * until successful.
 */
export async function connectWithRetry() {
  let attempt = 0;
  while (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log("Database connected successfully");
    } catch (err) {
      attempt += 1;
      console.error(
        `Database connection failed (attempt ${attempt}). Retrying in 5 seconds...`,
        err
      );
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// Initial connection on startup
connectWithRetry();

// Monitor the connection and auto-reconnect if lost
setInterval(async () => {
  try {
    // simple heartbeat query
    await prisma.$queryRaw`SELECT 1`;
    if (!isConnected) {
      isConnected = true;
      console.log("Database reconnected");
    }
  } catch (err) {
    if (isConnected) {
      console.log("Database connection lost, attempting to reconnect...");
      isConnected = false;
    }
    await connectWithRetry();
  }
}, 30000); // check every 30 seconds

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
