import { Storage } from "@plasmohq/storage";
import { useStorage } from "@plasmohq/storage/hook";

export const useSyncStorage = <T>(key: string, onInit: (<T>(v?: T, isHydrated?: boolean) => T) | T) =>
  useStorage<T>(
    {
      key,
      instance: new Storage({ area: "sync" }),
    },
    onInit
  );
