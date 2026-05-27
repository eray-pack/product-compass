export const CURRENT_VERSION = "1.0.0";

const SEEN_KEY = "_stopamine_changelog_seen";

export type ChangelogEntry = {
  version: string;
  title: string;
  items: string[];
};

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: "1.0.0",
    title: "Welcome to Stopamine.",
    items: [
      "Track any habit or addiction — your journey, your rules",
      "Your tree or wolf grows as you stay clean",
      "11 badges to unlock from Spark to Legend",
      "Tools built around real psychological techniques",
      "Daily check-ins that actually mean something",
    ],
  },
];

export function shouldShowChangelog(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SEEN_KEY) !== CURRENT_VERSION;
}

export function markChangelogSeen(): void {
  localStorage.setItem(SEEN_KEY, CURRENT_VERSION);
}
