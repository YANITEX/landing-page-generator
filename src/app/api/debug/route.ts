import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'No API key found' }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Test simple image generation with gemini-3-pro-image-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [
          {
            text: "Generate a simple test image of a blue square"
          }
        ],
      },
    });

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    const candidate = response.candidates[0];
    if (!candidate || !candidate.content || !candidate.content.parts) {
      throw new Error("Invalid response structure from Gemini API");
    }

    // Check if we got an image back
    let hasImage = false;
    for (const part of candidate.content.parts) {
      if (part.inlineData) {
        hasImage = true;
        break;
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'API Key works with gemini-3-pro-image-preview',
      hasImage,
      hasApiKey: !!apiKey,
      keyPreview: apiKey ? `${apiKey.slice(0, 8)}...` : 'none'
    });

  } catch (error: any) {
    console.error('Debug API error:', error);
    return NextResponse.json({ 
      error: 'API test failed', 
      details: error.message,
      hasApiKey: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
    }, { status: 500 });
  }
}
