import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleGenAI } from "@google/genai";
import { prisma } from './prisma';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY is not defined in environment variables');
}

export const genAI = new GoogleGenerativeAI(apiKey || '');

export const AI_MODEL = 'gemini-2.0-flash';
export const AI_IMAGE_MODEL = 'gemini-2.5-flash-image';

// Fonction helper pour générer les images de section
export async function generateSectionImage(sectionId: string, sectionType: string, landingPage: any): Promise<string | null> {
  try {
    // Marquer comme en cours de génération
    await prisma.section.update({
      where: { id: sectionId },
      data: { generationStatus: 'generating' }
    });

    // Construire le prompt basé sur le type de section
    const prompt = buildSectionPrompt(sectionType, landingPage);
    
    // Récupérer l'image du produit via persona
    const productImageUrl = landingPage.persona?.product?.images?.[0]?.url;

    // Initialize AI
    const ai = new GoogleGenAI({ apiKey: apiKey || '' });
    
    // Prepare parts
    const parts: any[] = [
        { text: prompt }
    ];

    if (productImageUrl) {
        try {
            const imageResp = await fetch(productImageUrl);
            
            if (imageResp.ok) {
                const arrayBuffer = await imageResp.arrayBuffer();
                const base64Image = Buffer.from(arrayBuffer).toString('base64');
                const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';
                
                parts.unshift({
                    inlineData: {
                        data: base64Image,
                        mimeType: mimeType,
                    },
                });
            }
        } catch (e) {
            console.error("Failed to fetch product image for context", e);
        }
    }

    // Call the model
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const candidate = response.candidates[0];
    
    // Vérifications de sécurité pour TypeScript
    if (!candidate?.content?.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Extraire l'image générée
    let output = '';
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        output = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!output) {
      throw new Error("No image was returned in the AI response");
    }
    
    return output;

  } catch (error: any) {
    console.error('Error generating section image:', error);
    throw error;
  }
}

// Fonction pour construire le prompt selon le type de section
function buildSectionPrompt(sectionType: string, landingPage: any): string {
  const baseStyle = `Style moderne et professionnel, couleurs ${landingPage.primaryColor}, ${landingPage.secondaryColor}, ${landingPage.accentColor}`;
  
  const prompts: { [key: string]: string } = {
    'hero': `Créez une image de hero/en-tête pour une landing page pour "${landingPage.headline}". ${baseStyle}. Incluez le titre principal, sous-titre et CTA. Design impactant et moderne.`,
    
    'problem': `Créez une image illustrant les problèmes/douleurs que résout le produit "${landingPage.headline}". ${baseStyle}. Montrez la frustration ou les difficultés du persona cible.`,
    
    'solution': `Créez une image montrant la solution apportée par "${landingPage.headline}". ${baseStyle}. Illustrez comment le produit résout les problèmes, avec des éléments visuels positifs.`,
    
    'benefits': `Créez une image présentant les bénéfices de "${landingPage.headline}". ${baseStyle}. Montrez des icônes et points clés des avantages produit de manière organisée.`,
    
    'how-it-works': `Créez une image expliquant le fonctionnement de "${landingPage.headline}". ${baseStyle}. Processus étape par étape, schéma ou workflow visuel clair.`,
    
    'social-proof': `Créez une image de preuve sociale pour "${landingPage.headline}". ${baseStyle}. Témoignages clients, étoiles, avis, logos de clients ou statistiques de satisfaction.`,
    
    'faq': `Créez une image de section FAQ pour "${landingPage.headline}". ${baseStyle}. Questions fréquentes avec réponses, format Q&A lisible et organisé.`,
    
    'cta': `Créez une image d'appel à l'action final pour "${landingPage.headline}". ${baseStyle}. Bouton CTA proéminent "${landingPage.ctaText}", urgence, prix ${landingPage.price}${landingPage.currency}.`
  };

  return prompts[sectionType] || `Créez une image de section "${sectionType}" pour la landing page "${landingPage.headline}". ${baseStyle}. Design professionnel et moderne.`;
}
