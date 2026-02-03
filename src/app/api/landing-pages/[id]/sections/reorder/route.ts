import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Réorganiser les sections (changer l'ordre)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { sectionOrders } = await request.json();

    // sectionOrders est un tableau d'objets { id: string, order: number }
    if (!Array.isArray(sectionOrders)) {
      return NextResponse.json(
        { error: 'Format des données invalide' },
        { status: 400 }
      );
    }

    // Mise à jour de l'ordre de toutes les sections en une transaction
    await prisma.$transaction(
      sectionOrders.map(({ id: sectionId, order }) =>
        prisma.section.update({
          where: { 
            id: sectionId,
            landingPageId: id 
          },
          data: { 
            order,
            updatedAt: new Date()
          }
        })
      )
    );

    // Récupérer SEULEMENT les sections actives mises à jour
    const sections = await prisma.section.findMany({
      where: { 
        landingPageId: id,
        isActive: true 
      },
      orderBy: { order: 'asc' }
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error reordering sections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la réorganisation des sections' },
      { status: 500 }
    );
  }
}