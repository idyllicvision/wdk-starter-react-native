export class InMemoryVault {
  private store = new Map<string, unknown>();
  private DEFAULT_KEY = '__default__';

  put<T>(value: T, key?: string): string {
    const vaultKey = key ?? this.DEFAULT_KEY;
    this.store.set(vaultKey, value);
    return vaultKey;
  }

  get<T>(key?: string): T | null {
    const vaultKey = key ?? this.DEFAULT_KEY;
    return (this.store.get(vaultKey) as T) ?? null;
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
