import { createContext, useContext, useEffect } from "react";
import { getCommandHandler } from "./commandHandler";

const CommandContext = createContext();

export function useCommandHandler(store) {
  let commandHandler = useContext(CommandContext);

  if (!commandHandler) {
    const initCommandHandler = () => {
      commandHandler = getCommandHandler();
      useContext(CommandContext, () => commandHandler);
    };

    useEffect(() => initCommandHandler(), [store]);
  }

  return { dispatchCommand: commandHandler.dispatchCommand };
}
