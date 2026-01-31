import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un produit spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        landingPages: {
          select: { id: true },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération du produit' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour un produit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      name,
      description,
      headline,
      currency,
      priceOld,
      priceNew,
      ctaText,
      phone,
      whatsapp,
      deliveryInfo,
      benefits,
      adCopies,
      images,
    } = body;

    console.log(`PUT /api/products/${id} - Updating product`);

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      console.warn(`Product ${id} not found`);
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Préparer les données de mise à jour
    const updateData: any = {};

    if (name && name.trim()) {
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description ? description.trim() : '';
    }

    if (headline !== undefined) {
      updateData.headline = headline ? headline.trim() : null;
    }

    if (currency !== undefined) {
      updateData.currency = currency || 'DA';
    }

    if (priceOld !== undefined) {
      updateData.priceOld = priceOld ? parseFloat(priceOld.toString()) : null;
    }

    if (priceNew !== undefined) {
      updateData.priceNew = priceNew ? parseFloat(priceNew.toString()) : null;
    }

    if (ctaText !== undefined) {
      updateData.ctaText = ctaText || 'Commander maintenant';
    }

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp ? whatsapp.trim() : null;
    }

    if (deliveryInfo !== undefined) {
      updateData.deliveryInfo = deliveryInfo ? deliveryInfo.trim() : null;
    }

    if (benefits !== undefined) {
      updateData.benefits = Array.isArray(benefits) ? benefits : null;
    }

    if (adCopies !== undefined) {
      updateData.adCopies = Array.isArray(adCopies) ? adCopies : null;
    }

    // Gérer les images
    if (images && Array.isArray(images)) {
      if (images.length === 0) {
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

      console.log(`Updating ${images.length} images`);

      // Supprimer les anciennes images
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });

      // Créer les nouvelles images
      updateData.images = {
        create: images.map((url: string, index: number) => ({
          url,
          isPrimary: index === 0,
          order: index,
        })),
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        landingPages: { select: { id: true } },
      },
    });

    console.log(`✓ Product ${id} updated`);
    return NextResponse.json(product);
  } catch (error) {
    console.error(`✗ Error updating product:`, error);
    return NextResponse.json(
      { 
        error: 'Erreur lors de la mise à jour du produit',
        message: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer un produit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`DELETE /api/products/${id}`);

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: { select: { id: true } },
        landingPages: { select: { id: true } },
      },
    });

    if (!product) {
      console.warn(`Product ${id} not found`);
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    console.log(`Deleting product ${id} with ${product.images.length} images and ${product.landingPages.length} landing pages`);

    // Supprimer le produit (les images et landing pages seront supprimées en cascade)
    await prisma.product.delete({
      where: { id },
    });

    console.log(`✓ Product ${id} deleted`);

    return NextResponse.json(
      { message: 'Produit supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression du produit' },
      { status: 500 }
    );
  }
}
