import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const landingPage = await prisma.landingPage.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            images: {
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        benefits: {
          orderBy: {
            order: 'asc',
          },
        },
        sections: {
          where: {
            isActive: true,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
    });

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(landingPage);
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing page' },
      { status: 500 }
    );
  }
}
