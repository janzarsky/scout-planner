import config from "../config.json";
import localConfig from "../config.local.json";

export const streamingUpdates = { ...config, ...localConfig }.streamingUpdates;
