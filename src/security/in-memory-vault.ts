export function randomUUID(): string {
  const hex = '0123456789abcdef';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += hex[Math.floor(Math.random() * 16)];
  }
  return `${result.slice(0, 8)}-${result.slice(8, 12)}-${result.slice(12, 16)}-${result.slice(16, 20)}-${result.slice(20)}`;
}

export class InMemoryVault {
  private store = new Map<string, unknown>();

  put<T>(value: T): string {
    const key = randomUUID();
    this.store.set(key, value);
    return key;
  }

  get<T>(key: string): T | null {
    return (this.store.get(key) as T) ?? null;
  }

  consume<T>(key: string): T | null {
    const value = this.get<T>(key);
    this.store.delete(key);
    return value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}
