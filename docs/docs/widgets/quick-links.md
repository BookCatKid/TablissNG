---
sidebar_position: 1
description: Learn how to use the Quick Links widget to add custom shortcuts to your new tab page.
---

# Quick Links Widget

The Quick Links widget allows you to add custom shortcut links to your new tab page. You can customize the appearance and behavior of each link, including custom icons, names, and keyboard shortcuts.

## Widget Settings

These settings apply to the entire Quick Links widget:

- **Number of columns** - Control how many columns of links are displayed
- **Sort links by** - Choose how links are sorted:
  - Manual order - Links appear in the order you added them
  - Name - Sort alphabetically by link name
  - Icon type - Sort by the type of icon used
  - Most recently used - Sort with recently clicked links first
- **Links are always visible** - Keep links visible at all times
- **Links open in a new tab** - Open links in a new browser tab instead of the current tab
- **Links are numbered** - Show numbers next to each link
- **Center links in columns** - Center-align links within their columns

## Adding Links

To add a new link, click the "Add link" button at the bottom of the widget settings. Each link has the following options:

### URL (Required)

The web address that the link will open. URLs are automatically normalized, so you can enter `example.com` and it will be converted to `https://example.com`.

### Name (Optional)

A display name for the link. If not provided, only the icon (if any) will be displayed.

### Icon (Optional)

You can choose from several icon options:

#### Website Icons

These options automatically fetch the favicon from the website:

- **From Google** - Uses Google's favicon service to fetch the website's icon
- **From DuckDuckGo** - Uses DuckDuckGo's favicon service
- **From Favicone** - Uses Favicone service to fetch icons

When using website icons, you can also set a custom resolution for the fetched icon.

#### Custom Icons

- **From Iconify** - Use any icon from the [Iconify](https://iconify.design/) library. Enter the icon identifier (e.g., `mdi:home`, `fa:github`, `carbon:logo-github`) in the Custom Iconify Identifier field.

- **Custom SVG HTML** - Enter your own SVG code for a completely custom icon. The SVG code will be rendered directly.

- **Custom Image URL** - Enter a URL to an image on the internet to use as an icon.

- **Upload Custom Icon** - Upload an image file (SVG, ICO, PNG, etc.) from your computer.

#### Iconify Icons

- **Feather** - Use icons from the Feather icon set. Click "Open icon picker" to open a visual picker for selecting Feather icons.

### Icon Size

For custom icons, you can set custom width and height dimensions. You can also choose to conserve the aspect ratio when resizing.

### Keyboard Shortcut

Each link can have a custom keyboard shortcut. By default, links are assigned shortcuts based on their position (1-9). You can customize this by entering a single character in the keyboard shortcut field.

To use a keyboard shortcut, press the assigned key while viewing your new tab page.

### Use browser extension API to open link

This option is available on browser extensions (not the web version). When enabled, links open through the browser extension API instead of the default browser behavior. This is useful for restricted URLs like `file://`, `about:`, or browser settings pages.

:::note
Some URLs will always open through the extension API regardless of this setting.
:::

:::note
Firefox restricts access to certain special URLs. If you try to open a restricted URL, you'll receive an error message.
:::

## Using Iconify Icons

Iconify provides access to over 200,000 open source icons. To use an Iconify icon:

1. Select "From Iconify" in the icon dropdown
2. Enter the icon identifier in the Custom Iconify Identifier field

### Finding Icon Identifiers

Visit [icon-sets.iconify.design](https://icon-sets.iconify.design/) to browse available icons. Click on an icon to copy its identifier.

### Icon Identifier Format

Iconify identifiers follow the format: `prefix:icon-name`

- `prefix` - The icon set identifier (e.g., `mdi` for Material Design Icons, `fa` for Font Awesome)
- `icon-name` - The specific icon name within that set

Examples:

- `mdi:home` - Home icon from Material Design Icons
- `fa:github` - GitHub icon from Font Awesome
- `carbon:logo-github` - GitHub logo from Carbon icons
- `simple-icons:github` - GitHub icon from Simple Icons
- `feather:home` - Home icon from Feather icons

## Custom SVG Icons

For maximum customization, you can enter your own SVG HTML code. This is useful if you have a custom logo or icon that isn't available in Iconify.

Example SVG code:

```html
<svg viewBox="0 0 100 100" width="200">
  <circle cx="50" cy="50" r="40" fill="royalblue" />
</svg>
```

SVGS must include a `viewBox` attribute to ensure they scale properly.

## Reordering Links

When "Sort links by" is set to "Manual order", you can reorder your links using the up and down arrow buttons in each link's settings. The order determines:

1. The visual order of links on the page
2. The default keyboard shortcut assignment (first link = `1`, second = `2`, etc.)

## Deleting Links

To remove a link, click the trash/delete button in the link's settings.

## Importing Bookmarks

On browser extensions (except Safari), you can import bookmarks from your browser. Click the import button to select which bookmarks folder to import as links.
