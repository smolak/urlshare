import { buttonVariants } from "@urlshare/ui/design-system/ui/button";
import { cn } from "@urlshare/ui/utils";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import Head from "next/head";
import Link from "next/link";

const AboutContent = () => {
  return (
    <section>
      <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl">
        Welcome to Urlshare
      </h2>
      <div className="flex flex-col gap-6">
        <p>
          Discover a place where sharing links is as easy as using Twitter. Imagine a space where you can follow and be
          followed, just like on social media. You can share cool links you find and discover ones that others think are
          interesting too.
        </p>
        <p>
          Connect with people who have similar interests and build your own collection of favorite links. It's like
          creating your own digital scrapbook. By adding links you like, you're showing others what you're into. So, why
          wait? Start sharing and discovering awesome stuff on our platform today!
        </p>
        <p>
          <Link className={cn(buttonVariants({ variant: "default" }), "text-lg")} href="/auth/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

const AboutPage = () => {
  return (
    <>
      <Head>
        <title>About</title>
        <meta
          name="description"
          content="Share URLs. See what other recommend to know about. Create your feed of URLs you found interesting."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThreeColumnLayout mainContent={<AboutContent />} />
    </>
  );
};

export default AboutPage;
