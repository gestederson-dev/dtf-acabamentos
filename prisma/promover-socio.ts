import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: tsx prisma/promover-socio.ts <email>");
    process.exit(1);
  }

  const url = process.env.DATABASE_URL ?? "";
  const adapter = new PrismaNeon({ connectionString: url });
  const prisma = new PrismaClient({ adapter });

  const user = await prisma.user.update({
    where: { email },
    data: { role: "SOCIO" },
    select: { id: true, name: true, email: true, role: true },
  });

  console.log("✓ Usuário promovido a SOCIO:", user);
  await prisma.$disconnect();
}

main().catch(console.error);
