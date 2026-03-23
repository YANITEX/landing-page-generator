import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/ai-client';
import { getAIModel } from '@/lib/ai-config-service';
import { withAILogging } from '@/lib/ai-logger';

function extractBase64Data(dataUrl: string) {
  const match = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!match) {
    return null;
  }
  return { mimeType: match[1], data: match[2] };
}

export async function POST(request: NextRequest) {
  try {
    const { imageDataUrl, language = 'EN' } = await request.json();

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
    };

    const prompt = `Tu es un expert en marketing et copywriting.
Ta tâche est de générer du contenu marketing pour le produit montré dans l'image.

CRUCIAL: TOUT le contenu généré doit être rédigé en langue : ${language}.

La génération doit être centrée sur un PERSONA fort.

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
  "persona": {
    "name": "Nom du persona principal (ex: Maman pressée)",
    "description": "Description détaillée du persona",
    "marketingAngles": [
      {
        "name": "Angle 1 (ex: Gain de temps)",
        "adCopies": [
          {
            "text": "Corps du texte ad copy 1 avec emojis et CTA clair",
            "cta": "Texte du bouton",
            "platform": "Facebook/Instagram"
          },
          {
            "text": "Corps du texte ad copy 2...",
            "cta": "Texte du bouton",
            "platform": "TikTok"
          }
        ]
      },
      {
        "name": "Angle 2 (ex: Facilité d'utilisation)",
        "adCopies": [
          {
             "text": "Corps du texte ad copy 3...",
             "cta": "Texte du bouton",
             "platform": "Facebook"
          }
        ]
      }
    ]
  }
}
Respecte strictement ce format JSON.`;

    const modelName = await getAIModel('generateAll');
    
    const generatedContent = await withAILogging(
      'generateAll',
      modelName,
      { imageDataUrl: 'base64Image...', language },
      prompt,
      async () => {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: 'application/json' },
        });

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

        // Flatten ad copies for backward compatibility if needed, but primarily return the new structure
        const flatAdCopies = parsed.persona?.marketingAngles?.flatMap((angle: any) => 
          angle.adCopies?.map((copy: any) => copy.text)
        ) || [];

        return {
          productName: parsed.productName || '',
          headline: parsed.headline || '',
          description: parsed.description || '',
          benefits: Array.isArray(parsed.benefits) ? parsed.benefits.slice(0, 5) : [],
          adCopies: flatAdCopies, // Keep for legacy frontend support during transition
          persona: parsed.persona || null,
        };
      }
    );

    return NextResponse.json(generatedContent);
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
