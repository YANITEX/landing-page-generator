import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      personaId, 
      palette,
      language = 'EN',
      country,
      sections 
    } = body;

    // Vérifier que le persona existe
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
      include: { product: { include: { images: true } } }
    });

    if (!persona) {
      return NextResponse.json({ error: 'Persona not found' }, { status: 404 });
    }

    const landingPage = await prisma.landingPage.create({
      data: {
        personaId,
        // On ne sauvegarde que le personaId et les sections
        // Les autres valeurs (palette, langue, prix) sont temporaires pour la génération
        sections: {
          create: sections.map((section: any, index: number) => ({
            type: section.type,
            order: index,
            images: JSON.stringify([]), // Champ images requis pour SQLite
            prompt: typeof section.prompt === 'string' ? section.prompt : JSON.stringify(section.prompt),
            generationStatus: 'pending',
          })),
        },
      },
      include: {
        sections: {
            orderBy: {
                order: 'asc'
            }
        },
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
    });

    // Déclencher la génération d'images pour toutes les sections en arrière-plan
    if (landingPage.sections && landingPage.sections.length > 0) {
      const generatePromises = landingPage.sections.map(async (section: any) => {
        try {
          const response = await fetch(`${request.nextUrl.origin}/api/ai/generate-section-image`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              sectionId: section.id,
              prompt: section.prompt || `Créer une section ${section.type} pour la landing page`,
              productImageUrl: landingPage.persona?.product?.images?.[0]?.url || null,
              // Passer les valeurs temporaires pour la génération
              palette: palette,
              language: language,
              country: country
            })
          });

          if (!response.ok) {
            console.error(`Erreur génération section ${section.id}:`, await response.text());
          }
        } catch (error) {
          console.error(`Erreur génération section ${section.id}:`, error);
        }
      });

      // Lancer en arrière-plan sans attendre
      Promise.allSettled(generatePromises).then(results => {
        const successful = results.filter(r => r.status === 'fulfilled').length;
        console.log(`Génération d'images déclenchée: ${successful}/${results.length} succès`);
      });
    }

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Error creating landing page:', error);
    return NextResponse.json({ error: 'Failed to create landing page' }, { status: 500 });
  }
}

export async function GET() {
  try {
    console.log('Fetching landing pages...');
    
    // Test de connexion simple d'abord
    const count = await prisma.landingPage.count();
    console.log('Total landing pages in DB:', count);
    
    const landingPages = await prisma.landingPage.findMany({
      include: {
        persona: {
          select: {
            id: true,
            name: true,
            product: {
              select: {
                id: true,
                name: true,
                images: {
                  take: 1,
                  orderBy: {
                    order: 'asc',
                  },
                },
              },
            },
          }
        },
        sections: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            type: true,
            order: true,
            generationStatus: true,
            images: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log('Landing pages found:', landingPages.length);
    return NextResponse.json(landingPages);
  } catch (error) {
    console.error('Detailed error fetching landing pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing pages', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
