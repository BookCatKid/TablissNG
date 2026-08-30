import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  CRYPTO_ASSETS,
  getTargetAssets,
  METAL_ASSETS,
} from "../plugins/widgets/currencyRates/assets";
import { Icon, iconCatalog } from ".";

describe("icons", () => {
  it("renders a picker Feather icon entirely from embedded data", () => {
    expect(iconCatalog.feather).toContain("heart");
    expect(
      renderToStaticMarkup(
        createElement(Icon, { name: "feather:heart", "aria-label": "Heart" }),
      ),
    ).toContain("<svg");
  });

  it("embeds every non-Feather icon used by the app", () => {
    const assetIcons = [
      ...CRYPTO_ASSETS,
      ...METAL_ASSETS,
      ...getTargetAssets("fiat", "en"),
      ...getTargetAssets("crypto", "en"),
    ].map(({ icon }) => icon);

    for (const name of new Set(assetIcons)) {
      expect(
        renderToStaticMarkup(createElement(Icon, { name })),
        `${name} should be embedded`,
      ).toContain("<svg");
    }
  });
});
