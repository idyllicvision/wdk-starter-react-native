export type SecureKey = string;

export interface SecureFlowApi {
  put<T>(value: T): SecureKey;
  get<T>(key: SecureKey): T | null;
  consume<T>(key: SecureKey): T | null;
  delete(key: SecureKey): void;
  clear(): void;
}
