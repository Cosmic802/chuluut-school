import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DEFAULT_BODY =
  "Архангай аймгийн Чулуут сумын ерөнхий боловсролын сургууль нь 1936 онд байгуулагдсан түүхтэй сургууль юм.\n\n" +
  "Бид сурагч бүрийн суралцах чадварыг хөгжүүлж, ёс зүйтэй, бие даасан, эх оронч иргэн төлөвшүүлэхийг зорьдог.";

async function main() {
  const superCount = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (superCount === 0) {
    if (!email || !password || password.length < 10) {
      throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD (10+ chars) must be set in .env for the first run");
    }
    await prisma.user.create({
      data: {
        name: process.env.SEED_ADMIN_NAME || "Ерөнхий админ",
        email,
        passwordHash: await bcrypt.hash(password, 12),
        role: "SUPER_ADMIN",
      },
    });
    console.log("Super admin created:", email);
  }

  await prisma.schoolInfo.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", body: DEFAULT_BODY, logoPath: "/uploads/logo.jpg" },
  });
}

main()
  .catch((e) => {
    console.error(e.message ?? e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
