import { NextRequest, NextResponse } from 'next/server';
import { genAI, AI_MODEL } from '@/lib/ai-client';

function extractBase64Data(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, language = 'FR' } = await request.json();

    if (!imageDataUrl || typeof imageDataUrl !== 'string') {
      return NextResponse.json(
        { error: 'Image data URL is required' },
        { status: 400 }
      );
    }

    const image = extractBase64Data(imageDataUrl);
    if (!image) {
      return NextResponse.json(
        { error: 'Invalid image data URL' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: AI_MODEL,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const prompt = `Tu es un expert en marketing et copywriting.
Ta tâche est de générer du contenu marketing pour le produit montré dans l'image.

CRUCIAL: TOUT le contenu généré doit être rédigé en langue : ${language}.

Génère toutes les suggestions suivantes au format JSON STRICT et sans autre texte:
{
  "productName": "Nom court du produit (en ${language})",
  "headline": "Accroche marketing (50-100 caractères, en ${language})",
  "description": "Description courte orientée bénéfices (2-3 phrases, en ${language})",
  "benefits": [
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"}
  ],
  "adCopies": [
    "Ad copy 1 (en ${language})",
    "Ad copy 2 (en ${language})",
    "Ad copy 3 (en ${language})",
    "Ad copy 4 (en ${language})",
    "Ad copy 5 (en ${language})"
  ]
}
Respecte strictement ce format JSON.`;

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      },
    ]);

    const text = result.response.text();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Impossible de parser la réponse Gemini');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      productName: parsed.productName || '',
      headline: parsed.headline || '',
      description: parsed.description || '',
      benefits: Array.isArray(parsed.benefits) ? parsed.benefits.slice(0, 5) : [],
      adCopies: Array.isArray(parsed.adCopies) ? parsed.adCopies.slice(0, 5) : [],
    });
  } catch (error) {
    console.error('Error generating from image:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
