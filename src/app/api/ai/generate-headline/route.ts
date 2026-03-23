import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/ai-client';
import { getAIModel } from '@/lib/ai-config-service';
import { withAILogging } from '@/lib/ai-logger';

export async function POST(request: NextRequest) {
  try {
    const { productName, language = 'EN' } = await request.json();

    if (!productName) {
      return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 });
    }

    const modelName = await getAIModel('headline');

    const prompt = `Tu es un expert en copywriting. Génère une accroche marketing percutante pour : "${productName}". 
    Format : Langue ${language}, 50-100 caractères. Réponds uniquement avec l'accroche.`;

    const headline = await withAILogging(
      'headline',
      modelName,
      { productName, language },
      prompt,
      async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
      }
    );

    return NextResponse.json({ headline });

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Détection spécifique si le modèle n'est pas encore disponible sur ta région/clé
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Le modèle AI est introuvable ou non activé pour cette clé.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur de génération', message: error.message },
      { status: 500 }
    );
  }
}