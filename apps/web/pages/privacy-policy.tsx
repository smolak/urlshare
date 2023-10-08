import { A } from "@urlshare/web-app/ui/a";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import Head from "next/head";

const PrivacyPolicyContent = () => {
  return (
    <article>
      <header>
        <h2 className="mb-4 text-3xl font-extrabold leading-tight text-gray-900 lg:mb-6 lg:text-4xl">Privacy Policy</h2>
      </header>
      <div className="flex flex-col gap-6">
        <article>
          <h3 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900 lg:mb-5 lg:text-3xl">
            Privacy Policy for urlshare.app
          </h3>
          <div className="flex flex-col gap-6">
            <p>
              Right now there is no formal privacy policy. This is a hobby project, that, once matures, will get more
              stricter rules here.
            </p>
            <p>
              Feel free to register and share URLs. But don&apos;t go crazy with what you share. Until the rules are
              formalized things I do here will be decided on as you go. For instance, if you will register as Elon Musk,
              but you are not him, I will kindly ask you to change your name if it comes to that and do it for you if
              you wont (or even block or delete your account).
            </p>
          </div>
        </article>

        <article>
          <h3 className="mb-3 text-2xl font-extrabold leading-tight text-gray-900 lg:mb-5 lg:text-3xl">
            Data Privacy Policy for Browser Extension
          </h3>
          <div className="flex flex-col gap-6">
            <ul className="list-inside list-disc">
              <li>No data is tracked.</li>
              <li>Extension usage is not tracked as well.</li>
              <li>Websites you visit are not tracked.</li>
              <li>No data is transferred to any 3rd parties.</li>
              <li>
                The only data that is stored is your storage data. You save this data to your local browser storage.
              </li>
            </ul>
            <p>
              If you&apos;re curious what lies under the hood, see for yourself. The{" "}
              <A href="https://github.com/smolak/urlshare" target="_blank">
                source-code
              </A>{" "}
              for the browser extension is open.
            </p>
          </div>
        </article>
      </div>
    </article>
  );
};

const PrivacyPolicyPage = () => {
  return (
    <>
      <Head>
        <title>Privacy Policy</title>
        <meta name="description" content="Privacy Policy" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ThreeColumnLayout mainContent={<PrivacyPolicyContent />} />
    </>
  );
};

export default PrivacyPolicyPage;
