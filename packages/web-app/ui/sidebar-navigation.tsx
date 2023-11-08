import { buttonVariants } from "@urlshare/ui/design-system/ui/button";
import { cn } from "@urlshare/ui/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FC } from "react";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
  },
  {
    title: "Categories",
    href: "/settings/categories",
  },
];

type SidebarNavigationProps = {
  className?: string;
};

export const SidebarNavigation: FC<SidebarNavigationProps> = ({ className }) => {
  const pathname = usePathname();

  return (
    <nav className={cn("flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1", className)}>
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: "ghost" }),
            pathname === item.href ? "bg-gray-50 hover:bg-gray-100" : "hover:bg-transparent hover:underline",
            "justify-start"
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  );
};
