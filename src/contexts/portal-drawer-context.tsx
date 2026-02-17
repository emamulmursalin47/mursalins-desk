"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

interface PortalDrawerContextValue {
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
}

const PortalDrawerContext = createContext<PortalDrawerContextValue | undefined>(
  undefined,
);

export function PortalDrawerProvider({ children }: { children: ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <PortalDrawerContext.Provider value={{ drawerOpen, setDrawerOpen }}>
      {children}
    </PortalDrawerContext.Provider>
  );
}

export function usePortalDrawer() {
  const ctx = useContext(PortalDrawerContext);
  if (!ctx)
    throw new Error("usePortalDrawer must be used within PortalDrawerProvider");
  return ctx;
}
