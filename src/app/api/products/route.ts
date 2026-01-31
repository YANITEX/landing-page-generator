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
        landingPages: {
          select: { id: true },
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
      description, 
      images,
      headline,
      currency,
      priceOld,
      priceNew,
      ctaText,
      phone,
      whatsapp,
      deliveryInfo,
      benefits,
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
        description: description ? description.trim() : '',
        headline: headline || null,
        currency: currency || 'DA',
        priceOld: priceOld || null,
        priceNew: priceNew || null,
        ctaText: ctaText || 'Commander maintenant',
        phone: phone || null,
        whatsapp: whatsapp || null,
        deliveryInfo: deliveryInfo || null,
        benefits: benefits || null,
        adCopies: (Array.isArray(adCopies) && adCopies.length > 0) ? adCopies : null,
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
        landingPages: { select: { id: true } },
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
