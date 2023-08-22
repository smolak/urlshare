import { prisma } from "@urlshare/db/prisma/client";
import { Button } from "@urlshare/ui/design-system/ui/button";

export default function Page(props: any) {
  console.log(props);

  return (
    <section className="flex w-40 flex-col gap-1">
      <h1>Web</h1>
      {/*<p>URLs count: ${urlsCount}</p>*/}
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </section>
  );
}

export const getServerSideProps = async () => {
  const urlCount = await prisma.url.count();

  return {
    props: {
      urlCount,
    },
  };
};
