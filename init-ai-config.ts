/**
 * Script d'initialisation des configurations AI par défaut
 * À exécuter une fois après la migration
 */

import { PrismaClient } from '@prisma/client';
import { DEFAULT_AI_CONFIG } from './src/lib/ai-config';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Initialisation des configurations AI...\n');

  for (const [endpoint, config] of Object.entries(DEFAULT_AI_CONFIG)) {
    const existing = await prisma.aIConfiguration.findUnique({
      where: { endpoint },
    });

    if (existing) {
      console.log(`⏭️  Configuration déjà existante pour ${endpoint}`);
      continue;
    }

    const created = await prisma.aIConfiguration.create({
      data: {
        endpoint,
        modelName: config.modelName,
        description: config.description,
        isActive: true,
      },
    });

    console.log(`✅ Créé: ${endpoint} → ${created.modelName}`);
  }

  console.log('\n🎉 Initialisation terminée !');
  console.log('\n📍 Accédez à la page admin : http://localhost:3000/admin/ai-settings');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
