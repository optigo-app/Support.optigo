---
name: motvin-studio-designer
description: Design, build, and architect modern creative tools, asset managers, SaaS galleries, and interactive studio inspector modals inspired by Motvin's UI architecture. Features 3-column studio canvas, parametric segmented controls, multi-format export hubs, faceted filter drawers, and fine-grid staging canvases.
---

# Motvin Studio UI & Architecture Designer

A comprehensive design pattern and component architecture skill modeled after the **Motvin Studio** interface (`motvin.com/icons`). It provides blueprints, design tokens, component specifications, and ready-to-use patterns for high-utility SaaS applications, asset libraries, design tools, and interactive inspector studios.

---

## What This Skill Does

This skill guides the creation of clean, high-density, modern SaaS web applications featuring:
1. **Interactive Studio Inspector Modal** (3-Column layout: Parametric controllers, fine-grid staging canvas, and multi-format export hub).
2. **Fine-Grid Canvas Staging** (Millimeter graph-paper aesthetic for asset preview and real-time manipulation).
3. **Parametric Segmented Controls** (Stroke caps, joins, patterns, rotation, padding, and flip controls).
4. **Continuous Sliders with Preset Quick-Chips** (Dynamic numeric readouts paired with instant preset buttons).
5. **Multi-Format Export & Code Generator** (Split primary actions, code syntax boxes, format switchers: SVG, React/JSX, Vue, HTML, CSS Mask, Data URL).
6. **Similar Items & Recommendations Strip** (Horizontal similarity carousel with percentage confidence badges).
7. **Dense Catalog & Command Toolbar** (Slim left navigation rail, category dropdown, live search, pill sort tabs, and grid density toggles).
8. **Collapsible Faceted Filter Drawer** (Multi-source checklist with counts, style switchers, sliders, and license groups).

---

## Core Architectural Pillars

```
+----------------------------------------------------------------------------------------------------+
| TOP HEADER: Brand (Beta) | Community | Release Notes | Multi-Library Switcher ⌄ | Profile Pill ⌄   |
+----------------------------------------------------------------------------------------------------+
| [RAIL] | COMMAND BAR: Category ⌄ | Search Input | Sort Tabs: All | Popular | Trending (active)      |
| Filters|-------------------------------------------------------------------------------------------|
| Packs  | MAIN GALLERY GRID                              | SLIDE-OUT FILTER DRAWER                  |
| Saved  | +-----------+ +-----------+ +-----------+     | - All Sources (390k) + Search           |
|        | | Card 1    | | Card 2    | | Card 3    |     | - Checkboxes: [x] Phosphor (9k)         |
|        | | Title     | | Title     | | Title     |     | - Styles: (o) Outline () Solid () Duotone|
|        | +-----------+ +-----------+ +-----------+     | - Size: Slider [55] Chips: [16][20][24]  |
| [Help] | PAGINATION: < Prev [1] 2 3 4 ... 14 Next >     | - Stroke: Slider [1.5] Chips: [1][1.5][2]|
+----------------------------------------------------------------------------------------------------+
```

### The Studio Modal Architecture (Detailed Breakdown)

When an asset is clicked from the gallery, it opens the **Studio Inspector Modal**:

```
+-------------------------------------------------------------------------------------------------------+
| BREADCRUMBS: Icons > Others > captions                     [Share] [Help] [Fullscreen] [Close X]      |
+----------------------+-----------------------------------------------+--------------------------------+
| LEFT: PARAMETERS     | CENTER: STAGING CANVAS & METADATA             | RIGHT: EXPORT & ATTRIBUTION    |
|                      | +-------------------------------------------+ |                                |
| STROKE               | |   # # # # # # # # # # # # # # # # # # #   | | EXPORT SETTINGS                |
| Cap:                 | |   #     FINE GRAPH-PAPER GRID           # | | [ Copy SVG | ⌄ ] [Download SVG]|
| [Round|Butt|Square]  | |   #                                     # | | [ Copy PNG ]                   |
| Join:                | |   #            [ ASSET ]                # | | Format Selector ⌄ (SVG/JSX)   |
| [Round|Bevel|Miter]  | |   #                                     # | | +----------------------------+ |
| Pattern:             | |   # # # # # # # # # # # # # # # # # # #   | | | <svg width="24" ...>       | |
| [Solid|Dashed|Dotted]| +-------------------------------------------+ | | </svg>         [ Copy ]      | |
|                      | captions  [KEYLINE ICONS] [MIT]               | +----------------------------+ |
| TRANSFORM            | [ Save Bookmark ]   [ Find Similar ]          |                                |
| Rotation: [----o-] 64°|                                               | LICENSE & ATTRIBUTION          |
| Padding:  [o-----] 0  | SIMILAR ICONS                                 | Source & License: Keyline, MIT ↗|
| Flip: [H] [V]        | +----+ +----+ +----+ +----+ +----+ +----+     | Attribution: Required (source) |
|                      | | 93%| | 93%| | 93%| | 93%| | 93%| | 93%|     | Commercial Use: Allowed        |
| [ Reset all ]        | +----+ +----+ +----+ +----+ +----+ +----+     | ℹ Third-party asset disclaimer |
+----------------------+-----------------------------------------------+--------------------------------+
```

---

## Design Tokens & Visual Language

### 1. Palette
- **Canvas / Surface Background**: `#FFFFFF` (Pure white for cards, modal dialogs, and surfaces).
- **App Stage / Page Background**: `#F8FAFC` to `#FAFAFA` (Soft neutral foundation).
- **Grid Paper Lines**: `#F1F5F9` (Subtle 1px grid on 16px or 20px intervals).
- **Primary CTA (Export / Action)**: `#10B981` (Emerald green `#10B981`, hover: `#059669`).
- **Primary Dark (Save / Selection)**: `#18181B` (Zinc-900 / Slate-900, text: `#FFFFFF`).
- **Secondary Surface**: `#F3F4F6` (Gray-100 for secondary buttons, preset chips, inactive segments).
- **Borders & Dividers**: `#E5E7EB` (Slate-200 / Gray-200), subtle `#F0F0F0`.
- **Text Hierarchy**:
  - Primary Title / Body: `#0F172A` / `#18181B` (Near black, sharp contrast).
  - Secondary / Label: `#475569` / `#64748B` (Muted slate).
  - Uppercase Section Header: `#94A3B8` (Tracking: 0.06em, 11px).
- **Tag Badges**:
  - Indigo/Purple Pill: Background `#EEF2FF`, Text `#4F46E5`.
  - Neutral Pill: Background `#F1F5F9`, Text `#475569`.
  - Match Percentage Badge: Background `#F8FAFC`, Border `#E2E8F0`, Text `#0F172A` (Bold 11px).
- **Notice / Disclaimer Callout**:
  - Background: `#F5F3FF` (Soft Lavender / Violet-50).
  - Text: `#4338CA` / `#5B21B6`.
  - Icon: Info circle `#6366F1`.

### 2. Geometry & Radii
- **Modal Shell**: `border-radius: 20px` to `24px` with `box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25)`.
- **Canvas Preview Area**: `border-radius: 14px`, border `1px solid #E2E8F0`.
- **Segmented Control Containers**: `border-radius: 9999px` (Pill) or `10px`.
- **Segmented Active Pill**: `border-radius: 9999px` or `8px`, background `#FFFFFF`, shadow `0 1px 3px rgba(0,0,0,0.08)`.
- **Preset Quick-Chips**: `border-radius: 6px` to `8px`, height `26px`, font-size `12px`.
- **Primary Action Buttons**: `border-radius: 8px` to `10px`, font-weight `600`.

### 3. Typography Rules
- Font Family: `Inter`, `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `sans-serif`.
- Code Font: `JetBrains Mono`, `Fira Code`, `monospace`.
- Uppercase Micro-Labels: `font-size: 11px`, `letter-spacing: 0.05em`, `text-transform: uppercase`, `font-weight: 700`.

---

## Component Blueprints & Patterns

### 1. The Staging Canvas (Graph Paper Grid)
The staging canvas creates an authentic "designer workbench" feel.

```css
/* CSS Graph-paper pattern */
.motvin-canvas {
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
  position: relative;
  min-height: 340px;
  overflow: hidden;
}
```

### 2. Segmented Pill Control Group
Used for Caps (`Round | Butt | Square`), Joins (`Round | Bevel | Miter`), and Patterns (`Solid | Dashed | Dotted`).

```jsx
export function SegmentedControl({ options, value, onChange }) {
  return (
    <div style={{
      display: 'inline-flex',
      backgroundColor: '#F1F5F9',
      padding: '3px',
      borderRadius: '9999px',
      gap: '2px',
    }}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            style={{
              border: 'none',
              outline: 'none',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: isActive ? 600 : 500,
              color: isActive ? '#0F172A' : '#64748B',
              backgroundColor: isActive ? '#FFFFFF' : 'transparent',
              boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
```

### 3. Continuous Slider with Quick-Preset Chips
Always pair range sliders with instant numeric feedback and common preset values.

```jsx
export function SliderWithPresets({ label, value, onChange, min, max, step, presets, unit = '' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1E293B' }}>{label}</span>
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
          {value}{unit}
        </span>
      </div>
      
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#18181B',
          height: '4px',
          borderRadius: '2px',
          cursor: 'pointer',
        }}
      />

      {presets && (
        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
          {presets.map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              style={{
                border: value === preset ? '1px solid #18181B' : '1px solid #E2E8F0',
                backgroundColor: value === preset ? '#F8FAFC' : '#FFFFFF',
                color: value === preset ? '#18181B' : '#64748B',
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
      )}
    </div>
  );
}
```

### 4. Split Primary Action Button (Copy / Export)
The signature export button in Motvin features a primary emerald action with an attached dropdown caret.

```jsx
export function SplitExportButton({ onCopy, onDropdownToggle }) {
  return (
    <div style={{ display: 'inline-flex', borderRadius: '8px', overflow: 'hidden', width: '100%' }}>
      <button
        onClick={onCopy}
        style={{
          flex: 1,
          backgroundColor: '#10B981',
          color: '#FFFFFF',
          border: 'none',
          padding: '10px 16px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'background 0.15s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#059669')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#10B981')}
      >
        Copy SVG
      </button>
      <button
        onClick={onDropdownToggle}
        style={{
          backgroundColor: '#0D9488',
          color: '#FFFFFF',
          border: 'none',
          borderLeft: '1px solid rgba(255,255,255,0.2)',
          padding: '0 10px',
          cursor: 'pointer',
        }}
      >
        ▾
      </button>
    </div>
  );
}
```

### 5. Multi-Source Faceted Checklist
As seen in the right filter drawer, list sources with icons, brand labels, and counts.

```jsx
export function FilterSourceItem({ icon, name, count, checked, onChange }) {
  return (
    <label style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 8px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      transition: 'background 0.12s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          style={{ accentColor: '#10B981', cursor: 'pointer' }}
        />
        {icon}
        <span style={{ color: '#1E293B', fontWeight: 500 }}>{name}</span>
      </div>
      <span style={{ fontSize: '12px', color: '#94A3B8' }}>{count.toLocaleString()}</span>
    </label>
  );
}
```

### 6. Similar Items Strip with Similarity Badge
The carousel or grid strip displaying related icons with a match confidence badge:

```jsx
export function SimilarItemCard({ preview, matchPercentage, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
        padding: '8px',
        border: '1px solid #F1F5F9',
        borderRadius: '10px',
        backgroundColor: '#FFFFFF',
        cursor: 'pointer',
        width: '52px',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#F1F5F9')}
    >
      <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {preview}
      </div>
      <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>
        {matchPercentage}%
      </span>
    </div>
  );
}
```

---

## When to Use This Skill

Activate this skill when:
- Designing or implementing **studio inspectors**, **asset visualizers**, **icon/graphics managers**, or **canvas-based tooling**.
- Building **modal dialogs** that combine real-time property customization on the left, an interactive preview canvas in the center, and export/licensing on the right.
- Creating **high-density data catalogs** with a narrow navigation rail, category filter bar, segmented sort pills, and a collapsible slide-over filter panel.
- Adding **preset quick-chips** beneath range sliders or implementing **pill segmented controls**.
- Generating **multi-format code export snippets** (SVG, JSX, Vue, Data URL) with one-click copy feedback.

---

## Verification & Design Checklist

When reviewing or building UI with the Motvin Studio pattern, verify:
- [ ] **Canvas Grid**: Is the preview displayed on a subtle graph-paper grid (`#F1F5F9` lines on `#FFFFFF`)?
- [ ] **3-Column Studio Symmetry**: Are parameters on the left, staging canvas in the center, and export settings on the right?
- [ ] **Segmented Controls**: Are discrete options (caps, joins, patterns) styled as pill buttons inside a rounded container?
- [ ] **Slider Feedback**: Do sliders display their active numerical value and provide one-click preset chips?
- [ ] **Split CTA**: Is the primary export button an emerald green split button with format options?
- [ ] **Attribution & Transparency**: Does the inspector include source, licensing status, and the third-party disclaimer callout?
- [ ] **Similar Items**: Is there a horizontal strip of variations with similarity percentage chips?
- [ ] **Responsiveness**: On screens `< 1024px`, does the modal stack into a responsive tabbed view (Canvas -> Parameters -> Export)?
