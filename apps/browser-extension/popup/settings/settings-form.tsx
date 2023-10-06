import { Button } from "@urlshare/ui/design-system/ui/button";
import { Input } from "@urlshare/ui/design-system/ui/input";
import { WEB_APP_BASE_URL } from "@urlshare/web-app/constants";
import { KeyRound } from "lucide-react";
import React, { type FC, useState } from "react";

export type SettingsFormValues = {
  apiKey: string;
};

export type OnFormSubmit = (formData: SettingsFormValues) => void;

type SettingsFormProps = {
  values: SettingsFormValues;
  onSubmit: OnFormSubmit;
};

export const SettingsForm: FC<SettingsFormProps> = ({ onSubmit, values }) => {
  const [apiKey, setApiKey] = useState(values.apiKey);

  return (
    <form
      className="flex flex-col gap-3 p-2"
      id="settings"
      onSubmit={(e) => {
        e.preventDefault();

        const target = e.target as typeof e.target & {
          apiKey: { value: string };
        };
        const formValues: SettingsFormValues = {
          apiKey: target.apiKey.value,
        };

        onSubmit(formValues);
      }}
    >
      <div>
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          API key
        </label>
        <div className="relative mt-1 flex rounded-md shadow-sm">
          <span className="absolute inline-flex h-full items-center rounded-l-md px-3 text-sm text-gray-500">
            <KeyRound size={14} />
          </span>
          <Input
            className="bg-gray-100 pl-10"
            name="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>
      </div>

      <aside className="rounded bg-sky-400/10 px-3 py-1 text-sky-600">
        API key is used to add URLs through this plugin.
        <br /> You can find it in your{" "}
        <a className="underline" href={`${WEB_APP_BASE_URL}/settings/profile`} target="_blank">
          profile settings
        </a>
        .
      </aside>

      <div>
        <Button type="submit">Save key</Button>
      </div>
    </form>
  );
};
