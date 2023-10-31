import { CategoriesSettings } from "@urlshare/web-app/category/ui/settings";
import { SettingsLayout } from "@urlshare/web-app/settings/ui/settings.layout";
import { useSession } from "next-auth/react";

const SettingsProfile = () => {
  const { data: session, status } = useSession();

  return (
    status === "authenticated" && (
      <SettingsLayout title="Categories" user={session.user}>
        <CategoriesSettings />
      </SettingsLayout>
    )
  );
};

export default SettingsProfile;
