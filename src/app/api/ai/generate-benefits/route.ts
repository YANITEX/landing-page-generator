import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { productName, description, headline } = await request.json();

    const prompt = `Generate 4-6 compelling product benefits for:
Product Name: ${productName}
${headline ? `Headline: ${headline}` : ''}
${description ? `Description: ${description}` : ''}

Each benefit should:
- Focus on customer outcomes (not features)
- Use emotional and rational triggers
- Be specific and tangible
- Include an emoji icon
- Have a short title (3-5 words)
- Have a description (10-15 words)

Return ONLY a JSON array with this exact structure:
[
  {
    "icon": "🎯",
    "title": "Benefit title",
    "description": "Benefit description explaining the value"
  }
]`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert copywriter specializing in benefit-driven marketing.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '[]';
    const benefits = JSON.parse(content);

    return NextResponse.json({ benefits });
  } catch (error) {
    console.error('Error generating benefits:', error);
    return NextResponse.json(
      { error: 'Failed to generate benefits' },
      { status: 500 }
    );
  }
}
