import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getSettings, saveSettings } from "@/db/repository";
import {
  fetchUpdateAvailability,
  type UpdateCheckResult,
} from "@/lib/update-check";

type CachedResult = {
  checkedOn: string;
  result: UpdateCheckResult | null;
};

type UpdateCheckContextValue = {
  updateAvailable: boolean;
  checkNow: () => Promise<UpdateCheckResult>;
};

const UpdateCheckContext = createContext<UpdateCheckContextValue | null>(null);

function getToday() {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function UpdateCheckProvider({ children }: PropsWithChildren) {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });

  useEffect(() => {
    if (!settings) return;

    let active = true;

    async function checkOncePerDay() {
      const today = getToday();

      try {
        const cachedValue = settings?.appUpdateCheckResult;
        if (cachedValue) {
          const cached = JSON.parse(cachedValue) as CachedResult;
          if (cached.checkedOn === today) {
            if (active && cached.result) {
              setUpdateAvailable(cached.result.available);
            }
            return;
          }
        }

        await saveSettings({
          ...settings!,
          appUpdateCheckResult: JSON.stringify({
            checkedOn: today,
            result: null,
          } satisfies CachedResult),
        });

        const result = await fetchUpdateAvailability();
        await saveSettings({
          ...settings!,
          appUpdateCheckResult: JSON.stringify({
            checkedOn: today,
            result,
          } satisfies CachedResult),
        });

        if (active) {
          setUpdateAvailable(result.available);
        }
      } catch (error) {
        console.error("Daily update check failed:", error);
      }
    }

    void checkOncePerDay();

    return () => {
      active = false;
    };
  }, [settings]);

  const checkNow = useCallback(async () => {
    const result = await fetchUpdateAvailability();
    setUpdateAvailable(result.available);
    await saveSettings({
      ...settings!,
      appUpdateCheckResult: JSON.stringify({
        checkedOn: getToday(),
        result,
      } satisfies CachedResult),
    });

    return result;
  }, [settings]);

  const value = useMemo(
    () => ({ updateAvailable, checkNow }),
    [updateAvailable, checkNow],
  );

  return (
    <UpdateCheckContext.Provider value={value}>
      {children}
    </UpdateCheckContext.Provider>
  );
}

export function useUpdateCheck() {
  const context = useContext(UpdateCheckContext);
  if (!context) {
    throw new Error(
      "useUpdateCheck must be used within an UpdateCheckProvider",
    );
  }
  return context;
}
