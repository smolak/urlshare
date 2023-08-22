import { FC, ReactNode } from "react";

import { Footer } from "./footer";

type UserFeedLayoutProps = {
  feed: ReactNode;
};

export const HomepageFeedLayout: FC<UserFeedLayoutProps> = ({ feed }) => {
  return (
    <>
      <div className="grid grid-cols-12 gap-16">
        <main className="col-span-8">{feed}</main>
      </div>
      <Footer />
    </>
  );
};
