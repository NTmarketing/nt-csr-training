# Lesson images

Static assets served at `/images/...` in both dev and prod. Vite serves
`frontend/public/` directly in dev and copies it into `frontend/dist/` on
build; Nginx serves `dist/images/` in production.

## Folder structure

One folder per module. Module IDs (not display numbers) drive the folder
names so renumbering doesn't break references.

```
frontend/public/images/
├── trailer-basics/         # module-trailer-basics
│   ├── types/              # photos of each trailer type
│   ├── hitching/           # ball hitches, plugs, gooseneck
│   └── safety/             # tow vehicle examples, weight ratings
├── module-1/               # Platform Foundations
├── module-2/               # Account & Verification
├── module-3/               # Booking flow
├── module-4/               # Listings & onboarding
├── module-5/               # Payments & payouts
├── module-6/               # Damage & disputes
├── module-7/               # Cancellations & refunds
├── module-8/               # Call handling
├── module-9/               # Difficult conversations
├── module-10/              # Critical facts
└── module-11/              # Final certification (rarely needs images)
```

Add subfolders inside any module folder freely (e.g. `module-3/states/`).

## Naming

`kebab-case.jpg`, descriptive — what the image actually shows, not the
filename your camera spat out.

- ✅ `enclosed-trailer-cargo.jpg`
- ✅ `ball-hitch-2-inch-coupler.jpg`
- ❌ `IMG_2317.jpg`
- ❌ `Screen Shot 2024-02-14 at 3.42.11 PM.png`

## Format & size

- Max width: **1920 px**
- JPEG (Q85) for photos, PNG for diagrams with hard edges or transparency
- Target **< 300 KB** per file
- Run through an optimizer (`squoosh`, `imageoptim`, `cwebp`) before committing

## How to reference

Inline images (flow with text): use markdown inside `content_md`.

```md
Most rentals are utility trailers. ![Open utility trailer with low rails](/images/trailer-basics/types/utility-open.jpg)
```

Structured layouts (galleries, side-by-side comparisons, diagrams): use
the `media` field on the section. See `frontend/src/types.ts` for the
`MediaBlock` union. Example:

```json
{
  "id": "tb-section-2",
  "title": "Common types of trailers",
  "content_md": "...",
  "media": [
    {
      "type": "gallery",
      "columns": 3,
      "images": [
        { "src": "/images/trailer-basics/types/utility.jpg", "alt": "Open utility trailer", "caption": "Utility — most common rental" },
        { "src": "/images/trailer-basics/types/enclosed.jpg", "alt": "Enclosed cargo trailer", "caption": "Enclosed — for valuables" },
        { "src": "/images/trailer-basics/types/car-hauler.jpg", "alt": "Car hauler", "caption": "Car hauler" }
      ]
    },
    {
      "type": "comparison",
      "left":  { "src": "/images/trailer-basics/hitching/4-pin.jpg", "alt": "4-pin plug", "label": "4-pin" },
      "right": { "src": "/images/trailer-basics/hitching/7-pin.jpg", "alt": "7-pin plug", "label": "7-pin" }
    }
  ]
}
```

Both `content_md` images and `media` block images get click-to-zoom
lightbox treatment. (Inline markdown images do not get lightbox in v1 —
only `media` blocks do. If we want lightbox on inline images later, swap
the `<img>` produced in `Markdown.tsx` for a click-handler.)

## Named SVG diagrams

For technical diagrams that aren't photos (ball-hitch sizes, pin plugs,
booking lifecycle, refund timeline, etc.), don't hand-author huge SVG
strings inside `modules.json`. Add the SVG to
`frontend/src/content/svgs.ts` as a named export, then reference it from
modules.json with a `$NAME` shortcut:

```json
{
  "type": "svg",
  "svg": "$BOOKING_LIFECYCLE",
  "caption": "9-step rental flow"
}
```

The current named exports are:

| Key | Subject |
|---|---|
| `$BOOKING_LIFECYCLE` | 9-step booking flow |
| `$CANCELLATION_REFUND_TIMELINE` | Refund-zone bars by hours-before-rental |

Inline raw SVG markup is also supported by passing the literal SVG as
`svg`, but the named system is preferred for anything reused across
modules.
