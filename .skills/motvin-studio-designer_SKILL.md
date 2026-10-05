---
name: motvin-studio-designer
description: Design, build, and architect modern creative tools, asset managers, SaaS galleries, and interactive studio inspector modals inspired by Motvin's UI architecture. Features 3-column studio canvas, parametric segmented controls, multi-format export hubs, faceted filter drawers, and fine-grid staging canvases.
---

# Motvin Studio UI & Architecture Designer

A comprehensive design pattern and component architecture skill modeled after the **Motvin Studio** interface (`motvin.com/icons`). It provides blueprints, design tokens, component specifications, and ready-to-use patterns for high-utility SaaS applications, asset libraries, design tools, and interactive inspector studios.

## What This Skill Does

Helps you design and build modern, high-density SaaS interfaces and creative tools:
- **Interactive Studio Inspector Modal** - 3-column layout featuring parameters, staging canvas, and export hub.
- **Fine-Grid Staging Canvas** - Graph-paper millimeter backdrop (`#F1F5F9` on `#FFFFFF`) for asset inspection.
- **Parametric Segmented Controls** - Pill-shaped segmented controls for discrete states (Caps, Joins, Line Patterns).
- **Continuous Sliders with Preset Quick-Chips** - Range inputs paired with live values and discrete pill buttons (`[16] [20] [24] [32]`).
- **Multi-Format Export Hub** - Split emerald green CTA, format selector (SVG, React JSX, Vue, HTML, CSS mask), syntax snippet box with copy action.
- **Licensing & Attribution Metadata** - Clear source citation, commercial status, and legal disclaimer banner.
- **Similar Items Carousel** - Horizontal strip of visual variations with percentage confidence badges.
- **Command Toolbar & Faceted Filter Drawer** - Slim left navigation rail, category pill dropdown, live search, sort tabs, and collapsible slide-out drawer.

---

## 1. Visual Design Tokens

### Color Palette
- **Canvas / Surface Background**: `#FFFFFF`
- **Application Backdrop**: `#F8FAFC` to `#FAFAFA`
- **Grid Lines**: `#F1F5F9` (1px line, 20px grid pitch)
- **Primary CTA (Export / Action)**: `#10B981` (Hover: `#059669`)
- **Primary Dark (Save / Selection)**: `#18181B` (Zinc-900 / Slate-900)
- **Secondary Neutral**: `#F3F4F6` (Gray-100)
- **Border Subtle**: `#E5E7EB` (Slate-200) / `#F1F5F9`
- **Indigo Badge**: Background `#EEF2FF`, Text `#4F46E5`
- **Disclaimer Banner**: Background `#F5F3FF`, Border `#EDE9FE`, Text `#4338CA`

### Geometry & Elevation
- **Studio Modal Shell**: `border-radius: 24px`, shadow `0 25px 50px -12px rgba(0,0,0,0.25)`.
- **Canvas Container**: `border-radius: 16px`, border `1px solid #E2E8F0`.
- **Segmented Control Rail**: `border-radius: 9999px`, background `#F1F5F9`, padding `3px`.
- **Active Segment Pill**: `border-radius: 9999px`, background `#FFFFFF`, shadow `0 1px 2px rgba(0,0,0,0.06)`.
- **Preset Chips**: `border-radius: 6px` to `8px`, height `26px`, font-size `11px-12px`.

---

## 2. Core Layout Architecture

### A. The 3-Column Studio Modal Layout
```
+-------------------------------------------------------------------------------------------------------+
| BREADCRUMBS: Icons > Category > Item                       [Share] [Help] [Fullscreen] [Close X]      |
+----------------------+-----------------------------------------------+--------------------------------+
| 1. PARAMETERS (220px)| 2. STAGING CANVAS & METADATA (Flex-1)         | 3. EXPORT & ATTRIBUTION (310px)|
|                      | +-------------------------------------------+ |                                |
| STROKE               | |   # # # # # # # # # # # # # # # # # # #   | | EXPORT SETTINGS                |
| Cap: [Round|Butt|Sq] | |   #        GRAPH PAPER CANVAS         #   | | [ Copy SVG | ⌄ ] [Download SVG]|
| Join: [Rnd|Bvl|Mtr]  | |   #                                       # | [ Copy PNG ]                   |
| Pattern: [Sld|Dsh|Dt]| |   #            [ PREVIEW ]                # | Format: [ JSX / React ⌄ ]      |
|                      | |   # # # # # # # # # # # # # # # # # # #   | | +----------------------------+ |
| TRANSFORM            | +-------------------------------------------+ | | const Icon = () => (...)     | |
| Rotation: [---o-] 64°| Item Name  [TAG] [LICENSE]                    | | </svg>         [ Copy ]      | |
| Padding:  [o----] 0  | [ Save Bookmark ]   [ Find Similar ]          | +----------------------------+ |
|                      |                                               |                                |
| [ Reset all ]        | SIMILAR ITEMS                                 | LICENSE & ATTRIBUTION          |
|                      | [Card 93%] [Card 93%] [Card 93%] [Card 93%]   | Source, Attribution, Commercial|
+----------------------+-----------------------------------------------+--------------------------------+
```

### B. Catalog & Filter Navigation
- **Left Navigation Rail (64px)**: Minimalist vertical stack: Filters (with counter), Packs, Saved, Plugins, Help.
- **Command Bar**: Category selector pill (`Category: All icons ⌄`), live search bar, horizontal sort pill tabs (`All`, `Relevant`, `Popular`, `Trending`, `Name A-Z`).
- **Collapsible Filter Drawer**: Slide-out drawer with source counts (`390k`), search source input, checkbox list with brand icons, style radios (Outline, Solid, Duotone), and sliders with preset chips.

---

## 3. UI Component Patterns

### Pattern 1: Staging Canvas (Graph Paper Grid)
```css
.studio-canvas {
  background-color: #ffffff;
  background-image:
    linear-gradient(#f1f5f9 1px, transparent 1px),
    linear-gradient(90deg, #f1f5f9 1px, transparent 1px);
  background-size: 20px 20px;
  background-position: -1px -1px;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 320px;
}
```

### Pattern 2: Segmented Pill Controller
```jsx
<div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '9999px', gap: '2px' }}>
  {options.map((opt) => (
    <button
      key={opt.value}
      onClick={() => setSelected(opt.value)}
      style={{
        flex: 1,
        border: 'none',
        borderRadius: '9999px',
        padding: '6px 10px',
        fontSize: '11px',
        fontWeight: selected === opt.value ? 600 : 500,
        backgroundColor: selected === opt.value ? '#FFFFFF' : 'transparent',
        color: selected === opt.value ? '#0F172A' : '#64748B',
        boxShadow: selected === opt.value ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
        cursor: 'pointer',
      }}
    >
      {opt.label}
    </button>
  ))}
</div>
```

### Pattern 3: Slider with Quick-Preset Chips
```jsx
<div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
    <span>Size</span>
    <span style={{ color: '#64748B' }}>{size}px</span>
  </div>
  <input
    type="range"
    min="16"
    max="64"
    value={size}
    onChange={(e) => setSize(Number(e.target.value))}
    style={{ accentColor: '#18181B' }}
  />
  <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
    {[16, 20, 24, 32].map((preset) => (
      <button
        key={preset}
        onClick={() => setSize(preset)}
        style={{
          border: size === preset ? '1px solid #18181B' : '1px solid #E2E8F0',
          backgroundColor: size === preset ? '#F8FAFC' : '#FFFFFF',
          fontSize: '11px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        {preset}
      </button>
    ))}
  </div>
</div>
```

### Pattern 4: Split Primary Export Button
```jsx
<div style={{ display: 'flex', width: '100%', gap: '8px' }}>
  <button style={{
    flex: 1,
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
  }}>
    Copy SVG
  </button>
  <button style={{
    backgroundColor: '#F1F5F9',
    color: '#1E293B',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  }}>
    Download SVG
  </button>
</div>
```

---

## 4. Design Checklist
- [ ] Clean white `#FFFFFF` modal shell with generous `24px` radius.
- [ ] 3-column studio symmetry (220px parameters / Flex-1 canvas / 310px export).
- [ ] Graph-paper staging canvas background (`linear-gradient` 20px grid).
- [ ] Segmented pill buttons for discrete states.
- [ ] Preset chip buttons below sliders for instant one-click settings.
- [ ] Emerald green `#10B981` primary export CTA.
- [ ] Code preview box with floating one-click copy button.
- [ ] Similar items strip with percentage confidence tags.
- [ ] Transparent attribution and copyright disclaimer banner.
