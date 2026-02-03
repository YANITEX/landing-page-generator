// Script pour déclencher la génération d'images des sections en attente
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generatePendingSections() {
  try {
    // Récupérer toutes les sections en attente
    const pendingSections = await prisma.section.findMany({
      where: {
        generationStatus: 'pending'
      },
      include: {
        landingPage: {
          include: {
            product: {
              include: {
                images: true
              }
            }
          }
        }
      }
    });

    console.log(`Trouvé ${pendingSections.length} sections en attente de génération`);

    for (const section of pendingSections) {
      console.log(`\nDéclenchement génération pour section ${section.id} (${section.type})`);
      
      try {
        // Appel à l'API de génération d'image
        const response = await fetch(`http://localhost:3000/api/ai/generate-section-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sectionId: section.id,
            prompt: section.prompt || `Créer une section ${section.type} pour la landing page "${section.landingPage.headline}"`,
            productImageUrl: section.landingPage.product?.images?.[0]?.url || null
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ Section ${section.id} générée avec succès`);
        } else {
          const error = await response.json();
          console.error(`❌ Erreur pour section ${section.id}:`, error);
        }
      } catch (error) {
        console.error(`❌ Erreur réseau pour section ${section.id}:`, error.message);
      }

      // Attendre un peu entre chaque génération pour éviter de surcharger l'API
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log('\n🎉 Génération terminée !');
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Fonction pour vérifier l'état des générations
async function checkGenerationStatus() {
  try {
    const sections = await prisma.section.findMany({
      select: {
        id: true,
        type: true,
        generationStatus: true,
        landingPage: {
          select: {
            headline: true
          }
        }
      }
    });

    console.log('\n📊 État des générations:');
    const statusCount = {};
    sections.forEach(section => {
      statusCount[section.generationStatus] = (statusCount[section.generationStatus] || 0) + 1;
      console.log(`${section.landingPage.headline} - ${section.type}: ${section.generationStatus}`);
    });

    console.log('\n📈 Résumé:');
    Object.entries(statusCount).forEach(([status, count]) => {
      console.log(`${status}: ${count} sections`);
    });
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Vérifier les arguments de ligne de commande
const args = process.argv.slice(2);
if (args.includes('--check')) {
  checkGenerationStatus();
} else {
  generatePendingSections();
}