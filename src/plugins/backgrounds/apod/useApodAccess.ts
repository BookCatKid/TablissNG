import { useEffect, useRef, useState } from "react";

import { usePushError } from "../../../api";

const permission = { origins: ["https://science.nasa.gov/*"] };

export function useApodAccess() {
  const [hasAccess, setHasAccess] = useState(BUILD_TARGET === "web");
  const pushError = usePushError();
  const checkStateRef = useRef({ version: 0 });

  useEffect(() => {
    if (BUILD_TARGET === "web") return;
    const checkState = checkStateRef.current;
    let active = true;
    const checkAccess = () => {
      const version = ++checkState.version;
      void browser.permissions
        .contains(permission)
        .then((allowed) => {
          if (active && version === checkState.version) setHasAccess(allowed);
        })
        .catch(pushError);
    };
    checkAccess();
    browser.permissions.onAdded.addListener(checkAccess);
    browser.permissions.onRemoved.addListener(checkAccess);
    return () => {
      active = false;
      checkState.version++;
      browser.permissions.onAdded.removeListener(checkAccess);
      browser.permissions.onRemoved.removeListener(checkAccess);
    };
  }, [pushError]);

  const requestAccess = async () => {
    const checkState = checkStateRef.current;
    const version = ++checkState.version;
    try {
      const allowed = await browser.permissions.request(permission);
      if (version === checkState.version) setHasAccess(allowed);
    } catch (error) {
      pushError(error as Error);
    }
  };

  return { hasAccess, requestAccess };
}
