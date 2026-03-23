import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isModelAllowed, getAllowedModels, DEFAULT_AI_CONFIG } from '@/lib/ai-config';
import { invalidateCache } from '@/lib/ai-config-service';

/**
 * GET /api/admin/ai-config
 * Récupère toutes les configurations AI
 */
export async function GET() {
  try {
    const configs = await prisma.aIConfiguration.findMany({
      orderBy: { endpoint: 'asc' },
    });

    // Ajouter la liste des modèles autorisés
    return NextResponse.json({
      configs,
      allowedModels: {
        text: getAllowedModels('TEXT'),
        image: getAllowedModels('IMAGE'),
      },
    });
  } catch (error) {
    console.error('Error fetching AI configs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI configurations' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/ai-config
 * Met à jour une configuration AI
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, endpoint, modelName, description, isActive } = body;

    if (!id || !modelName) {
      return NextResponse.json(
        { error: 'ID and modelName are required' },
        { status: 400 }
      );
    }

    // Valider que le modèle est autorisé
    const modelType = endpoint === 'images' || endpoint === 'palette' ? 'IMAGE' : 'TEXT';
    
    if (!isModelAllowed(modelName, modelType)) {
      return NextResponse.json(
        { error: `Model ${modelName} is not allowed for ${endpoint}` },
        { status: 400 }
      );
    }

    // Mettre à jour dans la DB
    const updated = await prisma.aIConfiguration.update({
      where: { id },
      data: {
        modelName,
        description,
        isActive,
      },
    });

    // Invalider le cache pour forcer le rechargement
    invalidateCache(endpoint);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating AI config:', error);
    return NextResponse.json(
      { error: 'Failed to update AI configuration' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/ai-config/reset
 * Réinitialise toutes les configurations aux valeurs par défaut
 */
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'reset') {
      // Supprimer toutes les configs
      await prisma.aIConfiguration.deleteMany({});
      
      // Recréer les configurations par défaut
      for (const [endpoint, config] of Object.entries(DEFAULT_AI_CONFIG)) {
        await prisma.aIConfiguration.create({
          data: {
            endpoint,
            modelName: config.modelName,
            description: config.description,
            isActive: true,
          },
        });
      }
      
      // Invalider tout le cache
      invalidateCache();

      return NextResponse.json({ message: 'Configurations reset successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error resetting AI configs:', error);
    return NextResponse.json(
      { error: 'Failed to reset AI configurations' },
      { status: 500 }
    );
  }
}
