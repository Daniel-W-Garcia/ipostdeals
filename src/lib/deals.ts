import {
    getCollection,
    type CollectionEntry,
} from 'astro:content';

export async function getActiveDeals(): Promise<
    CollectionEntry<'deals'>[]
> {
    try {
        const deals = await getCollection('deals');

        return deals
            .filter((deal) => deal.data.status === 'active')
            .sort(
                (left, right) =>
                    right.data.publishedAt.getTime() -
                    left.data.publishedAt.getTime(),
            );
    } catch (error) {
        if (isEmptyDealsCollectionError(error)) {
            return [];
        }

        throw error;
    }
}

function isEmptyDealsCollectionError(error: unknown): boolean {
    return (
        error instanceof Error &&
        error.message.includes(
            'The collection "deals" does not exist or is empty.',
        )
    );
}