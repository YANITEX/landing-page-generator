
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

    // Update status to generating
    await prisma.section.update({
      where: { id: sectionId },
      data: { generationStatus: 'generating' },
    });

    // Clean up prompt - handle both object and JSON string
    let finalPrompt = prompt;
    if (typeof prompt === 'object' && prompt !== null) {
        // Prompt is already parsed as an object
        finalPrompt = `Create a professional landing page section image. 
        Style: ${prompt.style || 'modern'}. 
        Mood: ${prompt.mood || 'professional'}.
        Content focus: ${prompt.focus || 'product display'}.
        Details: ${Object.entries(prompt).map(([k,v]) => `${k}: ${v}`).join(', ')}`;
    } else if (typeof prompt === 'string' && prompt.trim().startsWith('{')) {
        try {
            const jsonPrompt = JSON.parse(prompt);
            // Construct a descriptive prompt
            finalPrompt = `Create a professional landing page section image. 
            Style: ${jsonPrompt.style || 'modern'}. 
            Mood: ${jsonPrompt.mood || 'professional'}.
            Content focus: ${jsonPrompt.focus || 'product display'}.
            Details: ${Object.entries(jsonPrompt).map(([k,v]) => `${k}: ${v}`).join(', ')}`;
        } catch (e) {
            // Use as is if not valid JSON
        }
    }

    console.log('Final prompt generated:', finalPrompt.slice(0, 200) + '...');

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

    // Iterate through all parts to find the resulting image
    let output = '';
    for (const part of response.candidates[0].content.parts) {
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
