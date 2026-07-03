import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { appConfig } from "@/lib/config";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const pool = new Pool({
  connectionString: appConfig.databaseUrl,
  connectionTimeoutMillis: 30000,
  max: 2,
});
const adapter = new PrismaPg(pool);

const basePrisma = globalForPrisma.prisma || new PrismaClient({ adapter });

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, model, args, query }) {
        const start = performance.now();
        const result = await query(args);
        const duration = performance.now() - start;

        // Log slow queries (> 500ms)
        if (duration > 500) {
          console.warn(`[SLOW_QUERY] ${model}.${operation} took ${duration.toFixed(2)}ms`);
          
          // Using a background fetch or direct insert might cause a loop if we are 
          // querying SystemHealthLog here and it's slow, so we'll just log it.
          // Or insert via another non-extended client if necessary, but console.warn 
          // is best for base APM logging in this scenario.
        }
        
        return result;
      },
    },
  },
}) as unknown as PrismaClient;

if (appConfig.nodeEnv !== "production") {
  globalForPrisma.prisma = basePrisma;
}
