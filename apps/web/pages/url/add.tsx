import { LoggedInUserLayout } from "@urlshare/web-app/ui/logged-in-user-layout";
import { AddUrl } from "@urlshare/web-app/url/ui/add-url";
import Head from "next/head";
import { SessionProvider } from "next-auth/react";
import { ReactElement } from "react";

import { NextPageWithLayout } from "../_app";

const UrlAdd: NextPageWithLayout = () => {
  return (
    <div>
      <Head>
        <title>Add new URL</title>
        <meta name="description" content="Add new URL" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <h1>Add new URL</h1>
      <AddUrl />
    </div>
  );
};

UrlAdd.getLayout = function getLayout(page: ReactElement) {
  return (
    <SessionProvider>
      <LoggedInUserLayout>{page}</LoggedInUserLayout>
    </SessionProvider>
  );
};

export default UrlAdd;
