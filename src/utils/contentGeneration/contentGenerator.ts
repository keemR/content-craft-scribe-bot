import React from 'react';
import { ContentGenerationOptions } from './types';
import { createTitleFromKeywords, slugify } from './helpers';
import { generateKeyTakeaways } from './generators/takeawaysGenerator';
import { generateIntroduction } from './generators/introductionGenerator';
import { generateHeadings } from './generators/headingsGenerator';
import { generateSectionContent } from './generators/sectionGenerator';
import { generateFAQs } from './generators/faqGenerator';
import { generateConclusion } from './generators/conclusionGenerator';
import { determineTopicCategory } from './topicCategories';
import { generateVisualContent, formatVisualContentForMarkdown, resetUsedImages } from './generators/visualContentGenerator';

/**
 * Generates high-quality SEO-optimized content based on user inputs
 */
export const generateSEOContent = (options: ContentGenerationOptions): string => {
  // Reset image tracking for new content generation
  resetUsedImages();
  
  const { 
    researchData, 
    targetKeywords, 
    articleLength, 
    tone, 
    includeImages, 
    includeFAQs,
    seoLevel = 80,
    targetAudience = '',
    preventRepetition = true,
    contentSpecificity = 70,
    includeExamples = true,
    includeStatistics = true,
    useCaseStudies = true
  } = options;

  // Ensure articleLength is a number
  const numericArticleLength = typeof articleLength === 'string' 
    ? parseInt(articleLength, 10) 
    : articleLength;

  // Parse keywords for better semantic richness
  const keywordsList = targetKeywords.split(',').map(k => k.trim());
  const primaryKeyword = keywordsList[0] || '';
  
  // Identify topic category to customize content structure
  const topicCategory = determineTopicCategory(primaryKeyword);
  
  let content = "";
  
  // Create optimized title without redundancies
  const title = createTitleFromKeywords(keywordsList, topicCategory);
  content += `# ${title}\n\n`;
  
  // Add estimated reading time for better user experience
  const estimatedReadingTime = Math.ceil(numericArticleLength / 200); // 200 words per minute
  content += `*Reading time: ${estimatedReadingTime} minutes*\n\n`;
  
  // Key Takeaways - optimized for featured snippets with specific, valuable insights
  content += "## Key Takeaways\n\n";
  const takeaways = generateKeyTakeaways(keywordsList, topicCategory);
  content += takeaways + "\n\n";
  
  // Generate introduction with topic-specific information
  content += generateIntroduction(keywordsList, tone, targetAudience, topicCategory) + "\n\n";
  
  // Table of Contents for improved UX and crawlability
  content += "## Table of Contents\n\n";
  const headings = generateHeadings(keywordsList, topicCategory, targetAudience);
  
  // Generate Table of Contents with anchor links
  headings.forEach((heading, index) => {
    content += `${index + 1}. [${heading}](#${slugify(heading)})\n`;
  });
  content += "\n\n";
  
  // Calculate the section length as a number based on article length and number of headings
  const sectionLength = Math.floor(numericArticleLength / headings.length);
  
  headings.forEach((heading, index) => {
    // Create proper heading IDs for anchor links
    content += `<h2 id="${slugify(heading)}">${heading}</h2>\n\n`;
    
    // Generate section content with proper argument types
    content += generateSectionContent(
      heading, 
      keywordsList, 
      tone, 
      sectionLength, 
      targetAudience, 
      topicCategory
    ) + "\n\n";
    
    // Add comprehensive visual content for each section with no duplicates
    if (includeImages) {
      const visuals = generateVisualContent(heading, primaryKeyword, topicCategory, index);
      const visualMarkdown = formatVisualContentForMarkdown(visuals);
      content += visualMarkdown + "\n\n";
    }
  });

  // Add relevant FAQs specific to the topic
  if (includeFAQs) {
    content += "## Frequently Asked Questions\n\n";
    content += generateFAQs(keywordsList, targetAudience, topicCategory) + "\n\n";
  }

  // Add a conclusion with final CTA relevant to the topic
  content += "## Conclusion\n\n";
  content += generateConclusion(keywordsList, tone, targetAudience, topicCategory) + "\n\n";
  
  return content;
};
