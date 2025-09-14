import { Button } from "@/components/button/Button";
import { Toggle } from "@/components/toggle/Toggle";
import { DropdownMenu } from "@/components/dropdown/DropdownMenu";
import { GmailIcon } from "@/components/GmailIcon";
import type { GmailConnectionStatus, Theme } from "@/types";

// Icon imports
import {
  BugIcon,
  MoonIcon,
  SunIcon,
  TrashIcon,
  EnvelopeIcon,
  SignOutIcon,
  CaretDownIcon
} from "@phosphor-icons/react";

interface ChatHeaderProps {
  gmailStatus: GmailConnectionStatus;
  connectGmail: () => void;
  disconnectGmail: () => void;
  theme: Theme;
  toggleTheme: () => void;
  showDebug: boolean;
  setShowDebug: (show: boolean) => void;
  clearHistory: () => void;
}

export function ChatHeader({
  gmailStatus,
  connectGmail,
  disconnectGmail,
  theme,
  toggleTheme,
  showDebug,
  setShowDebug,
  clearHistory
}: ChatHeaderProps) {
  return (
    <div className="px-4 py-3 border-b border-neutral-300 dark:border-neutral-800 flex items-center gap-3 sticky top-0 z-10">
      <div className="flex items-center justify-center h-8 w-8">
        <EnvelopeIcon className="text-[#F48120]" size={28} weight="duotone" />
      </div>

      <div className="flex-1">
        <h2 className="font-semibold text-base">Talk to Gmail</h2>
      </div>

      {gmailStatus.loading ? (
        <Button variant="secondary" disabled>
          <GmailIcon />
          Checking...
        </Button>
      ) : gmailStatus.connected ? (
        <DropdownMenu
          align="end"
          side="bottom"
          sideOffset={8}
          MenuItems={[
            {
              type: "button",
              label: "Disconnect",
              icon: <SignOutIcon weight="duotone" />,
              destructiveAction: true,
              onClick: disconnectGmail
            }
          ]}
        >
          <Button
            variant="secondary"
            className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
          >
            <GmailIcon />
            {gmailStatus.email} 
            <CaretDownIcon weight="duotone" size={16} className="ml-1" />
          </Button>
        </DropdownMenu>
      ) : (
        <Button variant="secondary" onClick={connectGmail}>
          <GmailIcon />
          Connect Gmail
        </Button>
      )}

      <div className="flex items-center gap-2 mr-2">
        <BugIcon weight="duotone" size={16} />
        <Toggle
          toggled={showDebug}
          aria-label="Toggle debug mode"
          onClick={() => setShowDebug(!showDebug)}
        />
      </div>

      <Button
        variant="ghost"
        size="md"
        shape="square"
        className="rounded-full h-9 w-9"
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <SunIcon weight="duotone" size={20} />
        ) : (
          <MoonIcon weight="duotone" size={20} />
        )}
      </Button>

      <Button
        variant="ghost"
        size="md"
        shape="square"
        className="rounded-full h-9 w-9"
        onClick={clearHistory}
      >
        <TrashIcon weight="duotone" size={20} />
      </Button>
    </div>
  );
}
