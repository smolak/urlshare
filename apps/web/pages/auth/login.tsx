import { Button } from "@urlshare/ui/design-system/ui/button";
import { LoginPageLayout } from "@urlshare/web-app/ui/login-page.layout";
import Head from "next/head";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { useEffect } from "react";
import { RiGithubFill } from "react-icons/ri";

const providers = [
  {
    name: "github",
    displayName: "GitHub",
    Icon: RiGithubFill,
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

  const handleOAuthSignIn = (provider: string) => () => signIn(provider);

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
            <div className="mt-8 flex justify-center space-y-6">
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
