import { createContext, useContext, type ReactNode } from "react";

import { storeConfig, type StoreConfig } from "@/config/storeConfig";

const StoreContext = createContext<StoreConfig>(storeConfig);

export function StoreProvider({ children }: { children: ReactNode }) {
  return <StoreContext.Provider value={storeConfig}>{children}</StoreContext.Provider>;
}

export function useStore() {
  return useContext(StoreContext);
}
