import { createContext, useContext, type ReactNode } from "react";

import { useStore } from "./StoreContext";

type CurrencyContextType = {
  currency: string;
  symbol: string;
  formatPrice: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { currency, symbol, country } = useStore();
  const locale = country === "AU" ? "en-AU" : country === "NZ" ? "en-NZ" : "en-IN";

  const formatPrice = (amount: number) =>
    `${symbol}${amount.toLocaleString(locale, {
      maximumFractionDigits: 0,
    })}`;

  return (
    <CurrencyContext.Provider value={{ currency, symbol, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error("useCurrency must be used within CurrencyProvider");
  }
  return ctx;
}
