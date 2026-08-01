// src/content.config.ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const deals = defineCollection({
    loader: glob({ base: './src/content/deals', pattern: '**/*.{md,mdx}' }),
    schema: ({ image }) =>
        z.object({
            title: z.string(),
            store: z.string(),
            price: z.number(),
            originalPrice: z.number(),
            url: z.string().url(),
            image: image().optional(),
            category: z.string(),
            tags: z.array(z.string()).default([]),
            expires: z.coerce.date().optional(),
            featured: z.boolean().default(false),
            coupon: z.string().optional(),
        }),
});

export const collections = { deals };
