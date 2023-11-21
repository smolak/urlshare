import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@urlshare/ui/design-system/ui/dropdown-menu";
import { cn } from "@urlshare/ui/utils";
import { List, LogOut, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { FC } from "react";

import { UserImage } from "../user/ui/user-image";
import { LoadingIndicator } from "./loading-indicator";
import { Logo } from "./logo";

export const MainHeader: FC = () => {
  const { data: session, status } = useSession();
  const { pathname } = useRouter();

  return (
    <div className="supports-backdrop-blur:bg-background/60 bg-background/95 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="container flex h-14 items-center px-4 sm:h-16 sm:px-8">
        <div className="flex items-center space-x-4 sm:space-x-8">
          <Logo withName />
          <nav>
            <ol className="flex items-center space-x-4 text-sm font-medium sm:space-x-6">
              <li>
                <Link
                  href="/"
                  className={cn(
                    pathname === "/" ? "text-primary" : "text-secondary",
                    "transition-colors hover:text-slate-800"
                  )}
                >
                  Homepage
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className={cn(
                    pathname === "/about" ? "text-primary" : "text-secondary",
                    "transition-colors hover:text-slate-800"
                  )}
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className={cn(
                    pathname === "/privacy-policy" ? "text-primary" : "text-secondary",
                    "transition-colors hover:text-slate-800"
                  )}
                >
                  Privacy Policy
                </Link>
              </li>
            </ol>
          </nav>
        </div>

        <aside className="flex flex-1 items-center justify-end">
          {status === "loading" && <LoadingIndicator label="Checking session..." />}
          {status === "unauthenticated" && (
            <Link
              href="/auth/login"
              className={cn(
                pathname === "/" ? "text-primary" : "text-secondary",
                "text-sm transition-colors hover:text-slate-800"
              )}
            >
              Login
            </Link>
          )}
          {status === "authenticated" && (
            <DropdownMenu>
              <DropdownMenuTrigger>
                <UserImage username={session.user.name as string} image={session.user.image as string} size="small" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2">
                  <List size={12} />
                  <Link href="/settings/categories">Categories</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <User size={12} />
                  <Link href="/settings/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2">
                  <LogOut size={12} />
                  <a className="cursor-pointer" onClick={() => signOut()}>
                    Logout
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </aside>
      </div>
    </div>
  );
};
