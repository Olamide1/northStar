import OpenAI from 'openai';
import { CrawledData } from './crawler';

// Lazy-load OpenAI client to ensure env vars are loaded
let openai: OpenAI | null = null;

const getOpenAIClient = () => {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return openai;
};

export interface ProductUnderstanding {
  seedKeywords: string[];
  valueProps: string[];
  competitorAngles: string[];
  targetPersonas: string[];
  useCases: string[];
}

export async function analyzeProduct(
  crawledData: CrawledData,
  optionalInfo?: {
    targetAudience?: string;
    productType?: string;
    competitors?: string[];
    description?: string;
  }
): Promise<ProductUnderstanding> {
  const prompt = `Analyze this website and extract key information for SEO and lead generation.

Website Title: ${crawledData.title}
Description: ${crawledData.description}
${optionalInfo?.description ? `Additional Info: ${optionalInfo.description}` : ''}
${optionalInfo?.targetAudience ? `Target Audience: ${optionalInfo.targetAudience}` : ''}
${optionalInfo?.productType ? `Product Type: ${optionalInfo.productType}` : ''}
${optionalInfo?.competitors?.length ? `Competitors: ${optionalInfo.competitors.join(', ')}` : ''}

Key Content:
${crawledData.headings.slice(0, 20).join('\n')}
${crawledData.paragraphs.slice(0, 10).join('\n\n')}

Please provide:
1. Top 10 seed keywords (long-tail, high-intent queries that potential customers would search)
2. Top 5 value propositions (what makes this product unique and valuable)
3. Top 3 competitor attack angles (how to position against competitors)
4. Top 3 target personas (who are the ideal customers)
5. Top 5 use cases (specific ways customers use this product)

Return as JSON:
{
  "seedKeywords": ["keyword1", "keyword2", ...],
  "valueProps": ["prop1", "prop2", ...],
  "competitorAngles": ["angle1", "angle2", ...],
  "targetPersonas": ["persona1", "persona2", ...],
  "useCases": ["use case1", "use case2", ...]
}`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO strategist and product marketer. Analyze products and extract actionable insights for content marketing and lead generation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content) as ProductUnderstanding;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to analyze product: ${errorMessage}`);
  }
}

export async function generateArticle(
  keyword: string,
  productInfo: {
    title: string;
    valueProps: string[];
    useCases: string[];
    websiteUrl: string;
  }
): Promise<{
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
}> {
  const prompt = `Write a comprehensive SEO article targeting the keyword: "${keyword}"

Product: ${productInfo.title}
Website: ${productInfo.websiteUrl}
Value Props: ${productInfo.valueProps.join(', ')}
Use Cases: ${productInfo.useCases.join(', ')}

Article Requirements:
1. Hook headline that includes the keyword naturally
2. Clear answer in the first 2 lines
3. Supporting sections covering:
   - Value proposition and benefits
   - Example use cases
   - Practical tips
4. Include 2 soft CTAs (at midpoint and end) that naturally lead to the product
5. Use the keyword in H1, H2 headings, and meta tags
6. Write in a helpful, conversational tone
7. Length: 800-1200 words

Return as JSON:
{
  "title": "Article title with keyword",
  "content": "Full markdown content with headings, paragraphs, and CTAs",
  "metaTitle": "SEO meta title (50-60 chars)",
  "metaDescription": "SEO meta description (150-160 chars)"
}`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert SEO content writer. Write engaging, helpful articles that rank well and convert readers into leads.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate article: ${errorMessage}`);
  }
}

export async function generateLeadMagnet(
  type: 'CALCULATOR' | 'TEMPLATE_DOWNLOAD' | 'AUDIT_REQUEST' | 'STARTER_PACK' | 'CHECKLIST',
  productInfo: {
    title: string;
    valueProps: string[];
    useCases: string[];
  },
  articleContext?: string
): Promise<{
  title: string;
  description: string;
  ctaText: string;
}> {
  const typeDescriptions = {
    CALCULATOR: 'a mini calculator (e.g., cost savings, ROI)',
    TEMPLATE_DOWNLOAD: 'a downloadable template customized to the product',
    AUDIT_REQUEST: 'a personalized audit request',
    STARTER_PACK: 'a starter pack PDF',
    CHECKLIST: 'an AI-generated checklist or planner',
  };

  const prompt = `Create a lead magnet for this product.

Product: ${productInfo.title}
Value Props: ${productInfo.valueProps.join(', ')}
Use Cases: ${productInfo.useCases.join(', ')}
Type: ${typeDescriptions[type]}
${articleContext ? `Article Context: ${articleContext.substring(0, 500)}` : ''}

Copy Requirements:
- Hook: Focus on benefits, not features
- Zero jargon
- 2-line pitch maximum
- Include 1-line social proof or micro stat
- Make it compelling and valuable

Return as JSON:
{
  "title": "Lead magnet title (benefit-focused)",
  "description": "2-line description highlighting value",
  "ctaText": "Action-oriented CTA button text"
}`;

  try {
    const response = await getOpenAIClient().chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are an expert copywriter specializing in lead magnets. Write compelling, benefit-focused copy that converts.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(content);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to generate lead magnet: ${errorMessage}`);
  }
}
