
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  let sectionId: string | null = null;
  
  try {
    const body = await request.json();
    sectionId = body.sectionId;
    const { prompt, productImageUrl } = body;

    console.log('Generate section image - received:', {
      sectionId,
      promptType: typeof prompt,
      productImageUrl: productImageUrl ? 'provided' : 'none'
    });

    if (!sectionId) {
      return NextResponse.json({ error: 'Section ID is required' }, { status: 400 });
    }
    
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Charger la section et la landing page depuis la base de données
    const section = await prisma.section.findUnique({
      where: { id: sectionId },
      include: {
        landingPage: {
          select: {
            primaryColor: true,
            secondaryColor: true,
            accentColor: true,
            backgroundColor: true,
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json({ error: 'Section not found' }, { status: 404 });
    }

    // Update status to generating
    await prisma.section.update({
      where: { id: sectionId },
      data: { generationStatus: 'generating' },
    });

    // Construire le prompt structuré au format JSON demandé
    const structuredPrompt = {
      mode: "image_to_image",
      language: section.landingPage ? "fr" : "fr", // Peut être récupéré de la BD si nécessaire
      canvas: {
        width: 1440,
        height: "auto",
        sectionType: section.type
      },
      palette: {
        primaryColor: section.landingPage?.primaryColor || "auto",
        secondaryColor: section.landingPage?.secondaryColor || "auto",
        accentColor: section.landingPage?.accentColor || "auto",
        backgroundColor: section.landingPage?.backgroundColor || "auto",
      },
      prompt: prompt // Le prompt du client (obligatoire)
    };

    const finalPrompt = JSON.stringify(structuredPrompt, null, 2);
    
    console.log('Structured prompt:', finalPrompt);

    // Initialize AI with the specific SDK for Image Generation
    // Fallback to API_KEY if GEMINI_API_KEY is not set
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables");
    }
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare parts
    const parts: any[] = [
        { text: finalPrompt }
    ];

    if (productImageUrl) {
        try {
            // Handle relative URLs by prepending the origin if needed
            let urlToFetch = productImageUrl;
            if (urlToFetch.startsWith('/')) {
                const origin = request.nextUrl.origin;
                urlToFetch = `${origin}${urlToFetch}`;
            }

            console.log(`Fetching product image from: ${urlToFetch}`);
            const imageResp = await fetch(urlToFetch);
            
            if (!imageResp.ok) {
                console.error(`Failed to fetch image: ${imageResp.status} ${imageResp.statusText}`);
            } else {
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

    // Prepare contents array correctly for SDK v1.x (as per user snippet "contents: { parts: ... }")
    // Note: The user snippet shows "contents: { parts: [...] }" which implies a single object.
    // However, typings might require an array or the specific `contents` property on request object.
    // Let's stick exactly to the working user snippet pattern.

    console.log(`Calling Gemini model 'gemini-3-pro-image-preview' with ${parts.length} parts...`);

    // Call the model using the new SDK pattern
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: parts,
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    // Vérifications de sécurité pour TypeScript
    const candidate = response.candidates[0];
    if (!candidate?.content?.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Iterate through all parts to find the resulting image
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
    
    // Update section with result
    await prisma.section.update({
      where: { id: sectionId },
      data: { 
        images: JSON.stringify([output]), // Stocker comme JSON string pour SQLite
        generationStatus: 'completed'
      },
    });

    return NextResponse.json({ success: true, image: output });

  } catch (error: any) {
    console.error('Error generating section image:', error);
    
    // Safely update error status
    if (sectionId) {
         try {
            await prisma.section.update({
                where: { id: sectionId },
                data: { generationStatus: 'error' },
            });
         } catch(e) {
             console.error("Failed to update section status to error", e);
         }
    }

    return NextResponse.json({ error: 'Failed to generate image', details: error.message }, { status: 500 });
  }
}
