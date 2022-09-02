const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const newRow = await prisma.mpesaStatements.create({
    data: {
        receipt: "12345",
        time: "11:30",
        details: "nope",
        status: "completed"
    }
  })
  console.log(newRow)
 }


main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })