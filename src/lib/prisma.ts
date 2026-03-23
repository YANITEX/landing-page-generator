import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create DATABASE_URL with proper escaping for SQL Server
// Escape special characters in the connection string properly
const databaseURL = process.env.DATABASE_URL

console.log('[Prisma Init] Creating Prisma Client with DATABASE_URL length:', databaseURL?.length);

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: databaseURL,
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

