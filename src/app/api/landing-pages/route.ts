import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const landingPages = await prisma.landingPage.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(landingPages);
  } catch (error) {
    console.error('Error fetching landing pages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch landing pages' },
      { status: 500 }
    );
  }
}
