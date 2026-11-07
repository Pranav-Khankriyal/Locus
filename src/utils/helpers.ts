export const delay = (ms = 400) => new Promise<void>((resolve) => setTimeout(resolve, ms));
export const newId = (prefix: string) => prefix + '-' + crypto.randomUUID().slice(0, 8);
