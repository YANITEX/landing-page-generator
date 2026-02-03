
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Handle relative URLs by prepending the origin if needed
    let urlToFetch = imageUrl;
    if (urlToFetch.startsWith('/')) {
        const origin = request.nextUrl.origin;
        urlToFetch = `${origin}${urlToFetch}`;
    }

    // Fetch the image
    const imageResp = await fetch(urlToFetch);
    if (!imageResp.ok) {
        throw new Error(`Failed to fetch image: ${imageResp.status}`);
    }
    
    const arrayBuffer = await imageResp.arrayBuffer();
    const contentType = imageResp.headers.get('content-type') || 'image/jpeg';
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // Initialize AI
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API Key not found in environment variables");
    }
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
      Analyse cette image de produit et extrait une palette de couleurs adaptée à une landing page moderne et professionnelle.
      Retourne EXACTEMENT un objet JSON avec cette structure, sans blocs de code :
      {
        "primary": "code hex",
        "secondary": "code hex", 
        "accent": "code hex",
        "background": "code hex"
      }
      
      Critères :
      - primary: couleur dominante ou couleur de marque visible sur le produit
      - secondary: couleur complémentaire ou secondaire du produit
      - accent: couleur vive pour les CTA et éléments importants
      - background: couleur neutre claire ou foncée pour le fond
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: contentType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const candidate = response.candidates[0];
    const text = candidate.content.parts.find((p: any) => p.text)?.text || '';
    
    try {
      const cleanText = text.replace(/```json|```/g, '').trim();
      const palette = JSON.parse(cleanText);
      
      // Validate palette structure
      if (!palette.primary || !palette.secondary || !palette.accent || !palette.background) {
        throw new Error('Invalid palette structure');
      }
      
      return NextResponse.json(palette);
    } catch (e) {
      console.error('Failed to parse palette JSON:', text);
      // Fallback palette
      return NextResponse.json({ 
        primary: '#2563eb', 
        secondary: '#64748b', 
        accent: '#10b981', 
        background: '#ffffff' 
      });
    }

  } catch (error) {
    console.error('Error extracting palette:', error);
    return NextResponse.json({ 
      primary: '#2563eb', 
      secondary: '#64748b', 
      accent: '#10b981', 
      background: '#ffffff' 
    });
  }
}
