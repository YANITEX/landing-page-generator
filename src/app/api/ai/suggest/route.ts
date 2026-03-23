import { NextRequest, NextResponse } from 'next/server';
import { genAI } from '@/lib/ai-client';
import { getAIModel } from '@/lib/ai-config-service';
import { withAILogging } from '@/lib/ai-logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, context, language = 'EN' } = body;
    // context contains product info and potentially existing persona/angle info

    let prompt = '';

    if (type === 'persona_name') {
      prompt = `Suggère UN SEUL nom court et créatif (moins de 5 mots) pour un Persona Marketing cible pour ce produit.
      Produit: ${context.productName}
      Description: ${context.description}
      Langue: ${language}
      Réponds UNIQUEMENT avec le nom.`;
    } 
    else if (type === 'persona_description') {
        prompt = `Rédige une description courte (1-2 phrases) des douleurs et désirs d'un Persona pour ce produit.
        Produit: ${context.productName}
        Description: ${context.description}
        Langue: ${language}
        Réponds UNIQUEMENT avec la description.`;
    }
    else if (type === 'angle_name') {
        prompt = `Suggère UN SEUL nom d'angle marketing (court) pour ce Persona.
        Produit: ${context.productName}
        Persona: ${context.personaName}
        Persona Description: ${context.personaDescription}
        Langue: ${language}
        Réponds UNIQUEMENT avec le nom de l'angle.`;
    }
    else if (type === 'ad_copy') {
        prompt = `Rédige UNE SEULE ad copy (court texte publicitaire) pour cet angle marketing.
        Produit: ${context.productName}
        Persona: ${context.personaName}
        Angle: ${context.angleName}
        Langue: ${language}
        Réponds UNIQUEMENT avec le texte de la publicité.`;
    }
    else {
        return NextResponse.json({ error: 'Type invalide' }, { status: 400 });
    }

    const modelName = await getAIModel('suggest');
    
    const suggestion = await withAILogging(
      'suggest',
      modelName,
      { type, context, language },
      prompt,
      async () => {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim().replace(/^"|"$/g, '');
      }
    );

    return NextResponse.json({ suggestion });

  } catch (error) {
    console.error('Error generating suggestion:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestion' },
      { status: 500 }
    );
  }
}
