// DnDContext.tsx
import { Listing } from "@/types";
import React, { createContext, useContext, useState } from "react";

interface DnDContextProps {
  droppedListing?: Listing | null;
  setDroppedListing: (listing: Listing | null) => void;
}

export const DnDContext = createContext<DnDContextProps | null>(null);

export const DnDProvider = DnDContext.Provider;

export const useDnD = () => {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error("useDnD must be used within a DnDProvider");
  }
  return context;
};
