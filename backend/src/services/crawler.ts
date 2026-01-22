import axios from 'axios';
import * as cheerio from 'cheerio';

export interface CrawledData {
  title: string;
  description: string;
  headings: string[];
  paragraphs: string[];
  links: string[];
  sections: {
    pricing?: string;
    features?: string;
    about?: string;
    blog?: string;
  };
  fullText: string;
}

export async function crawlWebsite(url: string): Promise<CrawledData> {
  try {
    // Normalize URL
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    
    // Fetch the page
    const response = await axios.get(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NorthstarBot/1.0)',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Extract basic info
    const title = $('title').text() || '';
    const description = $('meta[name="description"]').attr('content') || '';
    
    // Extract headings
    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(text);
    });

    // Extract paragraphs
    const paragraphs: string[] = [];
    $('p').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 20) paragraphs.push(text);
    });

    // Extract links
    const links: string[] = [];
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        const absoluteUrl = href.startsWith('http') 
          ? href 
          : new URL(href, normalizedUrl).toString();
        links.push(absoluteUrl);
      }
    });

    // Try to identify sections
    const sections: CrawledData['sections'] = {};
    
    // Look for pricing section
    $('*').each((_, el) => {
      const text = $(el).text().toLowerCase();
      const id = $(el).attr('id')?.toLowerCase() || '';
      const className = $(el).attr('class')?.toLowerCase() || '';
      
      if ((text.includes('pricing') || id.includes('pricing') || className.includes('pricing')) && !sections.pricing) {
        sections.pricing = $(el).text().trim();
      }
      if ((text.includes('feature') || id.includes('feature') || className.includes('feature')) && !sections.features) {
        sections.features = $(el).text().trim();
      }
      if ((text.includes('about') || id.includes('about') || className.includes('about')) && !sections.about) {
        sections.about = $(el).text().trim();
      }
      if ((text.includes('blog') || id.includes('blog') || className.includes('blog')) && !sections.blog) {
        sections.blog = $(el).text().trim();
      }
    });

    // Get full text (cleaned)
    const fullText = $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit to 10k chars

    return {
      title,
      description,
      headings,
      paragraphs,
      links,
      sections,
      fullText,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to crawl website: ${errorMessage}`);
  }
}
