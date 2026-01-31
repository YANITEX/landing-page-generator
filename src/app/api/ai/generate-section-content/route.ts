import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const SECTION_PROMPTS: Record<string, string> = {
  hero: 'Create a powerful hero section with a compelling headline and subheadline that immediately captures attention and communicates the core value proposition.',
  problem: 'Describe the pain points and problems that customers face without this product. Make it relatable and specific.',
  solution: 'Explain how this product solves the problems mentioned. Focus on the transformation and results.',
  benefits: 'List the key benefits in a compelling way, focusing on outcomes rather than features.',
  'how-it-works': 'Explain how to use the product in 3-4 simple steps. Make it sound effortless.',
  'before-after': 'Create a compelling before/after narrative showing the transformation this product enables.',
  'social-proof': 'Write compelling social proof copy that builds trust and credibility.',
  cta: 'Create an urgent, benefit-driven call-to-action that motivates immediate purchase.',
};

export async function POST(request: NextRequest) {
  try {
    const { sectionType, productName, headline, description, benefits } =
      await request.json();

    const sectionPrompt = SECTION_PROMPTS[sectionType] || '';

    const prompt = `Generate conversion-optimized content for the "${sectionType}" section of a landing page.

Product Information:
- Name: ${productName}
${headline ? `- Headline: ${headline}` : ''}
${description ? `- Description: ${description}` : ''}
${
  benefits && benefits.length > 0
    ? `- Benefits: ${benefits.map((b: any) => b.title).join(', ')}`
    : ''
}

Task: ${sectionPrompt}

Requirements:
- Use persuasive, conversion-focused language
- Include emotional triggers
- Be specific and concrete
- Use short paragraphs and bullet points where appropriate
- Optimize for readability

Return ONLY the content text in HTML format (use <h2>, <p>, <ul>, <li> tags as needed).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert landing page copywriter with expertise in conversion optimization and persuasive writing.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 800,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content || '';

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error generating section content:', error);
    return NextResponse.json(
      { error: 'Failed to generate section content' },
      { status: 500 }
    );
  }
}
