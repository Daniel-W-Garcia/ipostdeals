import {
    getCollection,
    type CollectionEntry,
} from 'astro:content';

const dealModules = import.meta.glob(
    '../content/deals/**/*.{md,mdx}',
    {
        eager: true,
    },
);

export async function getActiveDeals(): Promise<
    CollectionEntry<'deals'>[]
> {
    if (Object.keys(dealModules).length === 0) {
        return [];
    }

    const deals = await getCollection('deals');

    return deals
        .filter((deal) => deal.data.status === 'active')
        .sort(
            (left, right) =>
                right.data.publishedAt.getTime() -
                left.data.publishedAt.getTime(),
        );
}