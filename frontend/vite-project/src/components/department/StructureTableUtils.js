export const TABLE_PAGE_SIZE = 8;

export const STATUS_OPTIONS = [
    { value: "ALL", label: "All" },
    { value: "ACTIVE", label: "Active" },
    { value: "INACTIVE", label: "Inactive" },
];

export function isStructureActive(item) {
    return item.isActive !== false && item.status !== "INACTIVE";
}

export function getPageItems(page, pageCount) {
    if (pageCount <= 7) {
        return Array.from({ length: pageCount }, (_, i) => i);
    }

    const items = [0];
    if (page > 2) items.push("...");

    const start = Math.max(1, page - 1);
    const end = Math.min(pageCount - 2, page + 1);
    for (let i = start; i <= end; i++) items.push(i);

    if (page < pageCount - 3) items.push("...");
    items.push(pageCount - 1);

    return items;
}