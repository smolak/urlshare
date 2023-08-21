import { customAlphabet } from "nanoid";

export const ALPHABET = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ1234567890_";

export const DEFAULT_ID_SIZE = 21;

export const generateId = (prefix = "", size = DEFAULT_ID_SIZE) => `${prefix}${customAlphabet(ALPHABET, size)()}`;
