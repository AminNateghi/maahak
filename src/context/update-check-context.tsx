import SQLiteKVStore from "expo-sqlite/kv-store";
import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  fetchUpdateAvailability,
  type UpdateCheckResult,
} from "@/lib/update-check";

const STORAGE_KEY = "update-check-result";

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

  useEffect(() => {
    let active = true;

    async function checkOncePerDay() {
      const today = getToday();

      try {
        const cachedValue = await SQLiteKVStore.getItem(STORAGE_KEY);
        if (cachedValue) {
          const cached = JSON.parse(cachedValue) as CachedResult;
          if (cached.checkedOn === today) {
            if (active && cached.result) {
              setUpdateAvailable(cached.result.available);
            }
            return;
          }
        }

        await SQLiteKVStore.setItem(
          STORAGE_KEY,
          JSON.stringify({
            checkedOn: today,
            result: null,
          } satisfies CachedResult),
        );

        const result = await fetchUpdateAvailability();
        await SQLiteKVStore.setItem(
          STORAGE_KEY,
          JSON.stringify({ checkedOn: today, result } satisfies CachedResult),
        );

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
  }, []);

  const checkNow = useCallback(async () => {
    const result = await fetchUpdateAvailability();
    setUpdateAvailable(result.available);
    await SQLiteKVStore.setItem(
      STORAGE_KEY,
      JSON.stringify({
        checkedOn: getToday(),
        result,
      } satisfies CachedResult),
    );
    return result;
  }, []);

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
