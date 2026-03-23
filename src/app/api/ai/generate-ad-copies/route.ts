import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/ai-client';
import { getAIModel } from '@/lib/ai-config-service';
import { withAILogging } from '@/lib/ai-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productName, headline, description, benefits, language = 'EN' } = body;

    if (!productName) {
      return NextResponse.json(
        { error: 'Le nom du produit est requis' },
        { status: 400 }
      );
    }

    const benefitsText = Array.isArray(benefits)
      ? benefits.map((b: any) => `- ${b.title}: ${b.description}`).join('\n')
      : '';

    const prompt = `Tu es un expert en copywriting et marketing. 
Ta mission est de générer 5 ad copies (publicités) courtes et impactantes pour ce produit.

IMPORTANT: Tout le contenu doit être rédigé en langue : ${language}.

Chaque ad copy doit être:
- Court (1-2 phrases max)
- Percutant et engageant
- Axé sur les bénéfices pour le client
- Donne envie d'acheter

Informations du produit:
Nom: ${productName}
Accroche: ${headline || 'Non spécifiée'}
Description: ${description || 'Non spécifiée'}
${benefitsText ? `Bénéfices:\n${benefitsText}` : ''}

Réponds UNIQUEMENT avec un JSON valide dans ce format EXACT, sans autre texte:
{
  "adCopies": [
    "Ad copy 1 (en ${language})",
    "Ad copy 2 (en ${language})",
    "Ad copy 3 (en ${language})",
    "Ad copy 4 (en ${language})",
    "Ad copy 5 (en ${language})"
  ]
  ]
}`;

    const modelName = await getAIModel('adCopies');
    
    const adCopies = await withAILogging(
      'adCopies',
      modelName,
      { productName, headline, description, benefits, language },
      prompt,
      async () => {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Extraire le JSON de la réponse
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Impossible de parser la réponse Gemini');
        }

        const parsed = JSON.parse(jsonMatch[0]);

        if (!Array.isArray(parsed.adCopies) || parsed.adCopies.length === 0) {
          throw new Error('Format de réponse invalide');
        }

        return parsed.adCopies.slice(0, 5);
      }
    );

    return NextResponse.json({ adCopies });
  } catch (error) {
    console.error('Error generating ad copies:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération des ad copies',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
