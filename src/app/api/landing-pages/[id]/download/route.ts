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
    // Prendre uniquement la première image de chaque section (comme dans l'aperçu)
    // L'aperçu affiche les images avec w-full h-auto (taille originale, sans déformation)
    const imageBuffers: { buffer: Buffer; width: number; height: number }[] = [];
    let maxWidth = 0;
    let totalHeight = 0;

    // Collecter la première image de chaque section
    for (const section of sectionsWithImages) {
      const sectionImages = getImages(section);
      
      if (sectionImages.length > 0) {
        const imageUrl = sectionImages[0];
        try {
          const buffer = await downloadImage(imageUrl);
          const metadata = await sharp(buffer).metadata();
          
          if (metadata.width && metadata.height) {
            maxWidth = Math.max(maxWidth, metadata.width);
            totalHeight += metadata.height;
            
            imageBuffers.push({
              buffer,
              width: metadata.width,
              height: metadata.height
            });
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

    // Assembler verticalement - redimensionner chaque image à la largeur maximale
    // Pour correspondre à l'aperçu qui utilise w-full h-auto
    const compositeInputs: any[] = [];
    let currentY = 0;
    let adjustedTotalHeight = 0;
    
    // Recalculer la hauteur totale en fonction du redimensionnement
    const resizedImages: { buffer: Buffer; height: number }[] = [];
    
    for (const { buffer, width, height } of imageBuffers) {
      try {
        // Calculer la nouvelle hauteur en maintenant le ratio d'aspect
        const aspectRatio = height / width;
        const newHeight = Math.round(maxWidth * aspectRatio);
        
        // Redimensionner l'image à la largeur maximale
        const resizedBuffer = await sharp(buffer)
          .resize(maxWidth, newHeight, {
            fit: 'fill',
            kernel: 'lanczos3'
          })
          .png()
          .toBuffer();
        
        resizedImages.push({
          buffer: resizedBuffer,
          height: newHeight
        });
        
        adjustedTotalHeight += newHeight;
      } catch (error) {
        console.error('Erreur redimensionnement image:', error);
      }
    }

    // Assembler toutes les images redimensionnées
    for (const { buffer, height } of resizedImages) {
      compositeInputs.push({
        input: buffer,
        top: currentY,
        left: 0
      });
      
      currentY += height;
    }

    // Créer l'image finale avec la largeur maximale et la hauteur ajustée
    const finalImageBuffer = await sharp({
      create: {
        width: maxWidth,
        height: adjustedTotalHeight,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    })
      .composite(compositeInputs)
      .png()
      .toBuffer();

    const fileName = `landing-page-${id}-complete.png`;
    
    return new NextResponse(finalImageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${fileName}"`,
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
    benefits: 'Proposition-de-valeur',
    'social-proof': 'Temoignages',
    features: 'Caracteristiques',
    'before-after': 'Avant-Apres',
    demo: 'Demonstration',
    comparison: 'Comparaison',
    guarantees: 'Garanties',
    urgency: 'Urgence',
    faq: 'FAQ',
    cta: 'CTA-Final'
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