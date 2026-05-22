import { useEffect, useState } from "react";

/**
 * useObjectUrl
 * Creates a temporary URL for a single Blob/File.
 * Automatically cleans up when the Blob changes or component unmounts.
 */
export function useObjectUrl(data?: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!data) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(data);
    setUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [data]);

  return url;
}

/**
 * useObjectUrls
 * Creates temporary URLs for an array of Blobs/Files.
 * Cleans up all URLs automatically when the array changes or component unmounts.
 */
export function useObjectUrls(data: Blob[] = []) {
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!data.length) {
      setUrls([]);
      return;
    }

    const objectUrls = data.map(URL.createObjectURL);
    setUrls(objectUrls);

    return () => {
      objectUrls.forEach(URL.revokeObjectURL);
    };
  }, [data]);

  return urls;
}
