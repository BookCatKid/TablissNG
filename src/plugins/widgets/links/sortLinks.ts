import { Link } from "./types";
import { Data } from "./types";

export function sortLinks(links: Link[], sortBy: Data["sortBy"]): Link[] {
  if (sortBy === "none") return links;

  return [...links].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return (a.name || "").localeCompare(b.name || "");
      case "icon":
        return (a.iconConfig?.type || "").localeCompare(
          b.iconConfig?.type || "",
        );
      case "lastUsed": {
        const bTime = b.lastUsed || 0;
        const aTime = a.lastUsed || 0;
        return bTime - aTime;
      }
      default:
        return 0;
    }
  });
}
