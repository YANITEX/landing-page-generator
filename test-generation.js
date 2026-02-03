const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestSection() {
  try {
    // Récupérer une landing page existante
    const landingPage = await prisma.landingPage.findFirst();
    
    if (!landingPage) {
      console.log('Aucune landing page trouvée');
      return;
    }
    
    // Créer une section de test en statut pending
    const testSection = await prisma.section.create({
      data: {
        landingPageId: landingPage.id,
        type: 'test',
        title: 'Section Test',
        content: 'Section de test pour génération d\'image',
        images: JSON.stringify([]),
        prompt: 'Créer une image de test moderne et professionnelle pour une landing page',
        order: 99,
        generationStatus: 'pending'
      }
    });
    
    console.log('Section de test créée:', testSection.id);
    
    // Test de génération d'image
    const response = await fetch('http://localhost:3000/api/ai/generate-section-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sectionId: testSection.id,
        prompt: testSection.prompt,
        productImageUrl: null
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Génération réussie:', result.success ? 'Success' : 'Failed');
    } else {
      const error = await response.text();
      console.error('❌ Erreur:', response.status, error);
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestSection();