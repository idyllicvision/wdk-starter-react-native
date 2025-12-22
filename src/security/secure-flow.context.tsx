import React, { createContext, useContext, useRef } from 'react';
import { InMemoryVault } from './in-memory-vault';
import { SecureFlowApi } from './secure-flow.types';

const SecureFlowContext = createContext<SecureFlowApi | null>(null);

export const SecureFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const vaultRef = useRef<InMemoryVault | null>(null);

  if (!vaultRef.current) {
    vaultRef.current = new InMemoryVault();
  }

  const api: SecureFlowApi = {
    put: (value: unknown, key?: string) => vaultRef.current!.put(value, key),
    get: (key) => vaultRef.current!.get(key),
    consume: (key) => vaultRef.current!.consume(key),
    delete: (key) => vaultRef.current!.delete(key),
    clear: () => vaultRef.current!.clear(),
  };

  return <SecureFlowContext.Provider value={api}>{children}</SecureFlowContext.Provider>;
};

export const useSecureFlow = (): SecureFlowApi => {
  const ctx = useContext(SecureFlowContext);
  if (!ctx) {
    throw new Error('useSecureFlow must be used within SecureFlowProvider');
  }
  return ctx;
};
