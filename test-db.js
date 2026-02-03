const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDatabase() {
  try {
    const sections = await prisma.section.findMany({
      include: {
        landingPage: {
          select: { headline: true }
        }
      }
    });
    
    console.log(`Nombre de sections: ${sections.length}`);
    sections.forEach(section => {
      console.log(`- ${section.landingPage.headline} / ${section.type}: ${section.generationStatus}`);
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();