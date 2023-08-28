import { SettingsLayout } from "@urlshare/web-app/settings/ui/settings.layout";
import { useSession } from "next-auth/react";

const SettingsProfile = () => {
  const { data: session, status } = useSession();

  return (
    status === "authenticated" && (
      <SettingsLayout title="Settings" user={session.user}>
        To be added...
      </SettingsLayout>
    )
  );
};

export default SettingsProfile;
