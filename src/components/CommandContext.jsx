import React from "react";
import { createContext, useContext } from "react";
import { getCommandHandler } from "../store/commandHandler";
import { useStore } from "react-redux";

const CommandContext = createContext();

export function CommandProvider({ children }) {
  const store = useStore();
  const commandHandler = getCommandHandler(store);

  return (
    <CommandContext.Provider value={commandHandler}>
      {children}
    </CommandContext.Provider>
  );
}

export function useCommandHandler() {
  return useContext(CommandContext);
}
