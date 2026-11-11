import Constants from "expo-constants";

export type UpdateCheckResult =
  | { available: false }
  | { available: true; downloadUrl: string };

export async function fetchUpdateAvailability(): Promise<UpdateCheckResult> {
  const response = await fetch(
    "https://api.github.com/repos/AminNateghi/maahak/releases/latest",
    {
      headers: {
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!response.ok) {
    console.log(`GitHub release request failed with status ${response.status}`);
  }

  const release = await response.json();

  if (release?.draft || release?.prerelease) {
    return { available: false };
  }

  const latestVersion = release?.tag_name?.replace(/^v/, "");
  const currentVersion = Constants.expoConfig?.version ?? "0.0.0";
  const apk = release.assets.find((asset: { name: string }) =>
    asset.name.toLowerCase().endsWith(".apk"),
  );

  if (!apk?.browser_download_url) {
    throw new Error("Latest GitHub release does not include an APK download");
  }

  if (compareVersions(latestVersion, currentVersion) <= 0) {
    return { available: false };
  }

  return { available: true, downloadUrl: apk.browser_download_url };
}

function compareVersions(a: string, b: string) {
  const va = a.split(".").map(Number);
  const vb = b.split(".").map(Number);

  for (let i = 0; i < Math.max(va.length, vb.length); i++) {
    const difference = (va[i] ?? 0) - (vb[i] ?? 0);

    if (difference !== 0) {
      return difference > 0 ? 1 : -1;
    }
  }

  return 0;
}
