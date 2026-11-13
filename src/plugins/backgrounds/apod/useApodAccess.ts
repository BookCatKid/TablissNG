import { useEffect, useState } from "react";

import { usePushError } from "../../../api";

const permission = { origins: ["https://science.nasa.gov/*"] };

export function useApodAccess() {
  const [hasAccess, setHasAccess] = useState(BUILD_TARGET === "web");
  const pushError = usePushError();

  useEffect(() => {
    if (BUILD_TARGET === "web") return;
    let active = true;
    const checkAccess = () => {
      void browser.permissions
        .contains(permission)
        .then((allowed) => {
          if (active) setHasAccess(allowed);
        })
        .catch(pushError);
    };
    checkAccess();
    browser.permissions.onAdded.addListener(checkAccess);
    browser.permissions.onRemoved.addListener(checkAccess);
    return () => {
      active = false;
      browser.permissions.onAdded.removeListener(checkAccess);
      browser.permissions.onRemoved.removeListener(checkAccess);
    };
  }, [pushError]);

  const requestAccess = async () => {
    try {
      setHasAccess(await browser.permissions.request(permission));
    } catch (error) {
      pushError(error as Error);
    }
  };

  return { hasAccess, requestAccess };
}
