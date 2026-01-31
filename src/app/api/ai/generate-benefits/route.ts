import { NextRequest, NextResponse } from 'next/server';
import { genAI, AI_MODEL } from '@/lib/ai-client';

export async function POST(request: NextRequest) {
  try {
    const { productName, description, language = 'FR' } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: 'Nom du produit requis' },
        { status: 400 }
      );
    }

    const prompt = `Tu es un expert en marketing. Génère exactement 5 bénéfices principaux pour un produit appelé "${productName}".
${description ? `Description du produit: ${description}` : ''}

IMPORTANT: Le contenu doit être généré en langue : ${language}.

Réponds UNIQUEMENT avec un JSON valide dans ce format EXACT, sans autre texte:
{
  "benefits": [
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"},
    {"title": "Titre du bénéfice (max 50 caractères, en ${language})", "description": "Description courte (max 150 caractères, en ${language})"}
  ]
}

Les bénéfices doivent être concis, percutants et orientés client.`;

    const model = genAI.getGenerativeModel({ 
      model: AI_MODEL,
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

    if (!Array.isArray(parsed.benefits) || parsed.benefits.length === 0) {
      throw new Error('Format de réponse invalide');
    }

    return NextResponse.json({
      benefits: parsed.benefits.slice(0, 5),
    });
  } catch (error) {
    console.error('Error generating benefits:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la génération des bénéfices',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}
