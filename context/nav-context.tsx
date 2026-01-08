"use client";

import { createContext, useContext, useState } from "react";

type NavContextType = {
  title: string;
  setTitle: (t: string) => void;
};

const NavContext = createContext<NavContextType>({
  title: "",
  setTitle: () => {},
});

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = useState("");

  return (
    <NavContext.Provider value={{ title, setTitle }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavContext);
}
