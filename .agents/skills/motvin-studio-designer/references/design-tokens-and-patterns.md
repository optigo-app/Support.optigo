# Motvin Studio Design Tokens & Implementation Reference

This document provides ready-to-use React components, CSS variables, and design tokens for building applications using the **Motvin Studio** design system.

---

## 1. CSS Design Tokens

```css
:root {
  /* Surface & Backgrounds */
  --motvin-bg-canvas: #ffffff;
  --motvin-bg-app: #f8fafc;
  --motvin-bg-subtle: #f1f5f9;
  --motvin-bg-hover: #f3f4f6;
  --motvin-grid-line: #f1f5f9;

  /* Brand & Accents */
  --motvin-primary-green: #10b981;
  --motvin-primary-green-hover: #059669;
  --motvin-primary-dark: #18181b;
  --motvin-primary-dark-hover: #27272a;
  --motvin-accent-indigo: #4f46e5;
  --motvin-accent-indigo-bg: #eef2ff;

  /* Borders & Shadows */
  --motvin-border-subtle: #e5e7eb;
  --motvin-border-canvas: #e2e8f0;
  --motvin-border-active: #0f172a;
  --motvin-shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  --motvin-shadow-card: 0 1px 3px rgba(0, 0, 0, 0.04);
  --motvin-shadow-dropdown: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);

  /* Typography */
  --motvin-text-primary: #0f172a;
  --motvin-text-secondary: #475569;
  --motvin-text-muted: #94a3b8;

  /* Radii */
  --motvin-radius-modal: 20px;
  --motvin-radius-canvas: 14px;
  --motvin-radius-pill: 9999px;
  --motvin-radius-card: 12px;
  --motvin-radius-control: 8px;
  --motvin-radius-chip: 6px;
}
```

---

## 2. Complete React Implementation: `MotvinStudioModal.jsx`

```jsx
import React, { useState } from 'react';
import {
  X,
  Share2,
  HelpCircle,
  Maximize2,
  Bookmark,
  Check,
  Copy,
  Download,
  RotateCw,
  Sliders,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function MotvinStudioModal({
  isOpen,
  onClose,
  asset = {
    title: 'captions',
    library: 'KEYLINE ICONS',
    license: 'MIT',
    author: 'Keyline Icons',
    attributionRequired: true,
    commercialAllowed: true,
    svgContent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="4"/>
      <path d="M10 10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2"/>
      <path d="M16 10a2 2 0 0 0-2 2v0a2 2 0 0 0 2 2"/>
    </svg>`,
  },
}) {
  // Parametric controls state
  const [strokeCap, setStrokeCap] = useState('round'); // round | butt | square
  const [strokeJoin, setStrokeJoin] = useState('round'); // round | bevel | miter
  const [strokePattern, setStrokePattern] = useState('solid'); // solid | dashed | dotted
  const [rotation, setRotation] = useState(64);
  const [padding, setPadding] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  // Export states
  const [exportFormat, setExportFormat] = useState('svg');
  const [copied, setCopied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleReset = () => {
    setStrokeCap('round');
    setStrokeJoin('round');
    setStrokePattern('solid');
    setRotation(0);
    setPadding(0);
    setFlipH(false);
    setFlipV(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(asset.svgContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modalShell}>
        {/* Top Header / Breadcrumbs */}
        <div style={styles.modalHeader}>
          <div style={styles.breadcrumb}>
            <span style={styles.crumbMuted}>Icons</span>
            <span style={styles.crumbDivider}>›</span>
            <span style={styles.crumbMuted}>Others</span>
            <span style={styles.crumbDivider}>›</span>
            <span style={styles.crumbActive}>{asset.title}</span>
          </div>

          <div style={styles.headerActions}>
            <button style={styles.iconBtn} title="Share"><Share2 size={16} /></button>
            <button style={styles.iconBtn} title="Help"><HelpCircle size={16} /></button>
            <button style={styles.iconBtn} title="Expand"><Maximize2 size={16} /></button>
            <button style={styles.closeBtn} onClick={onClose} title="Close"><X size={18} /></button>
          </div>
        </div>

        {/* 3-Column Studio Body */}
        <div style={styles.studioBody}>
          {/* Left Column: Parameters */}
          <div style={styles.paramColumn}>
            <div style={styles.sectionHeader}>STROKE</div>

            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Cap</label>
              <div style={styles.segmentedGroup}>
                {['round', 'butt', 'square'].map((cap) => (
                  <button
                    key={cap}
                    onClick={() => setStrokeCap(cap)}
                    style={strokeCap === cap ? styles.segmentActive : styles.segmentInactive}
                  >
                    {cap.charAt(0).toUpperCase() + cap.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Join</label>
              <div style={styles.segmentedGroup}>
                {['round', 'bevel', 'miter'].map((join) => (
                  <button
                    key={join}
                    onClick={() => setStrokeJoin(join)}
                    style={strokeJoin === join ? styles.segmentActive : styles.segmentInactive}
                  >
                    {join.charAt(0).toUpperCase() + join.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={styles.paramGroup}>
              <label style={styles.paramLabel}>Pattern</label>
              <div style={styles.segmentedGroup}>
                {['solid', 'dashed', 'dotted'].map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setStrokePattern(pattern)}
                    style={strokePattern === pattern ? styles.segmentActive : styles.segmentInactive}
                  >
                    {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...styles.sectionHeader, marginTop: '24px' }}>TRANSFORM</div>

            <div style={styles.paramGroup}>
              <div style={styles.sliderHeader}>
                <label style={styles.paramLabel}>Rotation</label>
                <span style={styles.sliderVal}>{rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                style={styles.rangeInput}
              />
            </div>

            <div style={styles.paramGroup}>
              <div style={styles.sliderHeader}>
                <label style={styles.paramLabel}>Padding</label>
                <span style={styles.sliderVal}>{padding}</span>
              </div>
              <input
                type="range"
                min="0"
                max="32"
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
                style={styles.rangeInput}
              />
            </div>

            <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
              <button style={styles.resetBtn} onClick={handleReset}>
                Reset all
              </button>
            </div>
          </div>

          {/* Center Column: Canvas & Details */}
          <div style={styles.canvasColumn}>
            {/* Graph Paper Canvas */}
            <div style={styles.canvasContainer}>
              <div
                style={{
                  transform: `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1})`,
                  padding: `${padding}px`,
                  transition: 'transform 0.1s ease-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '180px',
                  height: '180px',
                }}
                dangerouslySetInnerHTML={{ __html: asset.svgContent }}
              />
            </div>

            {/* Asset Meta Row */}
            <div style={styles.assetMetaRow}>
              <div style={styles.metaLeft}>
                <h2 style={styles.assetTitle}>{asset.title}</h2>
                <div style={styles.badgeRow}>
                  <span style={styles.badgeIndigo}>{asset.library}</span>
                  <span style={styles.badgeNeutral}>{asset.license}</span>
                </div>
              </div>

              <div style={styles.metaActions}>
                <button
                  style={isSaved ? styles.savedBtn : styles.saveBtn}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  <Bookmark size={14} fill={isSaved ? 'currentColor' : 'none'} />
                  {isSaved ? 'Saved' : 'Save'}
                </button>
                <button style={styles.secondaryBtn}>
                  Find Similar
                </button>
              </div>
            </div>

            {/* Similar Icons Strip */}
            <div style={styles.similarSection}>
              <div style={styles.similarLabel}>SIMILAR ICONS</div>
              <div style={styles.similarStrip}>
                {[93, 93, 93, 93, 93, 93, 93].map((match, i) => (
                  <div key={i} style={styles.similarCard}>
                    <div style={styles.similarIconPreview}>
                      <div
                        style={{ width: '20px', height: '20px' }}
                        dangerouslySetInnerHTML={{ __html: asset.svgContent }}
                      />
                    </div>
                    <span style={styles.matchBadge}>{match}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Export & Attribution */}
          <div style={styles.exportColumn}>
            <div style={styles.sectionHeader}>EXPORT SETTINGS</div>

            {/* Split Primary Button */}
            <div style={styles.splitBtnRow}>
              <button style={styles.primaryExportBtn} onClick={handleCopyCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy SVG'}
              </button>
              <button style={styles.downloadBtn}>
                <Download size={15} />
                Download SVG
              </button>
            </div>

            <button style={styles.copyPngBtn}>
              Copy PNG
            </button>

            {/* Format Dropdown & Code Preview */}
            <div style={styles.formatSelectRow}>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={styles.formatSelect}
              >
                <option value="svg">SVG</option>
                <option value="jsx">JSX / React</option>
                <option value="vue">Vue</option>
                <option value="html">HTML &lt;img&gt;</option>
                <option value="css">CSS mask URL</option>
                <option value="data">Data URL</option>
              </select>
            </div>

            <div style={styles.codeSnippetBox}>
              <button style={styles.floatingCopyBtn} onClick={handleCopyCode}>
                <Copy size={12} /> Copy
              </button>
              <pre style={styles.codeText}>
                {asset.svgContent}
              </pre>
            </div>

            {/* License & Attribution */}
            <div style={{ ...styles.sectionHeader, marginTop: '20px' }}>LICENSE & ATTRIBUTION</div>
            <div style={styles.attributionTable}>
              <div style={styles.attrRow}>
                <span style={styles.attrLabel}>Source & License</span>
                <span style={styles.attrValueLink}>
                  {asset.author}, {asset.license} <ExternalLink size={11} style={{ marginLeft: 3 }} />
                </span>
              </div>
              <div style={styles.attrRow}>
                <span style={styles.attrLabel}>Attribution</span>
                <span style={styles.attrValue}>
                  {asset.attributionRequired ? 'Required (in source)' : 'Not required'}
                </span>
              </div>
              <div style={styles.attrRow}>
                <span style={styles.attrLabel}>Commercial Use</span>
                <span style={styles.attrValue}>
                  {asset.commercialAllowed ? 'Allowed' : 'Restricted'}
                </span>
              </div>
            </div>

            {/* Disclaimer Alert */}
            <div style={styles.disclaimerBanner}>
              <Info size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#6366F1' }} />
              <p style={styles.disclaimerText}>
                Third-party asset. Copyright and license remain with the original creator. Motvin does not claim ownership of third-party artwork.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '24px',
  },
  modalShell: {
    backgroundColor: '#FFFFFF',
    borderRadius: '24px',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    width: '100%',
    maxWidth: '1160px',
    maxHeight: '92vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '18px 28px',
    borderBottom: '1px solid #F1F5F9',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  crumbMuted: { color: '#64748B', cursor: 'pointer' },
  crumbDivider: { color: '#CBD5E1', fontSize: '11px' },
  crumbActive: { color: '#0F172A', fontWeight: 600 },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    padding: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  closeBtn: {
    background: '#F1F5F9',
    border: 'none',
    color: '#0F172A',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginLeft: '6px',
  },
  studioBody: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr 310px',
    height: '620px',
    overflow: 'hidden',
  },
  paramColumn: {
    borderRight: '1px solid #F1F5F9',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  paramGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  paramLabel: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1E293B',
  },
  segmentedGroup: {
    display: 'flex',
    backgroundColor: '#F1F5F9',
    padding: '3px',
    borderRadius: '9999px',
    gap: '2px',
  },
  segmentActive: {
    flex: 1,
    border: 'none',
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    fontSize: '11px',
    fontWeight: 600,
    padding: '6px 8px',
    borderRadius: '9999px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    cursor: 'pointer',
  },
  segmentInactive: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 500,
    padding: '6px 8px',
    borderRadius: '9999px',
    cursor: 'pointer',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderVal: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#64748B',
  },
  rangeInput: {
    width: '100%',
    accentColor: '#18181B',
    cursor: 'pointer',
  },
  resetBtn: {
    width: '100%',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    color: '#475569',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  canvasColumn: {
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  canvasContainer: {
    backgroundColor: '#FFFFFF',
    backgroundImage:
      'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)',
    backgroundSize: '20px 20px',
    backgroundPosition: '-1px -1px',
    border: '1px solid #E2E8F0',
    borderRadius: '16px',
    height: '320px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  assetMetaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '20px',
  },
  metaLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  assetTitle: {
    fontSize: '20px',
    fontWeight: 700,
    color: '#0F172A',
    margin: 0,
  },
  badgeRow: {
    display: 'flex',
    gap: '6px',
  },
  badgeIndigo: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '9999px',
    letterSpacing: '0.04em',
  },
  badgeNeutral: {
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '9999px',
  },
  metaActions: {
    display: 'flex',
    gap: '8px',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#18181B',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  savedBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#10B981',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    color: '#1E293B',
    border: '1px solid #E2E8F0',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  similarSection: {
    marginTop: '24px',
  },
  similarLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: '#94A3B8',
    letterSpacing: '0.05em',
    marginBottom: '10px',
  },
  similarStrip: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
  },
  similarCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '8px',
    borderRadius: '10px',
    border: '1px solid #F1F5F9',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    width: '54px',
  },
  similarIconPreview: {
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchBadge: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#64748B',
  },
  exportColumn: {
    borderLeft: '1px solid #F1F5F9',
    padding: '24px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    overflowY: 'auto',
  },
  splitBtnRow: {
    display: 'flex',
    gap: '8px',
  },
  primaryExportBtn: {
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
  },
  downloadBtn: {
    backgroundColor: '#F1F5F9',
    color: '#1E293B',
    border: 'none',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  copyPngBtn: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    color: '#475569',
    border: '1px solid #E2E8F0',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  formatSelectRow: {
    display: 'flex',
  },
  formatSelect: {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '12px',
    fontWeight: 500,
    color: '#1E293B',
    backgroundColor: '#FFFFFF',
    outline: 'none',
  },
  codeSnippetBox: {
    position: 'relative',
    backgroundColor: '#F8FAFC',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px',
    maxHeight: '120px',
    overflow: 'auto',
  },
  floatingCopyBtn: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    padding: '3px 8px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#475569',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    cursor: 'pointer',
  },
  codeText: {
    margin: 0,
    fontSize: '11px',
    fontFamily: 'monospace',
    color: '#0F172A',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-all',
  },
  attributionTable: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    fontSize: '12px',
  },
  attrRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attrLabel: {
    color: '#64748B',
  },
  attrValue: {
    color: '#0F172A',
    fontWeight: 500,
  },
  attrValueLink: {
    color: '#4F46E5',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  disclaimerBanner: {
    backgroundColor: '#F5F3FF',
    border: '1px solid #EDE9FE',
    borderRadius: '10px',
    padding: '10px 12px',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    margin: 0,
    fontSize: '11px',
    lineHeight: '1.4',
    color: '#4338CA',
  },
};
```

---

## 3. Command Toolbar & Filter Drawer Pattern

```jsx
export function MotvinCommandBar({
  category = 'All icons',
  searchQuery,
  onSearchChange,
  activeTab = 'Trending',
  onTabChange,
  totalResults = 390508,
}) {
  const tabs = ['All', 'Relevant', 'Popular', 'Trending', 'Name A to Z', 'Name Z to A'];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #F1F5F9' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Category Pill Dropdown */}
        <button style={{
          backgroundColor: '#F1F5F9',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '9999px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#0F172A',
          cursor: 'pointer',
        }}>
          Category: <span style={{ color: '#475569' }}>{category}</span> ▾
        </button>

        {/* Live Search Input */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search icons..."
            style={{
              padding: '8px 14px',
              paddingLeft: '32px',
              borderRadius: '9999px',
              border: '1px solid #E2E8F0',
              fontSize: '13px',
              width: '240px',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Pill Sort Tabs */}
      <div style={{ display: 'flex', gap: '4px' }}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              style={{
                background: 'none',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '9999px',
                fontSize: '13px',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#0F172A' : '#64748B',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              {tab}
              {isActive && (
                <div style={{
                  position: 'absolute',
                  bottom: '-2px',
                  left: '12px',
                  right: '12px',
                  height: '2px',
                  backgroundColor: '#0F172A',
                  borderRadius: '2px',
                }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
```
