import { NextRequest, NextResponse } from 'next/server';
import { genAI, AI_MODEL } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { productName, language = 'FR' } = await request.json();

    if (!productName) {
      return NextResponse.json({ error: 'Nom du produit requis' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: AI_MODEL });

    const prompt = `Tu es un expert en copywriting. Génère une accroche marketing percutante pour : "${productName}". 
    Format : Langue ${language}, 50-100 caractères. Réponds uniquement avec l'accroche.`;

    const result = await model.generateContent(prompt);
    
    // Extraction sécurisée du texte
    const response = await result.response;
    const headline = response.text().trim();

    return NextResponse.json({ headline });

  } catch (error: any) {
    console.error('Gemini API Error:', error);

    // Détection spécifique si le modèle n'est pas encore disponible sur ta région/clé
    if (error.message?.includes('not found') || error.message?.includes('404')) {
      return NextResponse.json(
        { error: 'Le modèle gemini-3-flash-preview est introuvable ou non activé pour cette clé.' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur de génération', message: error.message },
      { status: 500 }
    );
  }
}