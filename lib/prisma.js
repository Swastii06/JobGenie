import { PrismaClient } from "@prisma/client";

// Lazily initialize PrismaClient so importing this module doesn't attempt to
// instantiate the client (and validate `DATABASE_URL`) during module evaluation.
// This prevents runtime "Environment variable not found: DATABASE_URL" errors
// from being thrown when files import `db` but the environment isn't configured yet
// (for example, in certain dev/SSR tooling).

let prismaClientInstance = globalThis.prisma;

function createPrismaClient() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "Environment variable DATABASE_URL is not set.\n" +
        "Create a .env.local file at the project root with a valid DATABASE_URL and restart the dev server.\n" +
        "Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/jobgenie?schema=public\""
    );
  }

  const client = new PrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalThis.prisma = client;
  }

  return client;
}

// Export a proxy object that will initialize the real Prisma client on first access.
// Code using `db.user.findUnique(...)` will trigger the initialization when it
// actually needs the database.
export const db = new Proxy(
  {},
  {
    get(_target, prop) {
      if (!prismaClientInstance) {
        prismaClientInstance = createPrismaClient();
      }

      const value = prismaClientInstance[prop];
      // If the property is a function, bind it to the Prisma client instance so
      // calls like `db.user.findUnique(...)` keep the correct `this`.
      if (typeof value === "function") return value.bind(prismaClientInstance);
      return value;
    },
    // Optional: allow `await db` usage and other reflective ops by forwarding has/ownKeys/getOwnPropertyDescriptor if needed.
  }
);

// globalThis.prisma: This global variable ensures that the Prisma client instance is
// reused across hot reloads during development. Without this, each time your application
// reloads, a new instance of the Prisma client would be created, potentially leading
// to connection issues.