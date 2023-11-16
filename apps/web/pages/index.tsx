import { User } from "@urlshare/db/prisma/client";
import { buttonVariants } from "@urlshare/ui/design-system/ui/button";
import { cn } from "@urlshare/ui/utils";
import { ErrorLoadingCategories } from "@urlshare/web-app/category/ui/category-picker/error-loading-categories";
import { WEB_APP_DOMAIN } from "@urlshare/web-app/constants";
import { FeedListFilters } from "@urlshare/web-app/feed/ui/feed-list-filters";
import { InfiniteUserFeed } from "@urlshare/web-app/feed/ui/user-feed-list/infinite-user-feed";
import { api } from "@urlshare/web-app/trpc/client";
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
          <h1 className="mb-6 text-5xl font-bold">Welcome to {WEB_APP_DOMAIN}</h1>
          <div className="flex max-w-lg flex-col gap-6">
            <p>
              Discover a place where sharing links is as easy as using Twitter. Imagine a space where you can follow and
              be followed.
            </p>
            <p>You can share cool links and discover ones that others think are interesting too.</p>
            <p>
              <Link className={cn(buttonVariants({ variant: "default" }), "text-lg")} href="/auth/login">
                Login
              </Link>
            </p>
          </div>
        </section>
      )}
      {status === "authenticated" ? <AuthenticatedUserPageContent userId={data.user.id} /> : null}
    </>
  );
};

type AuthenticatedUserPageContentProps = {
  userId: User["id"];
};

const AuthenticatedUserPageContent: FC<AuthenticatedUserPageContentProps> = ({ userId }) => {
  const {
    data: categories,
    isLoading,
    isSuccess,
    isError,
    isRefetching,
    refetch,
  } = api.category.getUserCategories.useQuery({
    userId,
  });

  return (
    <div className="flex flex-col gap-2 sm:gap-5">
      {isLoading ? (
        <div className="flex flex-col items-center">
          <LoadingIndicator label="Fetching categories" />
        </div>
      ) : null}
      {isError ? <ErrorLoadingCategories onLoadCategoriesClick={() => !isRefetching && refetch()} /> : null}
      {isSuccess ? (
        <>
          <aside className="rounded-md bg-slate-100 p-4">
            <AddUrl categories={categories} onCategoryAdd={() => refetch()} />
          </aside>
          <FeedListFilters categories={categories} username="Me" />
        </>
      ) : null}
      <InfiniteUserFeed userId={userId} />
    </div>
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
