import { FC, PropsWithChildren } from "react";

import { Footer } from "./footer";
import { MainHeader } from "./main-header";

export const LoggedInUserLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <>
      <MainHeader />

      <div className="container p-4 md:py-6 lg:py-8">
        <div className="grid grid-cols-9 gap-5 md:gap-10">
          <div className="col-span-2 max-lg:hidden lg:col-span-2"></div>
          <div className="order-last col-span-9 flex flex-col gap-10 md:order-none md:col-span-6 lg:col-span-5">
            <main>{children}</main>
          </div>
          <div className="col-span-9 sm:block md:col-span-3 lg:col-span-2"></div>
        </div>
      </div>
      <Footer />
    </>
  );
};
