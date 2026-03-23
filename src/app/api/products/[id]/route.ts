import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Récupérer un produit spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeLandingPages = searchParams.get('includeLandingPages') === 'true';
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        personas: {
          include: {
            marketingAngles: {
              include: {
                adCopies: true
              }
            },
            ...(includeLandingPages && {
              landingPages: {
                select: {
                  id: true,
                  status: true,
                  createdAt: true,
                  sections: {
                    where: {
                      isActive: true
                    },
                    select: { 
                      id: true,
                      type: true,
                      images: true
                    },
                    orderBy: { order: 'asc' }
                  }
                },
                orderBy: { createdAt: 'desc' }
              }
            })
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Aplatir les ad copies pour la compatibilité frontend
    const flatAdCopies = product.personas?.flatMap(p => 
      p.marketingAngles?.flatMap(m => 
        m.adCopies?.map(a => a.text) || []
      ) || []
    ) || [];

    return NextResponse.json({
      ...product,
      adCopies: flatAdCopies
    });
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
      phone,
      whatsapp,
      deliveryInfo,
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

    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }

    if (whatsapp !== undefined) {
      updateData.whatsapp = whatsapp ? whatsapp.trim() : null;
    }

    if (deliveryInfo !== undefined) {
      updateData.deliveryInfo = deliveryInfo ? deliveryInfo.trim() : null;
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


    // Gérer les mises à jour des Personas (édition directe)
    if (body.personas && Array.isArray(body.personas)) {
      // Pour permettre l'édition inline, on va supprimer et recréer les personas fournis
      // C'est une stratégie "replace" pour simplifier la gestion des relations imbriquées
      console.log('Replacing personas strategy...');
      
      // On supprime d'abord les personas existants pour ce produit
      await prisma.persona.deleteMany({
        where: { productId: id }
      });

      // On prépare la création des nouveaux
      updateData.personas = {
        create: body.personas.map((p: any) => ({
          name: p.name,
          description: p.description,
          marketingAngles: {
            create: p.marketingAngles?.map((ma: any) => ({
              name: ma.name,
              description: ma.description,
              adCopies: {
                create: ma.adCopies?.map((ac: any) => ({
                  text: ac.text,
                  cta: ac.cta,
                  platform: ac.platform
                }))
              }
            }))
          }
        }))
      };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        personas: {
          include: {
            marketingAngles: {
              include: {
                adCopies: true
              }
            },
            landingPages: { select: { id: true } }
          }
        }
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
      },
    });

    if (!product) {
      console.warn(`Product ${id} not found`);
      return NextResponse.json(
        { error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    console.log(`Deleting product ${id} with ${product.images.length} images`);

    // Supprimer le produit (les images et personas seront supprimés en cascade, ainsi que leurs landing pages)
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
