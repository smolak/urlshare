import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { buttonVariants } from "@urlshare/ui/design-system/ui/button";
import { cn } from "@urlshare/ui/utils";
import { InfiniteUserFeed } from "@urlshare/web-app/feed/ui/user-feed-list/infinite-user-feed";
import { LoadingIndicator } from "@urlshare/web-app/ui/loading-indicator";
import { LoggedInUserLayout } from "@urlshare/web-app/ui/logged-in-user.layout";
import { AddUrl } from "@urlshare/web-app/url/ui/add-url";
import Head from "next/head";
import Link from "next/link";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactElement } from "react";

import { NextPageWithLayout } from "./_app";

const queryClient = new QueryClient();

const Home: NextPageWithLayout = () => {
  const { status, data } = useSession();

  return (
    <>
      <Head>
        <title>Homepage</title>
        <meta name="description" content="URLs project (beta)" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {status === "loading" && (
        <div className="flex flex-col items-center space-y-6">
          <LoadingIndicator label="Checking auth status..." />
        </div>
      )}
      {status === "unauthenticated" && (
        <section className="grid place-content-center py-20 text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Hello there</h1>
            <p className="py-6">This is still an alpha version, things might not work as expected.</p>
            <Link className={cn(buttonVariants({ variant: "link" }), "text-lg")} href="/auth/login">
              Login
            </Link>
          </div>
        </section>
      )}
      {status === "authenticated" && (
        <div className="flex flex-col gap-4 sm:gap-10">
          <aside>
            <AddUrl />
          </aside>
          <InfiniteUserFeed userId={data?.user.id} />
        </div>
      )}
    </>
  );
};

Home.getLayout = function getLayout(page: ReactElement) {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <LoggedInUserLayout>{page}</LoggedInUserLayout>
      </SessionProvider>
    </QueryClientProvider>
  );
};

export default Home;
