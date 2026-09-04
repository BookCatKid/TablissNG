---
title: JSON API Backgrounds
sidebar_position: 5
---

# JSON API Backgrounds

The **Online** background can use either a direct image URL or an API that returns an image URL inside JSON.

## Configure a JSON API background

1. Open **Settings → Backgrounds → Online**.
2. Enter the API endpoint in **Image URL**.
3. Enable **Parse JSON Response**.
4. Enter the image URL's dot-separated path in **JSON Path**. Array indexes are supported.

For example, this response:

```json
{
  "data": [
    {
      "path": "https://images.example.com/background.jpg"
    }
  ]
}
```

uses this JSON path:

```text
data.0.path
```

The value at that path must be a complete image URL.

## Why a CORS permission may be required

Browsers normally prevent one site or extension from reading responses from another site unless the server opts into [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS).

TablissNG first tries the API without requesting additional access. If the request works, no permission is needed. If the request fails and the extension does not already have access to that API's origin, the **Allow cross-origin access** button appears. CORS is a common cause, but TablissNG cannot distinguish it from every network, TLS, DNS, or API availability failure.

Selecting the button asks the browser to grant TablissNG access to the configured API origin. The permission applies to that origin only, not every website. If you decline, the permission is not granted and you can continue using other backgrounds normally.

The web version of TablissNG cannot request extension host permissions. The API must allow CORS when using the web version.

## Troubleshooting

- Confirm that opening the API URL returns JSON rather than an HTML error page.
- Confirm that the JSON path points to a string containing a complete `http://` or `https://` image URL.
- If the permission button appears, grant access and retry the background.
- A permission cannot fix an unavailable API, an invalid response, rate limiting, or authentication requirements.
- Treat private API URLs carefully. URLs containing tokens or keys are stored as part of your synced TablissNG settings.
