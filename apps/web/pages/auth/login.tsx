import { Button } from "@urlshare/ui/design-system/ui/button";
import { LoginPageLayout } from "@urlshare/web-app/ui/login-page.layout";
import Head from "next/head";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { type IconType } from "react-icons";
import { RiGithubFill, RiGoogleFill } from "react-icons/ri";

type Provider = {
  name: string;
  displayName: string;
  Icon: IconType;
};

const providers: ReadonlyArray<Provider> = [
  {
    name: "github",
    displayName: "GitHub",
    Icon: RiGithubFill,
  },
  {
    name: "google",
    displayName: "Google",
    Icon: RiGoogleFill,
  },
];

const Login = () => {
  const { data: session } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (session) {
      const path = session.user.role === "NEW_USER" ? "/settings/profile" : "/";

      window.location.replace(path);
    }
  }, [session, push]);

  const handleOAuthSignIn = (providerName: Provider["name"]) => () => signIn(providerName);

  return (
    !session && (
      <LoginPageLayout>
        <Head>
          <title>Login</title>
        </Head>
        <div className="flex items-center justify-center">
          <div className="flex min-h-full max-w-md flex-col px-4 py-20 sm:px-6 lg:px-8">
            <div className="max-w-md space-y-8 text-center">
              <h2 className="text-3xl font-bold">Login to your account</h2>
            </div>
            <div className="mt-8 flex flex-col justify-center space-y-6">
              {providers.map(({ displayName, name, Icon }) => (
                <Button type="submit" className="gap-2" key={name} onClick={handleOAuthSignIn(name)}>
                  <Icon size={20} aria-hidden="true" />
                  Login with {displayName}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </LoginPageLayout>
    )
  );
};

export default Login;
