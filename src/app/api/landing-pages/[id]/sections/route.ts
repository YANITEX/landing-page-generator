import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer toutes les sections d'une landing page
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sections = await prisma.section.findMany({
      where: {
        landingPageId: params.id
      },
      orderBy: {
        order: 'asc'
      }
    });

    return NextResponse.json(sections);
  } catch (error) {
    console.error('Error fetching sections:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des sections' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle section
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { type, title, content, order } = body;

    // Obtenir le prochain ordre si pas spécifié
    let sectionOrder = order;
    if (sectionOrder === undefined) {
      const maxOrderSection = await prisma.section.findFirst({
        where: { landingPageId: params.id },
        orderBy: { order: 'desc' }
      });
      sectionOrder = (maxOrderSection?.order || 0) + 1;
    }

    const section = await prisma.section.create({
      data: {
        type,
        title,
        content,
        images: JSON.stringify([]), // Stocker images comme JSON string pour SQLite
        order: sectionOrder,
        landingPageId: params.id,
        generationStatus: 'pending'
      }
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error('Error creating section:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la section' },
      { status: 500 }
    );
  }
}