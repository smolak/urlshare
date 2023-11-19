import "../styles/globals.css";

import { Storage } from "@plasmohq/storage";
import React, { useEffect, useState } from "react";

import { AddUrl } from "./add-url";
import { Settings } from "./settings";
import { SettingsButton } from "./settings/settings-button";

const API_KEY_STORAGE_KEY = "API_KEY";

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
      if (typeof maybeApiKey === "string") {
        const apiKey = maybeApiKey.trim();

        if (apiKey) {
          const canAddUrls = apiKey !== "";

          setCanAddUrls(canAddUrls);
          setShowSettings(!canAddUrls);
          setApiKey(apiKey);
        }
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
          <AddUrl apiKey={apiKey} url={currentUrl} />
        </>
      )}
    </div>
  );
};
