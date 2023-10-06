import "../styles/globals.css";

import { Storage } from "@plasmohq/storage";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@urlshare/ui/design-system/ui/button";
import { LoadingIndicator } from "@urlshare/ui/design-system/ui/loading-indicator";
import { WEB_APP_API_BASE_URL } from "@urlshare/web-app/constants";
import { Check } from "lucide-react";
import React, { useEffect, useState } from "react";

import { Settings } from "./settings";
import { SettingsButton } from "./settings/settings-button";

const API_KEY_STORAGE_KEY = "API_KEY";
const createApiUrl = (apiKey: string) => `${WEB_APP_API_BASE_URL}/${apiKey}/url`;

const storage = new Storage({
  area: "sync",
});

export const PopupComponent = () => {
  const [canAddUrls, setCanAddUrls] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [currentUrl, setCurrentUrl] = useState("");
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    storage.get(API_KEY_STORAGE_KEY).then((maybeApiKey) => {
      const apiKey = maybeApiKey.trim();

      if (apiKey) {
        const canAddUrls = apiKey !== "";

        setCanAddUrls(canAddUrls);
        setShowSettings(!canAddUrls);
        setApiKey(apiKey);
      }
    });
  }, []);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const currentUrl = tabs[0].url || "";

      if (currentUrl) {
        setCurrentUrl(currentUrl);
      }
    });
  }, []);

  const saveApiKey = (apiKey: string) => {
    storage.set(API_KEY_STORAGE_KEY, apiKey).then(() => {
      setCanAddUrls(apiKey !== "");
      setApiKey(apiKey);
    });
  };

  const {
    mutate: addUrl,
    isLoading,
    isSuccess,
    isError,
    data,
  } = useMutation((url: string) =>
    fetch(createApiUrl(apiKey), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })
  );

  return (
    <div className="w-64 p-2">
      {showSettings && (
        <Settings
          values={{ apiKey }}
          onClose={() => setShowSettings(false)}
          onSubmit={(formData) => {
            saveApiKey(formData.apiKey);
            setShowSettings(false);
          }}
        />
      )}
      {!showSettings && canAddUrls && currentUrl && (
        <>
          <SettingsButton className="absolute right-2" onClick={() => setShowSettings(true)} />
          <div className="flex flex-col gap-2 p-2">
            <div className="flex items-center gap-2">
              <Button onClick={() => addUrl(currentUrl)} disabled={isLoading}>
                Add URL
              </Button>
              {isLoading ? <LoadingIndicator label="Adding the URL" className="text-gray-500" size={18} /> : null}
              {isSuccess && data?.ok === true ? <Check className="text-green-700" /> : null}
            </div>

            {isError || (data?.ok === false && <div>Could not add, try again.</div>)}

            <p className="overflow-hidden text-ellipsis text-xs font-extralight">{currentUrl}</p>
          </div>
        </>
      )}
    </div>
  );
};
