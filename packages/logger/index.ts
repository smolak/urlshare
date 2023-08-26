import pino from "pino";

// TODO: remove the `|| "info"` once I will know how to pass env to vitest
// TODO: idea: move to env-based configuration?
const level = process.env.LOG_LEVEL || "info";

export const logger = pino({ nestedKey: "payload", browser: { asObject: true }, level });
export type Logger = typeof logger;
