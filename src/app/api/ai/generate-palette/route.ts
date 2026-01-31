import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    // Use OpenAI to analyze the image and generate a color palette
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this product image and generate a professional color palette. Provide 4 colors: primary (main brand color), secondary (complementary), accent (for highlights), and background (for page background). Return ONLY a JSON object with this exact structure: {"primary": "#hexcolor", "secondary": "#hexcolor", "accent": "#hexcolor", "background": "#hexcolor"}',
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 200,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const palette = JSON.parse(content);

    return NextResponse.json(palette);
  } catch (error) {
    console.error('Error generating palette:', error);
    return NextResponse.json(
      { error: 'Failed to generate color palette' },
      { status: 500 }
    );
  }
}
