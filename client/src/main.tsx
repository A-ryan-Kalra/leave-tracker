import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner";
import UserDataProviders from "./hooks/user-data.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ChatBot from "./components/chat-bot.tsx";
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        <UserDataProviders>
          <ChatBot />
          <App />
          <Toaster />
        </UserDataProviders>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
