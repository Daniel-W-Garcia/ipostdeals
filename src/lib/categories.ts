const CATEGORY_LABELS: Record<string, string> = {
    cpu: 'CPU',
    nas_hdd: 'NAS Hard Drives',
};

export function getCategoryLabel(category: string): string {
    const normalizedCategory = category.trim().toLowerCase();

    const configuredLabel = CATEGORY_LABELS[normalizedCategory];

    if (configuredLabel) {
        return configuredLabel;
    }

    return normalizedCategory
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, (character) => character.toUpperCase());
}