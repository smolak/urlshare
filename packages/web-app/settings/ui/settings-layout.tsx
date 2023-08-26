import { SessionUser } from "next-auth";
import { FC, PropsWithChildren } from "react";

import { Footer } from "../../ui/footer";
import { MainHeader } from "../../ui/main-header";

interface SettingsLayoutProps extends PropsWithChildren {
  title: string;
  user: SessionUser;
}

export const SettingsLayout: FC<SettingsLayoutProps> = ({ children, title }) => {
  return (
    <>
      <MainHeader />

      <section className="container px-4 py-3 sm:px-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </header>
        <main className="">{children}</main>
      </section>

      <Footer />
    </>
  );
};
