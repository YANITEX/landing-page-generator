import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('POST /api/products - Body:', JSON.stringify(body).slice(0, 200));

    const { 
      name,
      headline,
      description, 
      images,
      currency,
      priceOld,
      priceNew,
      ctaText,
      phone,
      whatsapp,
      deliveryInfo,
      adCopies
    } = body;

    // Validation du nom
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Le nom du produit est requis' },
        { status: 400 }
      );
    }

    // Validation des images (minimum 1, maximum 5)
    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'Au moins une image est requise' },
        { status: 400 }
      );
    }

    if (images.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 images autorisées' },
        { status: 400 }
      );
    }

    console.log(`Creating product "${name}" with ${images.length} image(s)`);

    const product = await prisma.product.create({
      data: {
        name: name.trim(),
        headline: headline ? headline.trim() : '',
        description: description ? description.trim() : '',
        currency: currency || 'DA',
        priceOld: priceOld !== undefined ? parseFloat(priceOld) : null,
        priceNew: priceNew !== undefined ? parseFloat(priceNew) : null,
        ctaText: ctaText || 'Commander maintenant',
        phone: phone || null,
        whatsapp: whatsapp || null,
        deliveryInfo: deliveryInfo || null,
        // adCopies supprimé du modèle Product, on gère via Personas
        personas: {
          create: body.persona ? {
             name: body.persona.name || "Persona Principal",
             description: body.persona.description,
             marketingAngles: {
               create: body.persona.marketingAngles?.map((angle: any) => ({
                 name: angle.name,
                 description: angle.description,
                 adCopies: {
                   create: angle.adCopies?.map((copy: any) => ({
                     text: copy.text || copy, // Gérer format objet ou string simple
                     cta: copy.cta,
                     platform: copy.platform
                   }))
                 }
               }))
             }
          } : (Array.isArray(adCopies) && adCopies.length > 0) ? {
             // Fallback pour compatibilité frontend existant: On crée un Persona par défaut
             name: "Audience Générale",
             description: "Persona généré automatiquement",
             marketingAngles: {
               create: {
                 name: "Angle Général",
                 adCopies: {
                   create: adCopies.map((text: string) => ({ text }))
                 }
               }
             }
          } : undefined
        },
        images: {
          create: images.map((url: string, index: number) => ({
            url,
            isPrimary: index === 0,
            order: index,
          })),
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
      },
    });

    console.log(`✓ Product created: ${product.id}`);
    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('✗ Error creating product:', error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la création du produit',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
