import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Télécharger une section spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; sectionId: string }> }
) {
  try {
    const { id, sectionId } = await params;
    
    const section = await prisma.section.findUnique({
      where: {
        id: sectionId,
        landingPageId: id
      },
      include: {
        landingPage: {
          select: {
            headline: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json(
        { error: 'Section introuvable' },
        { status: 404 }
      );
    }

    // Gérer les images (JSON string ou array)
    const getImages = (section: any): string[] => {
      if (typeof section.images === 'string') {
        try {
          return JSON.parse(section.images);
        } catch {
          return [];
        }
      }
      return Array.isArray(section.images) ? section.images : [];
    };

    const images = getImages(section);

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image à télécharger pour cette section' },
        { status: 404 }
      );
    }

    // Télécharger directement la première image
    const imageUrl = images[0];
    const imageData = await downloadImage(imageUrl);
    const fileName = `${sanitizeFileName(section.landingPage.headline || 'landing-page')}-${getSectionTypeName(section.type)}.${getImageExtension(imageUrl)}`;

    return new NextResponse(imageData, {
      headers: {
        'Content-Type': getImageMimeType(imageUrl),
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': imageData.length.toString()
      }
    });

  } catch (error) {
    console.error('Erreur téléchargement section:', error);
    return NextResponse.json(
      { error: 'Erreur lors du téléchargement' },
      { status: 500 }
    );
  }
}

// Fonctions utilitaires
function getSectionTypeName(type: string): string {
  const sectionTypeNames: { [key: string]: string } = {
    hero: 'Hero',
    problem: 'Probleme',
    solution: 'Solution',
    benefits: 'Benefices',
    'social-proof': 'Preuves-sociales',
    'how-it-works': 'Comment-ca-marche',
    faq: 'FAQ',
    cta: 'Call-to-action'
  };
  return sectionTypeNames[type] || type;
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function getImageExtension(imageUrl: string): string {
  if (imageUrl.startsWith('data:image/')) {
    const mimeMatch = imageUrl.match(/data:image\/([^;]+)/);
    return mimeMatch ? mimeMatch[1] : 'png';
  }
  const urlMatch = imageUrl.match(/\.([^.?]+)(?:\?|$)/);
  return urlMatch ? urlMatch[1] : 'png';
}

function getImageMimeType(imageUrl: string): string {
  const extension = getImageExtension(imageUrl);
  const mimeTypes: { [key: string]: string } = {
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml'
  };
  return mimeTypes[extension.toLowerCase()] || 'image/png';
}

async function downloadImage(imageUrl: string): Promise<Buffer> {
  if (imageUrl.startsWith('data:image/')) {
    const base64Data = imageUrl.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  } else {
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Échec téléchargement image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}