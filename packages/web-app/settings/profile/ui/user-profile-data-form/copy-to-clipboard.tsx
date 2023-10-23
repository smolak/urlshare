import copyToClipboard from "copy-to-clipboard";
import { Check, Copy } from "lucide-react";
import { FC, useEffect, useState } from "react";

type CopyToClipboardProps = {
  string: string;
};

export const CopyToClipboard: FC<CopyToClipboardProps> = ({ string }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      const timeout = setTimeout(() => {
        setCopied(false);
      }, 1_500);

      return () => clearTimeout(timeout);
    }
  }, [copied]);

  return copied ? (
    <Check size={14} strokeWidth={4} className="absolute right-3.5 top-3.5 cursor-copy text-lg text-green-700" />
  ) : (
    <Copy
      size={14}
      onClick={() => {
        copyToClipboard(string);
        setCopied(true);
      }}
      className="absolute right-3.5 top-3.5 cursor-copy text-lg text-gray-400 hover:text-gray-700"
    />
  );
};
