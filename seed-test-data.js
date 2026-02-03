// Script pour créer des données de test
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestData() {
  try {
    // Créer un produit de test
    const product = await prisma.product.create({
      data: {
        name: "Produit Test",
        description: "Un produit de test pour vérifier les sections",
        headline: "Le meilleur produit test du marché",
        currency: "EUR",
        priceOld: 99.99,
        priceNew: 49.99,
        ctaText: "Acheter maintenant",
        phone: "+33123456789",
        whatsapp: "+33123456789",
        deliveryInfo: "Livraison gratuite sous 48h",
        benefits: JSON.stringify([
          { title: "Qualité premium", description: "Matériaux de haute qualité" },
          { title: "Livraison rapide", description: "Expédition sous 24h" },
          { title: "Garantie 2 ans", description: "Service client disponible" }
        ])
      }
    });

    console.log('Produit créé:', product.id);

    // Créer une landing page de test
    const landingPage = await prisma.landingPage.create({
      data: {
        productId: product.id,
        headline: "Découvrez notre produit révolutionnaire",
        description: "Une landing page de test avec plusieurs sections",
        price: 49.99,
        oldPrice: 99.99,
        currency: "EUR",
        ctaText: "Commander maintenant",
        phone: "+33123456789",
        whatsapp: "+33123456789",
        primaryColor: "#3b82f6",
        secondaryColor: "#1e40af",
        accentColor: "#f59e0b",
        backgroundColor: "#1f2937",
        status: "draft"
      }
    });

    console.log('Landing page créée:', landingPage.id);

    // Créer quelques sections de test
    const sections = [
      {
        type: "hero",
        title: "Section Hero",
        content: "<h1>Bienvenue sur notre produit révolutionnaire</h1><p>Découvrez une solution unique qui va changer votre quotidien.</p>",
        images: JSON.stringify(["https://via.placeholder.com/800x400/3b82f6/ffffff?text=Hero+Image"]),
        order: 1
      },
      {
        type: "problem",
        title: "Le Problème",
        content: "<h2>Vous en avez assez de...</h2><ul><li>Perdre du temps avec des solutions inefficaces</li><li>Dépenser trop d'argent pour des résultats décevants</li><li>Ne pas trouver ce dont vous avez vraiment besoin</li></ul>",
        images: JSON.stringify(["https://via.placeholder.com/600x400/ef4444/ffffff?text=Problem"]),
        order: 2
      },
      {
        type: "solution",
        title: "Notre Solution",
        content: "<h2>Voici comment nous résolvons ces problèmes</h2><p>Notre produit innovant vous offre une solution complète et efficace.</p>",
        images: JSON.stringify(["https://via.placeholder.com/600x400/10b981/ffffff?text=Solution"]),
        order: 3
      },
      {
        type: "benefits",
        title: "Bénéfices",
        content: "<h2>Les avantages de notre produit</h2><div class='grid grid-cols-1 md:grid-cols-3 gap-6'><div><h3>Économisez du temps</h3><p>Jusqu'à 5 heures par semaine</p></div><div><h3>Économisez de l'argent</h3><p>50% moins cher que la concurrence</p></div><div><h3>Résultats garantis</h3><p>Satisfaction ou remboursé</p></div></div>",
        images: JSON.stringify([
          "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Benefit+1",
          "https://via.placeholder.com/400x300/06b6d4/ffffff?text=Benefit+2",
          "https://via.placeholder.com/400x300/f59e0b/ffffff?text=Benefit+3"
        ]),
        order: 4
      },
      {
        type: "cta",
        title: "Appel à l'action",
        content: "<div class='text-center bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-lg'><h2 class='text-white text-3xl font-bold mb-4'>Prêt à transformer votre vie ?</h2><p class='text-white text-xl mb-6'>Rejoignez plus de 10,000 clients satisfaits</p><button class='bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-xl hover:bg-gray-100'>Commander maintenant - 49€ seulement</button></div>",
        images: JSON.stringify(["https://via.placeholder.com/800x300/6366f1/ffffff?text=Call+To+Action"]),
        order: 5
      }
    ];

    for (const sectionData of sections) {
      const section = await prisma.section.create({
        data: {
          ...sectionData,
          landingPageId: landingPage.id,
          generationStatus: 'completed',
          prompt: `Section ${sectionData.type} générée automatiquement`
        }
      });
      console.log(`Section ${section.type} créée:`, section.id);
    }

    console.log('Données de test créées avec succès !');
    console.log(`Accédez à http://localhost:3000/landing-pages/${landingPage.id} pour voir la landing page`);

  } catch (error) {
    console.error('Erreur lors de la création des données de test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestData();