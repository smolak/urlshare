import { UserProfileData } from "@prisma/client";
import { User } from "lucide-react";
import { FC } from "react";

import { cn } from "../utils";

interface UserImageProps {
  username: UserProfileData["username"];
  image?: UserProfileData["image"];
  size?: "big" | "small";
  className?: string;
}

const imageClasses = new Map<UserImageProps["size"], string>();
imageClasses.set("big", "h-[70px] w-[70px]");
imageClasses.set("small", "h-11 w-11");

const placeholderClasses = new Map<UserImageProps["size"], string>();
placeholderClasses.set("big", "h-[60px] w-[60px]");
placeholderClasses.set("small", "h-10 w-10");

export const UserImage: FC<UserImageProps> = ({ username, image, size = "small", className }) => {
  return image ? (
    <img
      className={cn(imageClasses.get(size), "rounded-full p-0.5 ring-slate-400 hover:ring-1", className)}
      src={image}
      alt={username || ""}
    />
  ) : (
    <span className={placeholderClasses.get(size)}>
      <User
        className={cn(
          placeholderClasses.get(size),
          "rounded-full p-1 text-gray-400 ring-slate-400 hover:ring-1",
          className
        )}
      />
    </span>
  );
};
