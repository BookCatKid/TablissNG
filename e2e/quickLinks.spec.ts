import { expect, test } from "@playwright/test";

import {
  addWidget,
  closeSettings,
  expandWidgetSettings,
  openSettings,
  widgetSettingsFieldset,
} from "./helpers";

async function addQuickLinks(page: Parameters<typeof addWidget>[0]) {
  await addWidget(page, "widget/links");
  await expandWidgetSettings(page, "Quick Links");
  return widgetSettingsFieldset(page, "Quick Links");
}

function settingControl(
  settings: ReturnType<typeof widgetSettingsFieldset>,
  label: string,
) {
  return settings
    .locator("label", { hasText: label })
    .first()
    .locator("input, select");
}

test.describe("Quick Links widget", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("imports and migrates a real pre-overhaul TablissNG setup", async ({
    page,
  }) => {
    // Representative Quick Links data from this public v3 export:
    // https://github.com/chpaxson/chpaxson.github.io/blob/35e83295c7c4a9aa3a773c6325fba40b045b7a82/data/new-tab-icons/tablissng.json
    const legacyConfig = {
      background: {
        id: "legacy-background",
        key: "background/colour",
        display: { blur: 0, luminosity: -0.2 },
      },
      "data/legacy-background": { colour: "#15161e" },
      "data/legacy-links": {
        columns: 6,
        conserveAspectRatio: false,
        customHeight: 24,
        customWidth: 24,
        iconifyIdentifier: "feather:",
        linkOpenStyle: true,
        links: [
          {
            icon: "_favicon_favicone",
            iconSize: 128,
            id: "meuiki535j5j74417ts0",
            lastUsed: 1760166168858,
            name: "Personal",
            url: "https://mail.google.com/mail/u/0/#inbox",
          },
          {
            IconStringIco:
              "https://chpaxson.github.io/data/new-tab-icons/gmessages.svg",
            customWidth: 24,
            icon: "_custom_ico",
            iconCacheKey: "icon_1746214785515",
            iconSize: 32,
            id: "meuiki53a3nnk3h4w1n4",
            lastUsed: 1760145277520,
            name: "Messages",
            url: "https://messages.google.com/web",
          },
          {
            icon: "_favicon_google",
            iconSize: 64,
            id: "meuiki5334mww9btioh14",
            lastUsed: 1757117580517,
            name: "Music",
            url: "https://music.youtube.com/",
          },
        ],
        linksNumbered: false,
        visible: true,
      },
      focus: false,
      locale: "en",
      timeZone: null,
      "widget/legacy-links": {
        id: "legacy-links",
        key: "widget/links",
        order: 0,
        display: { position: "topCentre" },
      },
      version: 3,
    };

    await openSettings(page);
    const fileChooserPromise = page.waitForEvent("filechooser");
    await page.getByText("Import", { exact: true }).click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: "tablissng.json",
      mimeType: "application/json",
      buffer: Buffer.from(JSON.stringify(legacyConfig)),
    });

    const links = page.locator(".Links .Link");
    await expect(links).toHaveCount(3);

    const personalLink = links.filter({ hasText: "Personal" });
    const messagesLink = links.filter({ hasText: "Messages" });
    const musicLink = links.filter({ hasText: "Music" });

    await expect(personalLink).toHaveAttribute(
      "href",
      "https://mail.google.com/mail/u/0/#inbox",
    );
    await expect(messagesLink).toHaveAttribute(
      "href",
      "https://messages.google.com/web",
    );
    await expect(musicLink).toHaveAttribute(
      "href",
      "https://music.youtube.com/",
    );

    const personalIcon = personalLink.locator("img");
    await expect(personalIcon).toHaveCSS("width", "128px");
    await expect(personalIcon).toHaveCSS("height", "128px");
    await expect(personalIcon).toHaveAttribute("src", /\?s=128$/);

    const messagesIcon = messagesLink.locator("img");
    await expect(messagesIcon).toHaveCSS("width", "24px");
    await expect(messagesIcon).toHaveCSS("height", "24px");
    await expect(messagesIcon).toHaveAttribute(
      "src",
      "https://chpaxson.github.io/data/new-tab-icons/gmessages.svg",
    );

    const musicIcon = musicLink.locator("img");
    await expect(musicIcon).toHaveCSS("width", "64px");
    await expect(musicIcon).toHaveCSS("height", "64px");
    await expect(musicIcon).toHaveAttribute("src", /sz=64$/);

    await page.waitForTimeout(100);
    await page.reload();
    await expect(links).toHaveCount(3);
    await expect(personalLink).toHaveAttribute(
      "href",
      "https://mail.google.com/mail/u/0/#inbox",
    );
    await expect(messagesLink).toHaveAttribute(
      "href",
      "https://messages.google.com/web",
    );
    await expect(musicLink).toHaveAttribute(
      "href",
      "https://music.youtube.com/",
    );
    await expect(personalIcon).toHaveCSS("width", "128px");
  });

  test("adds, edits, normalizes, removes, and persists links", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const inputs = settings.locator(".LinkInput");

    await expect(inputs).toHaveCount(1);
    await settings.getByRole("button", { name: "Add link" }).click();
    await expect(inputs).toHaveCount(2);

    const addedLink = inputs.nth(1);
    const urlInput = addedLink.locator('input[type="url"]');
    await urlInput.fill("example.com/path");
    await urlInput.blur();
    await expect(urlInput).toHaveValue("https://example.com/path");
    await addedLink.locator('input[type="text"]').first().fill("Example site");

    await closeSettings(page);

    const renderedLink = page.locator(".Links .Link", {
      hasText: "Example site",
    });
    await expect(renderedLink).toBeVisible();
    await expect(renderedLink).toHaveAttribute(
      "href",
      "https://example.com/path",
    );

    await page.reload();
    await expect(renderedLink).toBeVisible();

    await openSettings(page);
    await expandWidgetSettings(page, "Quick Links");
    await widgetSettingsFieldset(page, "Quick Links")
      .locator(".LinkInput")
      .nth(1)
      .getByRole("button", { name: "Remove link" })
      .click();
    await closeSettings(page);
    await expect(renderedLink).toHaveCount(0);
  });

  test("applies layout, visibility, sorting, numbering, and manual order controls", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    await settings.getByRole("button", { name: "Add link" }).click();

    const inputs = settings.locator(".LinkInput");
    await inputs.nth(0).locator('input[type="text"]').first().fill("Zulu");
    await inputs.nth(1).locator('input[type="text"]').first().fill("Alpha");

    await settingControl(settings, "Number of columns").fill("3");
    await settingControl(settings, "Center links in columns").check();
    await settingControl(settings, "Links are numbered").check();

    const sortSelect = settingControl(settings, "Sort links by");
    await sortSelect.selectOption("name");
    await closeSettings(page);

    const links = page.locator(".Links .Link");
    await expect(links).toHaveCount(2);
    await expect(links.nth(0)).toContainText("Alpha");
    await expect(links.nth(1)).toContainText("Zulu");
    await expect(links.nth(0).locator(".LinkNumber")).toHaveText("1");
    await expect(page.locator(".Links")).toHaveClass(/center-links/);
    await expect(page.locator(".Links")).toHaveCSS(
      "grid-template-columns",
      /.+ .+ .+/,
    );

    await openSettings(page);
    await expandWidgetSettings(page, "Quick Links");
    const reopenedSettings = widgetSettingsFieldset(page, "Quick Links");
    await settingControl(reopenedSettings, "Sort links by").selectOption(
      "none",
    );

    const reorderedInputs = reopenedSettings.locator(".LinkInput");
    await reorderedInputs
      .nth(1)
      .getByRole("button", { name: "Move link up" })
      .click();
    await expect(
      reorderedInputs.nth(0).locator('input[type="text"]').first(),
    ).toHaveValue("Alpha");

    await settingControl(
      reopenedSettings,
      "Links are always visible",
    ).uncheck();
    await closeSettings(page);
    await expect(page.locator(".Links .Link")).toHaveCount(0);

    const reveal = page.locator('.Links a[title="Show quick links"]');
    await expect(reveal).toBeVisible();
    await reveal.click();
    await expect(page.locator(".Links .Link")).toHaveCount(2);
  });

  test("does not carry an unapplied SVG draft into a newly selected icon", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const iconSelect = linkInput.locator("select").first();

    await iconSelect.selectOption("custom_svg");
    const svgInput = linkInput.locator("textarea");
    await svgInput.fill(
      '<svg viewBox="0 0 10 10"><rect width="10" height="10" /></svg>',
    );
    await expect(
      linkInput.getByRole("button", { name: "Apply" }),
    ).toBeVisible();

    await iconSelect.selectOption("");
    await iconSelect.selectOption("custom_svg");

    await expect(linkInput.locator("textarea")).toHaveValue("");
    await expect(linkInput.getByRole("button", { name: "Apply" })).toHaveCount(
      0,
    );
  });

  test("finds Feather icons with a mixed-case space-separated search", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();

    await linkInput.locator("select").first().selectOption("feather");
    await linkInput.getByRole("button", { name: "Open icon picker" }).click();

    const modal = page.locator(".IconPickerModal");
    await modal.getByPlaceholder("Search icons...").fill("Arrow Left");
    await expect(
      modal.getByRole("button", { name: "arrow left", exact: true }),
    ).toBeVisible();
  });

  test("persists icon dimensions", async ({ page }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const widthInput = linkInput
      .locator("label", { hasText: "Icon Width" })
      .locator('input[type="number"]');
    const heightInput = linkInput
      .locator("label", { hasText: "Icon Height" })
      .locator('input[type="number"]');

    await widthInput.fill("40");
    await heightInput.fill("20");
    await expect(page.locator(".Links .Link svg")).toHaveAttribute(
      "width",
      "40",
    );
    await expect(page.locator(".Links .Link svg")).toHaveAttribute(
      "height",
      "20",
    );

    await widthInput.fill("0");
    await heightInput.fill("0");
    await expect(page.locator(".Links .Link svg")).toHaveAttribute(
      "width",
      "0",
    );
    await expect(page.locator(".Links .Link svg")).toHaveAttribute(
      "height",
      "0",
    );

    await page.reload();
    await openSettings(page);
    await expandWidgetSettings(page, "Quick Links");

    const reopenedInput = widgetSettingsFieldset(page, "Quick Links")
      .locator(".LinkInput")
      .first();
    await expect(
      reopenedInput
        .locator("label", { hasText: "Icon Width" })
        .locator('input[type="number"]'),
    ).toHaveValue("0");
    await expect(
      reopenedInput
        .locator("label", { hasText: "Icon Height" })
        .locator('input[type="number"]'),
    ).toHaveValue("0");
  });

  test("renders every favicon provider with resolution and aspect controls", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const iconSelect = linkInput.locator("select").first();
    const renderedIcon = page.locator(".Links .Link img");

    await iconSelect.selectOption("favicon_google");
    await expect(renderedIcon).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=github.com&sz=256",
    );

    await linkInput
      .locator("label", { hasText: "Resolution" })
      .locator("select")
      .selectOption("64");
    await expect(renderedIcon).toHaveAttribute(
      "src",
      "https://www.google.com/s2/favicons?domain=github.com&sz=64",
    );

    await iconSelect.selectOption("favicon_duckduckgo");
    await expect(renderedIcon).toHaveAttribute(
      "src",
      "https://icons.duckduckgo.com/ip3/github.com.ico",
    );

    await iconSelect.selectOption("favicon_favicone");
    await expect(renderedIcon).toHaveAttribute(
      "src",
      "https://favicone.com/github.com?s=256",
    );

    await linkInput
      .locator("label", { hasText: "Conserve Aspect Ratio" })
      .locator('input[type="checkbox"]')
      .check();
    await linkInput
      .locator("label", { hasText: "Scale" })
      .locator('input[type="number"]')
      .fill("36");
    await expect(renderedIcon).toHaveAttribute(
      "style",
      /width: 36px; height: auto/,
    );
  });

  test("renders and persists custom URL, SVG HTML, and uploaded SVG icons", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const iconSelect = linkInput.locator("select").first();
    const imageDataUrl =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

    await iconSelect.selectOption("custom_image_url");
    await linkInput
      .locator("label", { hasText: "Custom Image URL" })
      .locator('input[type="text"]')
      .fill(imageDataUrl);
    await expect(page.locator(".Links .Link img")).toHaveAttribute(
      "src",
      imageDataUrl,
    );

    await iconSelect.selectOption("custom_svg");
    await linkInput
      .locator("textarea")
      .fill(
        '<svg viewBox="0 0 12 12"><circle data-testid="custom-circle" cx="6" cy="6" r="5" /></svg>',
      );
    await linkInput.getByRole("button", { name: "Apply" }).click();
    await expect(
      page.locator('.Links .Link svg circle[data-testid="custom-circle"]'),
    ).toBeVisible();

    await iconSelect.selectOption("custom_upload");
    await linkInput.locator('input[type="file"]').setInputFiles({
      name: "uploaded-icon.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(
        '<svg viewBox="0 0 14 14"><path data-testid="uploaded-path" d="M0 0h14v14H0z" /></svg>',
      ),
    });
    await expect(
      page.locator('.Links .Link svg path[data-testid="uploaded-path"]'),
    ).toBeVisible();

    await page.reload();
    await expect(
      page.locator('.Links .Link svg path[data-testid="uploaded-path"]'),
    ).toBeVisible();
  });

  test("renders raster and ICO uploads and clears an upload when removed", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const iconSelect = linkInput.locator("select").first();

    await iconSelect.selectOption("custom_upload");
    await linkInput.locator('input[type="file"]').setInputFiles({
      name: "pixel.png",
      mimeType: "image/png",
      buffer: Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
        "base64",
      ),
    });
    await expect(page.locator(".Links .Link .Link-icon img")).toHaveAttribute(
      "src",
      /^data:image\/png;base64,/,
    );

    await linkInput.locator('input[type="file"]').setInputFiles({
      name: "sample.ico",
      mimeType: "image/x-icon",
      buffer: Buffer.from("AAABAAEAAQEAAAAAIABWAAAAFgAAAA==", "base64"),
    });
    await expect(page.locator(".Links .Link .Link-icon img")).toHaveAttribute(
      "src",
      /^data:image\/x-icon;base64,/,
    );

    await iconSelect.selectOption("");
    await expect(page.locator(".Links .Link .Link-icon")).toHaveCount(0);
    await page.reload();
    await expect(page.locator(".Links .Link .Link-icon")).toHaveCount(0);
  });

  test("navigates with default and custom shortcuts but ignores focused controls", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const origin = new URL(page.url()).origin;
    const inputs = settings.locator(".LinkInput");
    const firstUrl = inputs.nth(0).locator('input[type="url"]');

    await firstUrl.fill(`${origin}/?shortcut=default`);
    await firstUrl.blur();
    await settings.getByRole("button", { name: "Add link" }).click();

    const secondLink = inputs.nth(1);
    const secondUrl = secondLink.locator('input[type="url"]');
    await secondUrl.fill(`${origin}/?shortcut=custom`);
    await secondUrl.blur();
    await secondLink
      .locator("label", { hasText: "Keyboard shortcut" })
      .locator('input[type="text"]')
      .fill("x");

    await firstUrl.focus();
    await page.keyboard.press("1");
    await expect(page).toHaveURL(`${origin}/`);
    await firstUrl.fill(`${origin}/?shortcut=default`);
    await firstUrl.blur();

    await secondLink.locator("select").first().focus();
    await page.keyboard.press("x");
    await expect(page).toHaveURL(`${origin}/`);

    await closeSettings(page);
    await page.keyboard.press("x");
    await expect(page).toHaveURL(`${origin}/?shortcut=custom`);
    await expect(page.locator(".Links .Link")).toHaveCount(2);

    await page.keyboard.press("1");
    await expect(page).toHaveURL(`${origin}/?shortcut=default`);
  });

  test("opens links in a new tab from clicks and keyboard shortcuts", async ({
    page,
    context,
  }) => {
    const settings = await addQuickLinks(page);
    const origin = new URL(page.url()).origin;
    const firstLink = settings.locator(".LinkInput").first();
    const urlInput = firstLink.locator('input[type="url"]');

    await urlInput.fill(`${origin}/?opened=new-tab`);
    await urlInput.blur();
    await settingControl(settings, "Links open in a new tab").check();
    await closeSettings(page);

    const renderedLink = page.locator(".Links .Link").first();
    await expect(renderedLink).toHaveAttribute("target", "_blank");
    await expect(renderedLink).toHaveClass(/Link--open/);

    const clickTabPromise = context.waitForEvent("page");
    await renderedLink.click();
    const clickTab = await clickTabPromise;
    await expect(clickTab).toHaveURL(`${origin}/?opened=new-tab`);
    await clickTab.close();
    await expect(page).toHaveURL(`${origin}/`);

    const shortcutTabPromise = context.waitForEvent("page");
    await page.keyboard.press("1");
    const shortcutTab = await shortcutTabPromise;
    await expect(shortcutTab).toHaveURL(`${origin}/?opened=new-tab`);
    await shortcutTab.close();
    await expect(page).toHaveURL(`${origin}/`);
  });

  test("sorts by icon type and persists most-recently-used ordering", async ({
    page,
    context,
  }) => {
    const settings = await addQuickLinks(page);
    const origin = new URL(page.url()).origin;
    const inputs = settings.locator(".LinkInput");

    await inputs.nth(0).locator('input[type="text"]').first().fill("Feather");
    await inputs
      .nth(0)
      .locator('input[type="url"]')
      .fill(`${origin}/?link=feather`);
    await inputs.nth(0).locator('input[type="url"]').blur();

    await settings.getByRole("button", { name: "Add link" }).click();
    await inputs.nth(1).locator('input[type="text"]').first().fill("No icon");
    await inputs
      .nth(1)
      .locator('input[type="url"]')
      .fill(`${origin}/?link=none`);
    await inputs.nth(1).locator('input[type="url"]').blur();

    await settings.getByRole("button", { name: "Add link" }).click();
    await inputs.nth(2).locator('input[type="text"]').first().fill("Favicon");
    await inputs
      .nth(2)
      .locator('input[type="url"]')
      .fill(`${origin}/?link=favicon`);
    await inputs.nth(2).locator('input[type="url"]').blur();
    await inputs
      .nth(2)
      .locator("select")
      .first()
      .selectOption("favicon_google");

    await settingControl(settings, "Links open in a new tab").check();
    await settingControl(settings, "Sort links by").selectOption("icon");
    await closeSettings(page);

    const names = page.locator(".Links .Link-name");
    await expect(names).toHaveText(["No icon", "Favicon", "Feather"]);

    await openSettings(page);
    await expandWidgetSettings(page, "Quick Links");
    await settingControl(
      widgetSettingsFieldset(page, "Quick Links"),
      "Sort links by",
    ).selectOption("lastUsed");
    await closeSettings(page);

    const popupPromise = context.waitForEvent("page");
    await page.locator(".Links .Link", { hasText: "Favicon" }).click();
    const popup = await popupPromise;
    await popup.close();
    await expect(names.first()).toHaveText("Favicon");

    await page.reload();
    await expect(names.first()).toHaveText("Favicon");
  });

  test("renders Iconify identifiers and completes the Feather picker lifecycle", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();
    const iconSelect = linkInput.locator("select").first();

    await iconSelect.selectOption("iconify");
    await linkInput
      .locator("label", { hasText: "Custom Iconify Icon" })
      .locator('input[type="text"]')
      .fill("feather:github");
    await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();

    await iconSelect.selectOption("feather");
    await linkInput.getByRole("button", { name: "Open icon picker" }).click();
    const modal = page.locator(".IconPickerModal");
    await modal.getByPlaceholder("Search icons...").fill("heart");
    await modal.getByRole("button", { name: "heart", exact: true }).click();
    await expect(modal).toHaveCount(0);
    await expect(linkInput.locator(".selected-icon-name")).toHaveText("heart");
    await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();

    await linkInput.getByRole("button", { name: "Open icon picker" }).click();
    await page
      .locator(".IconPickerModal")
      .getByPlaceholder("Search icons...")
      .fill("definitely-not-a-feather-icon");
    await expect(
      page.locator(".IconPickerModal").getByText("No icons found"),
    ).toBeVisible();
    await page
      .locator(".IconPickerModal")
      .getByRole("button", { name: "Cancel" })
      .click();
    await expect(page.locator(".IconPickerModal")).toHaveCount(0);

    await page.reload();
    await openSettings(page);
    await expandWidgetSettings(page, "Quick Links");
    await expect(
      widgetSettingsFieldset(page, "Quick Links")
        .locator(".LinkInput")
        .first()
        .locator(".selected-icon-name"),
    ).toHaveText("heart");
    await expect(page.locator(".Links .Link .Link-icon svg")).toBeVisible();
  });

  test("sanitizes pasted SVG while preserving safe icon geometry", async ({
    page,
  }) => {
    const settings = await addQuickLinks(page);
    const linkInput = settings.locator(".LinkInput").first();

    await linkInput.locator("select").first().selectOption("custom_svg");
    await linkInput.locator("textarea").fill(`
      <svg viewBox="0 0 10 10" onload="window.__quickLinksSvgRan = true">
        <script>window.__quickLinksSvgRan = true</script>
        <style>[data-safe-shape] { fill: currentColor; }</style>
        <animate attributeName="href" values="javascript:window.__quickLinksSvgRan = true" />
        <animateTransform attributeName="transform" type="rotate" from="0 5 5" to="360 5 5" dur="2s" repeatCount="indefinite" />
        <set attributeName="onload" to="window.__quickLinksSvgRan = true" />
        <foreignObject><div onclick="window.__quickLinksSvgRan = true">bad</div></foreignObject>
        <a href="javascript:window.__quickLinksSvgRan = true">
          <rect data-safe-shape="yes" width="10" height="10" style="stroke: currentColor" />
        </a>
        <image href="https://example.invalid/tracker.png" />
      </svg>
    `);
    await linkInput.getByRole("button", { name: "Apply" }).click();

    const renderedSvg = page.locator(".Links .Link .Link-icon svg");
    await expect(renderedSvg).toBeVisible();
    await expect(renderedSvg.locator('[data-safe-shape="yes"]')).toBeVisible();
    await expect(
      renderedSvg.locator("script, animate, set, discard, foreignObject"),
    ).toHaveCount(0);
    await expect(renderedSvg.locator("[onload], [onclick]")).toHaveCount(0);
    await expect(renderedSvg.locator("style")).toHaveCount(1);
    await expect(renderedSvg.locator("animateTransform")).toHaveCount(1);
    await expect(
      renderedSvg.locator('[data-safe-shape="yes"]'),
    ).toHaveAttribute("style", "stroke: currentColor");
    await expect(renderedSvg.locator("a")).not.toHaveAttribute("href");
    await expect(renderedSvg.locator("image")).toHaveAttribute(
      "href",
      "https://example.invalid/tracker.png",
    );
    expect(
      await page.evaluate(
        () =>
          (window as Window & { __quickLinksSvgRan?: boolean })
            .__quickLinksSvgRan,
      ),
    ).toBe(undefined);
  });
});
