import NextAuth from "next-auth";

import { nextAuthOptions } from "../../../server/auth";

export default NextAuth(nextAuthOptions);
