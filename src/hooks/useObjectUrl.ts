import { useEffect, useMemo, useState } from "react";

export function useObjectUrl(data?: Blob) {
  // Separating these allows clean up + eagerly calculating the first one
  const url = useMemo(() => (data ? URL.createObjectURL(data) : null), [data]);

  useEffect(() => {
    const prev = url;
    return () => {
      if (prev) URL.revokeObjectURL(prev);
    };
  }, [url]);

  return url;
}

export function useObjectUrls(data: Blob[]) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    const newUrls = data.map(URL.createObjectURL);
    setUrls(newUrls);

    return () => {
      newUrls.forEach(URL.revokeObjectURL);
      setUrls([]);
    };
  }, [data]);

  return urls;
}
