import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT - Mettre à jour une section
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const body = await request.json();
    const { type, prompt, order, isActive } = body;

    const section = await prisma.section.update({
      where: {
        id: sectionId,
        landingPageId: id
      },
      data: {
        ...(type !== undefined && { type }),
        ...(prompt !== undefined && { prompt }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive }),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error updating section:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de la section' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une section
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    await prisma.section.delete({
      where: {
        id: sectionId,
        landingPageId: id
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting section:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de la section' },
      { status: 500 }
    );
  }
}

// POST - Régénérer les images d'une section
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    const { action } = await request.json();

    if (action === 'regenerate') {
      // Récupérer la section et la landing page
      const section = await prisma.section.findUnique({
        where: { id: sectionId },
        include: {
          landingPage: {
            include: {
              persona: {
                include: {
                  product: {
                    include: {
                      images: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!section || !section.landingPage) {
        return NextResponse.json(
          { error: 'Section ou landing page non trouvée' },
          { status: 404 }
        );
      }

      // Marquer comme en cours de génération
      await prisma.section.update({
        where: { id: sectionId },
        data: { 
          generationStatus: 'generating',
          images: JSON.stringify([]),
          updatedAt: new Date()
        }
      });

      // Lancer la génération en arrière-plan via l'API
      const productImageUrl = section.landingPage.persona?.product?.images?.[0]?.url || null;
      
      fetch(`${request.nextUrl.origin}/api/ai/generate-section-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sectionId: sectionId,
          prompt: section.prompt || `Créer une section ${section.type}`,
          productImageUrl: productImageUrl,
          // Utiliser des valeurs par défaut pour la régénération
          palette: { primary: 'auto', secondary: 'auto', accent: 'auto', background: 'auto' },
          language: 'EN',
          country: undefined
        })
      }).catch(error => {
        console.error('Error triggering regeneration:', error);
      });

      return NextResponse.json({ success: true, message: 'Régénération lancée' });
    }

    return NextResponse.json(
      { error: 'Action non reconnue' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error in section action:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'action sur la section' },
      { status: 500 }
    );
  }
}