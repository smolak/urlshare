import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@urlshare/ui/design-system/ui/form";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { Separator } from "@urlshare/ui/design-system/ui/separator";
import { cn } from "@urlshare/ui/utils";
import copyToClipboard from "copy-to-clipboard";
import debounce from "debounce";
import { AtSign, Copy, KeyRound, RefreshCcw, UserCheck2, UserX2 } from "lucide-react";
import { useRouter } from "next/router";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { WEB_APP_DOMAIN } from "../../../../constants";
import { api } from "../../../../trpc/client";
import { A } from "../../../../ui/a";
import { LoadingIndicator } from "../../../../ui/loading-indicator";
import { generateApiKey } from "../../../../user/utils/generate-api-key";
import { useCheckIfUserProfileDataExists } from "../../../../user-profile-data/hooks/use-check-if-user-profile-data-exists";
import {
  CreateUserProfileDataSchema,
  createUserProfileDataSchema,
} from "../../../../user-profile-data/router/procedures/create-user-profile-data.schema";
import { usernameCheckSchema } from "../../../../user-profile-data/router/procedures/username-check.schema";

interface FormValues {
  username: string;
  apiKey: string;
}

const usernameExamples = ["ThomasAnderson", "__I_AM_ROBOT__", "JeanneDArc"];

export const NewUserProfileDataForm = () => {
  const { isChecking, exists } = useCheckIfUserProfileDataExists();
  const { route } = useRouter();

  /**
   * As a new user, one should not have user profile data yet.
   *
   * If one does, and is logged in as role === NEW_USER, then something is wrong.
   * Most likely the profile data was created when user was still logged in as NEW_USER,
   * and is trying to enter this page. The problem is that profile data form for new users
   * allows to set username. You can't do it when it's already set (user profile data exists).
   *
   * Only if user profile data does not exist, can such a user enter this form.
   *
   * There is also a case when system won't be able to verify if data exists or not,
   * hence the 'unknown' return value from the check. Reason is that different from 404 error
   * is being returned in the check.
   *
   * Normally that should not happen, because the role is checked.
   * This is just me being extra careful from the UX and data perspective.
   */

  return (
    <div className="container mx-auto my-5 max-w-2xl px-0 sm:px-4">
      {isChecking && (
        <div className="flex items-center justify-center">
          <p>Checking data...</p>
          <LoadingIndicator label="Loading user profile data..." />
        </div>
      )}
      {exists === "unknown" && (
        <div className="flex items-center justify-center p-10">
          <p>
            Couldn&apos;t check the data. <A href={route}>Try again</A>.
          </p>
        </div>
      )}
      {exists === true && (
        <div className="flex items-center justify-center p-10">
          <p>
            It looks like your user status doesn&apos;t allow you to manage your profile yet. Log out and login again,
            and you will be able to do so.
          </p>
        </div>
      )}
      {exists === false && <UserProfileDataForm />}
    </div>
  );
};

const UserProfileDataForm = () => {
  const { push } = useRouter();
  const {
    mutate: saveUserProfileData,
    isLoading,
    isSuccess,
    error,
  } = api.userProfileData.createUserProfileData.useMutation();

  // If the data is saved successfully, proceed to homepage
  if (isSuccess) {
    push("/");
  }

  const apiKey = generateApiKey();

  const form = useForm<CreateUserProfileDataSchema>({
    resolver: zodResolver(createUserProfileDataSchema),
    defaultValues: {
      username: "",
      apiKey,
    },
    criteriaMode: "all",
  });

  const [usernameIsValid, setUsernameIsValid] = useState<null | boolean>(null);
  const [usernamePlaceholder, setUsernamePlaceholder] = useState("");
  const [generatedApiKey, setGeneratedApiKey] = useState(apiKey);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<null | boolean>(null);

  const { mutate: usernameCheck } = api.userProfileData.usernameCheck.useMutation({
    onSuccess: (data) => {
      setIsUsernameAvailable(data.usernameAvailable);
    },
  });

  useEffect(() => {
    setUsernamePlaceholder(usernameExamples.sort(() => Math.random() - 0.5)[0]);
  }, []);

  const onSubmit = async (userProfileData: FormValues) => {
    saveUserProfileData(userProfileData);
  };

  const checkUsernameAvailability = async (username: string) => {
    const validationResult = usernameCheckSchema.safeParse({ username });

    if (validationResult.success) {
      form.clearErrors("username");
      setUsernameIsValid(true);

      usernameCheck({ username });
    } else {
      setUsernameIsValid(false);

      await form.trigger("username");
    }
  };

  const delayedCheckUsernameAvailability = debounce(async (e: ChangeEvent<HTMLInputElement>) => {
    await checkUsernameAvailability(e.target.value);
  }, 500);

  const usernameDescriptionClassNames = cn({
    "text-green-700": usernameIsValid === true,
    "text-red-600": usernameIsValid === false,
  });

  return (
    <section className="flex flex-col gap-4 sm:gap-10">
      <div>
        <h3 className="text-xl font-medium leading-6 text-gray-900">Welcome to ${WEB_APP_DOMAIN}</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">There are couple of things you need to do first.</p>
        <Separator className="mt-5" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-10">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <div className="relative mt-1 flex rounded-md shadow-sm">
                  <span className="absolute inline-flex h-full items-center rounded-l-md px-3 text-sm text-gray-500">
                    <AtSign size={14} />
                  </span>
                  <FormControl className="block w-full flex-1">
                    <Input
                      {...field}
                      placeholder={usernamePlaceholder}
                      className="pl-10"
                      onChange={async (e) => {
                        field.onChange(e);
                        await delayedCheckUsernameAvailability(e);
                      }}
                    />
                  </FormControl>
                  {isUsernameAvailable === false && (
                    <UserX2 size={18} className="absolute right-3.5 top-3 text-lg text-red-600" />
                  )}
                  {isUsernameAvailable && (
                    <UserCheck2 size={18} className="absolute right-3.5 top-3 text-lg text-green-700" />
                  )}
                </div>
                <FormDescription className={usernameDescriptionClassNames}>
                  Choose a username. 4 to 15 characters long, a-z, A-Z, 0-9 and _ only.
                </FormDescription>
                {isUsernameAvailable === false && (
                  <FormDescription className="text-red-600">Username taken, pick a different one.</FormDescription>
                )}
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API key</FormLabel>
                <div className="relative mt-1 flex rounded-md shadow-sm">
                  <span className="absolute inline-flex h-full items-center rounded-l-md px-3 text-sm text-gray-500">
                    <KeyRound size={14} />
                  </span>
                  <FormControl className="block w-full flex-1">
                    <Input {...field} value={generatedApiKey} disabled className="bg-gray-100 pl-10" />
                  </FormControl>
                  <RefreshCcw
                    size={14}
                    onClick={() => setGeneratedApiKey(generateApiKey())}
                    className="absolute right-10 top-3.5 cursor-copy text-lg text-gray-400 hover:text-gray-700"
                  />
                  <Copy
                    size={14}
                    onClick={() => copyToClipboard(generatedApiKey)}
                    className="absolute right-3.5 top-3.5 cursor-copy text-lg text-gray-400 hover:text-gray-700"
                  />
                </div>
                <FormDescription>Can only be generated.</FormDescription>
              </FormItem>
            )}
          />

          <div className="flex items-center gap-10">
            <Button type="submit" disabled={isUsernameAvailable === false || isSuccess}>
              Save and finish
            </Button>
            <div>
              {isLoading && <span className="mr-5 text-sm font-light text-gray-500">Saving...</span>}
              {isSuccess && <span className="mr-5 text-sm font-light text-green-700">Profile data saved</span>}
              {error?.message && <span className="mr-5 text-sm font-light text-red-600">{error.message}</span>}
            </div>
          </div>
        </form>
      </Form>
    </section>
  );
};
