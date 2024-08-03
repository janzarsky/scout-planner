import config from "../config.json";
import localConfig from "../config.local.json";

const streamingUpdates = { ...config, ...localConfig }.streamingUpdates;
const enabledPrefixes = { ...config, ...localConfig }
  .streamingUpdatesEnabledPrefixes;

export function streamingUpdatesEnabled(table) {
  if (!table || !enabledPrefixes) return streamingUpdates;

  const matchesAnyPrefix =
    enabledPrefixes.find((prefix) => table.startsWith(prefix)) !== undefined;

  return matchesAnyPrefix ? true : streamingUpdates;
}
