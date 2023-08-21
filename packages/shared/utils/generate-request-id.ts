import { generateId } from "./generate-id";

export const REQUEST_ID_PREFIX = "req_";

export const generateRequestId = () => generateId(REQUEST_ID_PREFIX);
export type RequestId = ReturnType<typeof generateRequestId>;
