import { Button } from "@urlshare/ui/design-system/ui/button";
import { RiChromeFill, RiGithubFill } from "react-icons/ri";

import { Logo } from "./logo";

export const Footer = () => {
  return (
    <footer className="text-secondary container flex h-16 items-center justify-between border-t text-sm">
      <div className="flex items-center gap-2">
        <Logo />
        <p>Copyright © 2023 - All right reserved</p>
      </div>
      <div className="flex items-center">
        <Button variant="link" className="text-secondary">
          <a
            href="https://chrome.google.com/webstore/detail/urlshareapp/opfefpdpfmiojckgalgilommelcmfcin"
            target="_blank"
          >
            <RiChromeFill size={30} className="inline" /> Chrome extension
          </a>
        </Button>
        <a href="https://github.com/smolak/urlshare" target="_blank">
          <RiGithubFill size={30} className="inline" />
        </a>
      </div>
    </footer>
  );
};
