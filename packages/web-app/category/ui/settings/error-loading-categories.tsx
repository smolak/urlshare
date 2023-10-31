export const ErrorLoadingCategories = () => {
  return (
    <section className="p-5 sm:px-0 sm:py-20">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl md:text-4xl">
        <span className="inline">We couldn&apos;t load your categories, sorry 😞</span>{" "}
      </h1>
      <div className="flex flex-col gap-3 p-4">
        <p className="flex gap-2">
          <span>✅</span> We log those things are aware of the problem.
        </p>
        <p className="flex gap-2">
          <span>💡</span> Try refreshing the page. If that won&apos;t work, be patient, we&apos;re most likely working
          on that already.
        </p>
      </div>
    </section>
  );
};
