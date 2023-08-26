import { User } from "@urlshare/db/prisma/client";
import { FC } from "react";

import { ExistingUserProfileDataForm } from "./existing-user-profile-data-form";
import { NewUserProfileDataForm } from "./new-user-profile-data-form";

interface UserProfileDataFormProps {
  userRole: User["role"];
}

export const UserProfileDataForm: FC<UserProfileDataFormProps> = ({ userRole }) => {
  const isNewUser = userRole === "NEW_USER";

  return (
    <>
      {isNewUser && <NewUserProfileDataForm />}
      {!isNewUser && <ExistingUserProfileDataForm />}
    </>
  );
};
