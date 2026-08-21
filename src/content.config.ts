import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
	docs: defineCollection({
		loader: docsLoader(),
		schema: docsSchema({
			extend: z.object({
				pageType: z.enum([
					'landing',
					'concept',
					'procedure',
					'troubleshooting',
					'integration',
					'reference',
					'roadmap',
				]),
				maturity: z
					.enum([
						'available',
						'experimental-active',
						'experimental-testing',
						'planned',
						'deprecated',
					])
					.optional(),
				complexity: z.enum(['advanced']).optional(),
			}),
		}),
	}),
};
