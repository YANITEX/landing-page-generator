import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSectionImage } from '@/lib/ai-client';

// PUT - Mettre à jour une section
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const body = await request.json();
    const { type, title, content, order, isActive } = body;

    const section = await prisma.section.update({
      where: {
        id: params.sectionId,
        landingPageId: params.id
      },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
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
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    await prisma.section.delete({
      where: {
        id: params.sectionId,
        landingPageId: params.id
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
  { params }: { params: { id: string; sectionId: string } }
) {
  try {
    const { action } = await request.json();

    if (action === 'regenerate') {
      // Récupérer la landing page et la section
      const landingPage = await prisma.landingPage.findUnique({
        where: { id: params.id },
        include: {
          product: {
            include: {
              images: true
            }
          },
          persona: true,
          sections: true
        }
      });

      if (!landingPage) {
        return NextResponse.json(
          { error: 'Landing page non trouvée' },
          { status: 404 }
        );
      }

      const section = landingPage.sections.find(s => s.id === params.sectionId);
      if (!section) {
        return NextResponse.json(
          { error: 'Section non trouvée' },
          { status: 404 }
        );
      }

      // Marquer comme en cours de génération
      await prisma.section.update({
        where: { id: params.sectionId },
        data: { 
          generationStatus: 'generating',
          images: JSON.stringify([]),
          updatedAt: new Date()
        }
      });

      // Lancer la génération en arrière-plan
      generateSectionImage(params.sectionId, section.type, landingPage)
        .then(async (imageUrl) => {
          if (imageUrl) {
            await prisma.section.update({
              where: { id: params.sectionId },
              data: { 
                images: JSON.stringify([imageUrl]),
                generationStatus: 'completed'
              }
            });
          } else {
            await prisma.section.update({
              where: { id: params.sectionId },
              data: { generationStatus: 'error' }
            });
          }
        })
        .catch(async (error) => {
          console.error('Error generating section image:', error);
          await prisma.section.update({
            where: { id: params.sectionId },
            data: { generationStatus: 'error' }
          });
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