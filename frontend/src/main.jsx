import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import AppRouter from "@/routes/AppRouter";
import { Toast } from "@/components/public";
import { queryClient } from "@/api/queryClient";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppRouter />
        <Toast />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
