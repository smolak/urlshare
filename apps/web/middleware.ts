export { default } from "next-auth/middleware";

// Pages that will require being logged in and redirect to login page if not logged in.
// That does not include pages that might require being logged in, but you don't
// want to be redirected, to indicate that such a page exists.
export const config = { matcher: ["/settings/profile", "/url/add"] };
