import { hash } from "bcryptjs";

async function main() {
  const password = process.argv[2];

  if (!password) {
    console.error("Usage: npx tsx scripts/hash-password.ts <password>");
    process.exit(1);
  }

  const hashed = await hash(password, 10);
  console.log("\n🔐 Bcrypt Hash Generated:\n");
  console.log(hashed);
  console.log("\n📋 Add this to your .env.local as:");
  console.log(`ADMIN_PASSWORD_HASH=${hashed}\n`);
}

main();
