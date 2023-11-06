import { UserProfileDataForm } from "@urlshare/web-app/settings/profile/ui/user-profile-data-form";
import { SettingsLayout } from "@urlshare/web-app/settings/ui/settings.layout";
import { useSession } from "next-auth/react";

const SettingsProfile = () => {
  const { data: session, status } = useSession();

  return (
    status === "authenticated" && (
      <SettingsLayout title="Profile">
        <UserProfileDataForm userRole={session.user.role} />
      </SettingsLayout>
    )
  );
};

export default SettingsProfile;
