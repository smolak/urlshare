import { SettingsLayout } from "@urlshare/web-app/settings/ui/settings.layout";
import { useSession } from "next-auth/react";

const SettingsProfile = () => {
  const { status } = useSession();

  return status === "authenticated" && <SettingsLayout title="Settings">To be added...</SettingsLayout>;
};

export default SettingsProfile;
