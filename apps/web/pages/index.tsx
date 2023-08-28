import { buttonVariants } from "@urlshare/ui/design-system/ui/button";
import { cn } from "@urlshare/ui/utils";
import { WEB_APP_DOMAIN } from "@urlshare/web-app/constants";
import { InfiniteUserFeed } from "@urlshare/web-app/feed/ui/user-feed-list/infinite-user-feed";
import { LoadingIndicator } from "@urlshare/web-app/ui/loading-indicator";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import { AddUrl } from "@urlshare/web-app/url/ui/add-url";
import Head from "next/head";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { FC } from "react";

const HomepageContent: FC = () => {
  const { status, data } = useSession();

  return (
    <>
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

const Homepage = () => {
  return (
    <>
      <Head>
        <title>{WEB_APP_DOMAIN}</title>
        <meta
          name="description"
          content="Share URLs. See what other recommend to know about. Create your feed of URLs you found interesting."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ThreeColumnLayout mainContent={<HomepageContent />} />
    </>
  );
};

export default Homepage;
