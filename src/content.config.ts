import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const deals = defineCollection({
    loader: glob({
        base: './src/content/deals',
        pattern: '**/*.{md,mdx}',
    }),
    schema: ({ image }) =>
        z
            .object({
                title: z.string().min(1),
                displayTitle: z.string().min(1).optional(),
                store: z.string().min(1),
                price: z.number().positive(),
                currency: z.literal('USD').default('USD'),

                sourceName: z.string().min(1),
                sourceUrl: z.string().url(),
                priceHistoryUrl: z.string().url().optional(),
                priceHistorySource: z.string().min(1).optional(),
                retailerUrl: z.string().url().optional(),
                affiliateUrl: z.string().url().optional(),
                conditionLabel: z.string().min(1).optional(),
                conditionNote: z.string().min(1).optional(),

                comparisonPrice: z.number().positive().optional(),
                comparisonPriceLabel: z.string().min(1).optional(),

                image: image().optional(),
                category: z.string().min(1),
                tags: z.array(z.string()).default([]),
                coupon: z.string().min(1).optional(),

                firstSeenAt: z.coerce.date(),
                lastCheckedAt: z.coerce.date(),
                publishedAt: z.coerce.date(),

                sourceCandidateId: z.number().int().positive().optional(),
                featured: z.boolean().default(false),
                status: z.enum(['active', 'expired']).default('active'),
            })
            .superRefine((deal, context) => {
                const hasComparisonPrice = deal.comparisonPrice !== undefined;
                const hasComparisonLabel =
                    deal.comparisonPriceLabel !== undefined;

                if (hasComparisonPrice !== hasComparisonLabel) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            'comparisonPrice and comparisonPriceLabel must be provided together.',
                        path: hasComparisonPrice
                            ? ['comparisonPriceLabel']
                            : ['comparisonPrice'],
                    });
                }

                if (
                    deal.comparisonPrice !== undefined &&
                    deal.comparisonPrice <= deal.price
                ) {
                    context.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            'comparisonPrice must be greater than the current price.',
                        path: ['comparisonPrice'],
                    });
                }
            }),
});

export const collections = { deals };