import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // DATABASE_URL_UNPOOLED = conexão direta Neon (necessária para migrations)
    // DATABASE_URL = pooled (usado em runtime pela aplicação)
    url: process.env["DATABASE_URL_UNPOOLED"] ?? process.env["DATABASE_URL"] ?? "file:./dev.db",
  },
});
