export const nextTick = () => new Promise<void>((resolve) => queueMicrotask(resolve))
