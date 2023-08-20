import { Button } from "@urlshare/ui/components/ui/button";

export default function Page() {
  return (
    <section className="flex w-40 flex-col gap-1">
      <h1>Web</h1>
      <Button>Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </section>
  );
}
