import { Separator } from "@urlshare/ui/design-system/ui/separator";
import { UserProfileDataForm } from "@urlshare/web-app/settings/profile/ui/user-profile-data-form";
import { SidebarNavigation } from "@urlshare/web-app/ui/sidebar-navigation";
import { ThreeColumnLayout } from "@urlshare/web-app/ui/three-column.layout";
import { useSession } from "next-auth/react";

const SettingsProfile = () => {
  const { data, status } = useSession();

  return (
    status === "authenticated" && (
      <ThreeColumnLayout
        headerContent={
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            <h3 className="text-md font-light text-gray-500">Manage your profile settings and other preferences.</h3>
          </div>
        }
        leftColumnContent={<SidebarNavigation />}
        mainContent={
          <section className="space-y-6">
            <header className="space-y-1">
              <h3 className="text-xl font-medium tracking-tight">Profile settings</h3>
              <h4 className="text-sm font-light text-gray-500">Manage your profile settings here.</h4>
            </header>
            <Separator className="md:max-w-[450px]" />
            <UserProfileDataForm userRole={data.user.role} />
          </section>
        }
      ></ThreeColumnLayout>
    )
  );
};

export default SettingsProfile;
