import { FC, PropsWithChildren } from "react";

import { Footer } from "../../ui/footer";
import { MainHeader } from "../../ui/main-header";

interface SettingsLayoutProps extends PropsWithChildren {
  title: string;
}

export const SettingsLayout: FC<SettingsLayoutProps> = ({ children, title }) => {
  return (
    <>
      <MainHeader />

      <section className="container px-4 py-3 sm:px-8">
        <header>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        </header>
        <main className="">
          <div className="container mx-auto my-5 max-w-2xl px-0 sm:px-4">{children}</div>
        </main>
      </section>

      <Footer />
    </>
  );
};
