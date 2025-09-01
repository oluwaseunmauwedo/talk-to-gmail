import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

const ThemeSelector = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="flex size-8 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-900"
      onClick={() => toggleTheme()}
    >
      <MoonIcon
        weight="duotone"
        className={cn("hidden", {
          "animate-fade block": theme === "dark"
        })}
      />
      <SunIcon
        weight="duotone"
        className={cn("animate-fade block", {
          hidden: theme === "dark"
        })}
      />
    </button>
  );
};

export default ThemeSelector;
