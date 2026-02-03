const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    const landingPages = await prisma.landingPage.findMany({
      include: {
        sections: true,
        product: true
      }
    });
    
    console.log(`Nombre de landing pages: ${landingPages.length}`);
    landingPages.forEach(lp => {
      console.log(`- ${lp.headline} (${lp.sections.length} sections)`);
      lp.sections.forEach(section => {
        console.log(`  * ${section.type}: ${section.generationStatus}`);
      });
    });
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();