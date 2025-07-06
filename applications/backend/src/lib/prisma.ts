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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Handle connection issues
let isConnected = false;

export async function connectWithRetry() {
  let attempt = 0;
  while (!isConnected) {
    try {
      await prisma.$connect();
      isConnected = true;
      console.log("Database connected successfully");
    } catch (err) {
      attempt += 1;
      console.log(`Database connection failed (attempt ${attempt}). Retrying in 5 seconds...`);
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
}

// Monitor connection and auto-reconnect
setInterval(async () => {
  try {
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
    connectWithRetry();
  }
}, 30000); // Check every 30 seconds

// Graceful shutdown handlers
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
