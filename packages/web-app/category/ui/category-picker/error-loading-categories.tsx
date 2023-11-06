import { Button } from "@urlshare/ui/design-system/ui/button";
import { FC } from "react";

type ErrorLoadingCategoriesProps = {
  onLoadCategoriesClick: () => void;
};

export const ErrorLoadingCategories: FC<ErrorLoadingCategoriesProps> = ({ onLoadCategoriesClick }) => {
  return (
    <section className="flex flex-col gap-3">
      <h1 className="font-bold tracking-tight text-gray-900">
        <span className="inline">We couldn&apos;t load your categories, sorry 😞</span>
      </h1>
      <p>
        We log those things and are aware of the problem.
        <br />
        In the meantime, try loading the categories again:
      </p>
      <p>
        <Button onClick={onLoadCategoriesClick}>Load categories</Button>
      </p>
    </section>
  );
};
