const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Updating all establishments to menuStyle = 'luxury-dark'...");
  const result = await prisma.establishment.updateMany({
    where: {},
    data: { menuStyle: 'luxury-dark' }
  });
  console.log("Success! Updated count:", result.count);
}

main()
  .catch(e => {
    console.error("Error executing script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
