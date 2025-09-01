import { useState, useCallback, useEffect } from "react";
import type { GmailConnectionStatus } from "@/types";
import { ROUTES, DEFAULTS } from "@/constants";

export function useGmailConnection() {
  const [gmailStatus, setGmailStatus] = useState<GmailConnectionStatus>({
    connected: false,
    loading: true
  });

  const checkGmailStatus = useCallback(async () => {
    try {
      const response = await fetch(ROUTES.OAUTH_STATUS);
      const status = (await response.json()) as {
        connected: boolean;
        email?: string;
        name?: string;
      };
      setGmailStatus({
        connected: status.connected,
        email: status.email,
        name: status.name,
        loading: false
      });
    } catch (error) {
      console.error("Error checking Gmail status:", error);
      setGmailStatus((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  const connectGmail = useCallback(() => {
    const popup = window.open(
      ROUTES.OAUTH_CONNECT,
      "gmail-oauth",
      DEFAULTS.POPUP_WINDOW_CONFIG
    );

    const checkClosed = setInterval(() => {
      if (popup?.closed) {
        clearInterval(checkClosed);
        setTimeout(() => checkGmailStatus(), 1000);
      }
    }, 1000);
  }, [checkGmailStatus]);

  const disconnectGmail = useCallback(async () => {
    try {
      await fetch(ROUTES.OAUTH_DISCONNECT, { method: "POST" });
      setGmailStatus({ connected: false, loading: false });
    } catch (error) {
      console.error("Error disconnecting Gmail:", error);
    }
  }, []);

  useEffect(() => {
    checkGmailStatus();
  }, [checkGmailStatus]);

  return {
    gmailStatus,
    connectGmail,
    disconnectGmail,
    checkGmailStatus
  };
}
