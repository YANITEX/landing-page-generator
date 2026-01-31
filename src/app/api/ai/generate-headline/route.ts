import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName, description } = await request.json();

    const prompt = `Generate a compelling, conversion-focused headline for this product:
Product Name: ${productName}
${description ? `Description: ${description}` : ''}

Create a headline that:
- Is attention-grabbing and persuasive
- Highlights the main benefit
- Uses emotional triggers
- Is concise (max 10-12 words)
- Avoids clichés

Return ONLY the headline text, nothing else.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert copywriter specializing in e-commerce and conversion optimization.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 100,
      temperature: 0.8,
    });

    const headline = response.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ headline });
  } catch (error) {
    console.error('Error generating headline:', error);
    return NextResponse.json(
      { error: 'Failed to generate headline' },
      { status: 500 }
    );
  }
}
