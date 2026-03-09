---
title: OpenType Features in Widgets
sidebar_position: 2
---

# OpenType Features in Widgets

Many widgets in TablissNG allow for custom font settings. You can access these by opening a widget's settings and toggling the **Open Font Settings** link.

TablissNG supports advanced typography through **OpenType features**. This allows you to specify more than just the font name; you can also enable specific stylistic sets or typographic variants directly in the "Font" box.

## How to use

Set the custom font by typing its name followed by the OpenType feature tag, separated by a colon:

```text
Cambria:smcp
```

_The example above will display the font using the Small Capitals set._

### Multiple Features

You can include multiple OpenType features by appending additional tags with an ampersand (`&`):

```text
Cambria:smcp&onum
```

_This adds "Oldstyle Figures" (onum) along with "Small Capitals" (smcp)._

## Common OpenType Tags

| Tag    | Description                   |
| :----- | :---------------------------- |
| `clig` | Contextual Ligatures          |
| `c2pc` | Petite Capitals From Capitals |
| `dlig` | Discretionary Ligatures       |
| `frac` | Fractions                     |
| `lnum` | Lining Figures                |
| `onum` | Oldstyle Figures              |
| `pcap` | Petite Capitals               |
| `pnum` | Proportional Figures          |
| `salt` | Stylistic Alternates          |
| `smcp` | Small Capitals                |
| `subs` | Subscript                     |
| `sups` | Superscript                   |
| `tnum` | Tabular Figures               |
| `zero` | Slashed Zero                  |

## Resources

- **Discovery**: To find out which OpenType features are supported by a font on your system, use the [Wakamai Fondue](https://wakamaifondue.com/) ("What can my font do") tool.
- **Reference**: For a comprehensive list of typographic features, see the [List of typographic features](https://en.wikipedia.org/wiki/List_of_typographic_features) on Wikipedia.
