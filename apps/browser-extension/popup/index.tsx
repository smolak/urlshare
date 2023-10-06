import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { StrictMode } from "react";

import { PopupComponent } from "./component";

const queryClient = new QueryClient();

const Popup = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <PopupComponent />
      </QueryClientProvider>
    </StrictMode>
  );
};

export default Popup;
