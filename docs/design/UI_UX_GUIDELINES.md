# Fibernance UI/UX Guidelines

## Design Direction

Fibernance uses a Minimalist Luxury visual system inspired by high-end fashion editorials and brutalist magazine layouts.

The product must feel:
- precise
- sharp
- restrained
- premium
- text-led

The interface must avoid decorative drift. When in doubt, remove decoration rather than add it.

## Core Rules

### 1. Typography

Use serif typography only for:
- page titles
- large section headings
- primary totals, balances, and key headline numbers

Use sans-serif typography for:
- body text
- labels
- table content
- buttons
- form fields
- metadata
- badges

Approved font roles:
- Serif: Playfair Display, Instrument Serif, Times New Roman fallback
- Sans: Inter, system UI fallbacks
- Mono: only for invoice references, code-like values, and structured exports

### 2. Shape

All interface elements must use sharp corners.

Required:
- `rounded-none`

Forbidden:
- `rounded`
- `rounded-sm`
- `rounded-md`
- `rounded-lg`
- `rounded-full`

### 3. Color

The primary palette is monochrome only.

Primary colors:
- Black `#000000`
- White `#FFFFFF`
- Charcoal and grayscale from Tailwind config

Accent colors are restricted to status communication only.

Allowed accent usage:
- pale green for positive status badges
- pale yellow for warning and attention status badges
- pale red for destructive or cancelled status badges

Forbidden:
- blue CTA buttons
- purple accents
- orange gradients
- saturated neon success/error colors
- decorative multi-color sections

### 4. Decoration

The UI must remain text-first and editorial.

Forbidden:
- emoji in interface copy
- gradient backgrounds
- box shadows used as decoration
- playful dashboard styling
- ornamental icons used only for flair

Allowed:
- plain text labels
- subtle borders
- spacing hierarchy
- occasional simple line icons only when functionally necessary

### 5. Language

The entire UI must use English.

This includes:
- page navigation
- table headers
- labels
- placeholders
- buttons
- helper text
- modal titles
- status messaging

Exceptions:
- generated customer-facing content may be bilingual when required by the feature
- external proper nouns such as Digiflazz remain unchanged

## Component Rules

### Page Headers

Use this structure:
- serif page title
- short sans subtitle
- bottom border
- generous vertical spacing

### Buttons

Use only monochrome button treatments:
- primary: black background, white text
- secondary: white background, black text, gray border
- tertiary: text or ghost with borderless/transparent background when justified

Destructive actions should be communicated with wording and confirmation flow, not bright color blocks.

### Forms

Preferred form style:
- sans labels in uppercase microcopy
- monochrome input treatment
- sharp corners
- no colorful validation blocks unless status feedback requires pale red or pale green

### Cards and Panels

All panels must use:
- white background
- gray border
- no shadow
- no gradient
- sharp corners

### Modals

Modal shells must use:
- white panel
- gray border
- no shadow emphasis beyond overlay
- sharp corners
- English UI chrome

### Status Badges

Status badges may use pale color accents only.

Recommended mapping:
- done/success: green 50 background, green 200 border, green 800 text
- warning: yellow 50 background, yellow 200 border, yellow 800 text
- cancelled/error: red 50 background, red 200 border, red 800 text
- pending/neutral: gray 100 background, gray 300 border, gray 700 text

## Content Style

Tone must be:
- direct
- concise
- operational
- premium

Avoid:
- slang
- mixed Indonesian and English UI strings
- emoji-based emphasis
- exclamation-heavy system messages

## Implementation Checklist

Before merging UI work, verify:
- all visible UI strings are in English
- no `rounded-*` values exist except `rounded-none`
- no `bg-gradient-*` classes exist
- no `shadow-*` classes exist for decorative surfaces
- serif is used only for large headings or major headline numbers
- buttons are monochrome
- accent colors are limited to status badges and status surfaces
- no emoji remain in rendered UI

## Documentation Policy

Every UI-affecting change must also update documentation in `docs/`.

Minimum requirement per task:
- update this file when design rules change
- update `docs/architecture/ARCHITECTURE.md` when structural decisions change
- append a dated note to `docs/development/WORKLOG.md` for implementation work