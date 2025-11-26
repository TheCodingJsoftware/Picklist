export function debounce<T extends (...args: any[]) => void>(fn: T, ms = 200) {
    let handle: number | undefined;
    return (...args: Parameters<T>) => {
        if (handle) window.clearTimeout(handle);
        handle = window.setTimeout(() => fn(...args), ms);
    };
}