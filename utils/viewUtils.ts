export const ellipsis = (value: string | null | undefined, maxLength: number): string => {

    if (!value) return ''
    return value.length > maxLength ? value.slice(0, maxLength) + '...' : value;
}
