import { NextRequest, NextResponse } from 'next/server';
import { adjustColorTemperature, adjustColorContrast } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const { palette, temperature, contrast } = await request.json();

    const adjustedPalette = {
      primary: palette.primary,
      secondary: palette.secondary,
      accent: palette.accent,
      background: palette.background,
    };

    // Apply temperature adjustment
    if (temperature !== 0) {
      adjustedPalette.primary = adjustColorTemperature(
        adjustedPalette.primary,
        temperature
      );
      adjustedPalette.secondary = adjustColorTemperature(
        adjustedPalette.secondary,
        temperature
      );
      adjustedPalette.accent = adjustColorTemperature(
        adjustedPalette.accent,
        temperature
      );
    }

    // Apply contrast adjustment
    if (contrast !== 0) {
      adjustedPalette.primary = adjustColorContrast(
        adjustedPalette.primary,
        contrast
      );
      adjustedPalette.secondary = adjustColorContrast(
        adjustedPalette.secondary,
        contrast
      );
      adjustedPalette.accent = adjustColorContrast(
        adjustedPalette.accent,
        contrast
      );
    }

    return NextResponse.json(adjustedPalette);
  } catch (error) {
    console.error('Error adjusting palette:', error);
    return NextResponse.json(
      { error: 'Failed to adjust palette' },
      { status: 500 }
    );
  }
}
