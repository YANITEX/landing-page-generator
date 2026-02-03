import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import sharp from 'sharp';

// GET - Télécharger toutes les sections d'une landing page
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        sections: {
          where: {
            isActive: true,
            generationStatus: 'completed'
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page introuvable' },
        { status: 404 }
      );
    }

    // Fonction helper pour gérer les images (JSON string ou array)
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

    // Filtrer les sections qui ont des images
    const sectionsWithImages = landingPage.sections.filter(
      section => getImages(section).length > 0
    );

    if (sectionsWithImages.length === 0) {
      return NextResponse.json(
        { error: 'Aucune section avec images à télécharger' },
        { status: 404 }
      );
    }

    // Télécharger et assembler toutes les images en une seule image composite
    const imageBuffers: Buffer[] = [];
    let maxWidth = 0;
    let totalHeight = 0;

    // Collecter toutes les images et calculer les dimensions
    for (const section of sectionsWithImages) {
      const sectionImages = getImages(section);
      
      for (const imageUrl of sectionImages) {
        try {
          const imageData = await downloadImage(imageUrl);
          const image = sharp(imageData);
          const { width, height } = await image.metadata();
          
          if (width && height) {
            maxWidth = Math.max(maxWidth, width);
            totalHeight += height;
            imageBuffers.push(imageData);
          }
        } catch (error) {
          console.error(`Erreur traitement section ${section.id}:`, error);
        }
      }
    }

    if (imageBuffers.length === 0) {
      return NextResponse.json(
        { error: 'Aucune image valide trouvée' },
        { status: 404 }
      );
    }

    // Créer l'image composite en assemblant verticalement
    let currentY = 0;
    const composite = sharp({
      create: {
        width: maxWidth,
        height: totalHeight,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    });

    const compositeInputs: any[] = [];
    
    for (const imageBuffer of imageBuffers) {
      try {
        const image = sharp(imageBuffer);
        const { width, height } = await image.metadata();
        
        if (width && height) {
          // Redimensionner si nécessaire pour s'adapter à la largeur max
          let processedImage = image;
          if (width !== maxWidth) {
            processedImage = image.resize(maxWidth, Math.round(height * (maxWidth / width)));
          }
          
          compositeInputs.push({
            input: await processedImage.png().toBuffer(),
            top: currentY,
            left: 0
          });
          
          currentY += Math.round(height * (maxWidth / width));
        }
      } catch (error) {
        console.error('Erreur assemblage image:', error);
      }
    }

    const finalImageBuffer = await composite
      .composite(compositeInputs)
      .png()
      .toBuffer();

    const fileName = `${sanitizeFileName(landingPage.headline || 'landing-page')}-complete.png`;
    
    // S'assurer que le nom de fichier est valide ou utiliser un nom par défaut
    const safeFileName = fileName || 'landing-page-complete.png';

    return new NextResponse(finalImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${safeFileName}"`,
        'Content-Length': finalImageBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Erreur téléchargement landing page:', error);
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
    .replace(/[<>:"/\\|?*]/g, '') // Supprimer caractères interdits
    .replace(/\s+/g, '-') // Remplacer espaces par tirets
    .replace(/[^\x00-\x7F]/g, '') // Supprimer tous les caractères non-ASCII
    .substring(0, 50); // Limiter la longueur
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
    // Image base64
    const base64Data = imageUrl.split(',')[1];
    return Buffer.from(base64Data, 'base64');
  } else {
    // Image URL
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Échec téléchargement image: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}