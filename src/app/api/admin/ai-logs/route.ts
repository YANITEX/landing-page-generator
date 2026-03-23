import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/ai-logs
 * Récupère les logs des requêtes AI
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const endpoint = searchParams.get('endpoint');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (endpoint) where.endpoint = endpoint;
    if (status) where.status = status;

    const logs = await prisma.aIRequestLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Calculer les statistiques
    const stats = await prisma.aIRequestLog.groupBy({
      by: ['endpoint', 'status'],
      _count: true,
      _avg: {
        duration: true,
      },
    });

    return NextResponse.json({ logs, stats });
  } catch (error) {
    console.error('Error fetching AI logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI logs' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/ai-logs
 * Supprime les anciens logs
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const olderThan = searchParams.get('olderThan'); // Nombre de jours

    if (olderThan) {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(olderThan));

      await prisma.aIRequestLog.deleteMany({
        where: {
          createdAt: {
            lt: date,
          },
        },
      });
    } else {
      // Supprimer tous les logs
      await prisma.aIRequestLog.deleteMany({});
    }

    return NextResponse.json({ message: 'Logs deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI logs:', error);
    return NextResponse.json(
      { error: 'Failed to delete AI logs' },
      { status: 500 }
    );
  }
}
