# Design Guidelines

## Overview

This document outlines the design system, UI/UX principles, and visual guidelines for the Noor SuperApp. Our design philosophy centers on creating a serene, accessible, and culturally resonant experience for Muslims worldwide.

---

## Design Principles

### 1. **Spiritual Serenity**
- Create a calm, focused environment conducive to spiritual reflection
- Use soft transitions and subtle animations
- Avoid overwhelming users with excessive visual stimuli

### 2. **Cultural Authenticity**
- Incorporate Islamic art and geometric patterns respectfully
- Support RTL (Right-to-Left) languages seamlessly
- Use culturally appropriate imagery and iconography

### 3. **Accessibility First**
- WCAG 2.1 AA compliance minimum
- High contrast ratios for readability
- Keyboard navigation support
- Screen reader optimization

### 4. **Consistency Across Platforms**
- Maintain visual consistency between web and mobile
- Platform-specific optimizations (iOS, Android, Web)
- Unified component library

---

## Color Palette

### Primary Colors

#### Emerald Green
- **Hex**: `#009688`
- **RGB**: `0, 150, 136`
- **Usage**: Primary brand color, CTAs, navigation highlights
- **Symbolism**: Growth, peace, spiritual connection

**Variants**:
- Light: `#4DB6AC` (`rgb(77, 182, 172)`)
- Dark: `#00796B` (`rgb(0, 121, 107)`)

#### Gold
- **Hex**: `#FFD700`
- **RGB**: `255, 215, 0`
- **Usage**: Premium features, accents, highlights
- **Symbolism**: Blessing, excellence, divine light

**Variants**:
- Light: `#FFE44D` (`rgb(255, 228, 77)`)
- Dark: `#CCA300` (`rgb(204, 163, 0)`)

### Neutral Colors

#### Cream White
- **Hex**: `#F5F5DC`
- **RGB**: `245, 245, 220`
- **Usage**: Backgrounds, cards, light themes
- **Purpose**: Soft, easy on the eyes for extended reading

#### Charcoal Black
- **Hex**: `#36454F`
- **RGB**: `54, 69, 79`
- **Usage**: Text, dark themes, strong contrasts
- **Purpose**: Professional, readable, sophisticated

### Semantic Colors

#### Success
- **Color**: `#4CAF50` (Green)
- **Usage**: Success messages, completed actions, achievements

#### Warning
- **Color**: `#FF9800` (Orange)
- **Usage**: Warnings, alerts, important notices

#### Error
- **Color**: `#F44336` (Red)
- **Usage**: Errors, destructive actions

#### Info
- **Color**: `#2196F3` (Blue)
- **Usage**: Information, tips, guidance

---

## Typography

### Font Families

#### English/Western Languages
- **Primary**: Poppins (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semi-Bold), 700 (Bold)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

#### Arabic/RTL Languages
- **Primary**: Tajawal (Google Fonts)
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold), 900 (Black)
- **Fallback**: 'Traditional Arabic', Arial, sans-serif

### Type Scale

| Element | Size (px) | Weight | Line Height | Usage |
|---------|-----------|--------|-------------|-------|
| H1 | 36-40 | 700 | 1.2 | Page titles |
| H2 | 28-32 | 600 | 1.3 | Section headers |
| H3 | 24-28 | 600 | 1.4 | Subsections |
| H4 | 20-24 | 500 | 1.4 | Card titles |
| Body | 16-18 | 400 | 1.6 | Main content |
| Small | 14-16 | 400 | 1.5 | Captions, labels |
| Tiny | 12-14 | 400 | 1.4 | Footnotes |

### Arabic Text Styling

```css
.arabic-text {
  font-family: 'Tajawal', sans-serif;
  font-size: 1.5rem; /* 24px */
  line-height: 2;
  text-align: right;
  direction: rtl;
  font-weight: 500;
}
```

### Quran Arabic Text

```css
.quran-arabic {
  font-family: 'Amiri Quran', 'Traditional Arabic', serif;
  font-size: 2rem; /* 32px */
  line-height: 2.2;
  text-align: center;
  color: #36454F;
  font-weight: 400;
}
```

---

## Spacing System

### Base Unit: 4px

| Name | Value | Usage |
|------|-------|-------|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 16px | Default spacing |
| lg | 24px | Section spacing |
| xl | 32px | Large gaps |
| 2xl | 48px | Major sections |
| 3xl | 64px | Page sections |

### Grid System
- **Base**: 12-column grid
- **Gutter**: 16px (md)
- **Container Max Width**: 1200px
- **Breakpoints**:
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+

---

## Components

### Buttons

#### Primary Button
```css
.btn-primary {
  background: #009688;
  color: #FFFFFF;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-primary:hover {
  background: #00796B;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 150, 136, 0.3);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: #FFD700;
  color: #36454F;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  border: 2px solid #009688;
  color: #009688;
  padding: 10px 22px;
  border-radius: 8px;
}
```

### Cards

```css
.card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-4px);
}

/* Dark mode */
.dark .card {
  background: #2D3748;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
```

### Input Fields

```css
.input-field {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #009688;
  box-shadow: 0 0 0 3px rgba(0, 150, 136, 0.1);
}
```

### Progress Rings

```css
.progress-ring {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: conic-gradient(
    #009688 0deg 180deg,
    #E2E8F0 180deg 360deg
  );
  display: flex;
  align-items: center;
  justify-content: center;
}

.progress-ring::before {
  content: '';
  width: 100px;
  height: 100px;
  background: #FFFFFF;
  border-radius: 50%;
}
```

### Prayer Widget

```
┌─────────────────────────────┐
│  🕌 Next Prayer             │
│                             │
│  ╔═══════════════════════╗  │
│  ║       MAGHRIB         ║  │
│  ║       18:45           ║  │
│  ║    In 2 hours         ║  │
│  ╚═══════════════════════╝  │
│                             │
│  Fajr    05:30    ✓        │
│  Dhuhr   13:00    ✓        │
│  Asr     16:30    ✓        │
│  Maghrib 18:45    →        │
│  Isha    20:15             │
└─────────────────────────────┘
```

---

## Layout Patterns

### Navigation Structure

#### Web - Drawer Navigation
```
┌──────────────────────────────────┐
│  ☰  Noor SuperApp  [🌙][🌐][👤] │ ← Header
├────┬─────────────────────────────┤
│    │                             │
│ 📖 │  Main Content Area          │
│ 🕌 │                             │
│ 🤖 │                             │
│ 💰 │                             │
│ 👥 │                             │
│    │                             │
└────┴─────────────────────────────┘
     ↑
   Drawer
```

#### Mobile - Bottom Tab Navigation
```
┌─────────────────────┐
│   Header            │
├─────────────────────┤
│                     │
│   Content           │
│                     │
│                     │
├─────────────────────┤
│ 🏠 📖 🕌 🤖 👤     │ ← Bottom Tabs
└─────────────────────┘
```

### Page Layouts

#### Dashboard Layout
```
┌────────────────────────────────────┐
│  Welcome, User!        [Settings]  │
├─────────────┬──────────────────────┤
│             │                      │
│  Daily      │   Prayer Widget      │
│  Verse      │                      │
│             │                      │
├─────────────┴──────────────────────┤
│  QuranHub  │  Hadith  │  Planner  │
├────────────┼──────────┼────────────┤
│  AI Chat   │  Donate  │  Kids      │
└────────────┴──────────┴────────────┘
```

---

## Icons

### Icon Library
- **Primary**: React Icons (Feather Icons subset)
- **Islamic**: Custom SVG icons
- **Size Scale**: 16px, 20px, 24px, 32px, 48px

### Custom Islamic Icons
- Mosque (🕌)
- Quran book
- Prayer beads (Tasbih)
- Crescent and star
- Kaaba
- Prayer mat
- Compass (Qibla)

---

## Animations

### Principles
- **Duration**: 200-300ms for micro-interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth motion
- **Purpose**: Guide attention, provide feedback

### Common Animations

#### Fade In
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

#### Slide Up
```css
@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

#### Prayer Time Notification
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
```

---

## Dark Mode

### Color Adjustments

| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| #F5F5DC | #1A202C | Background |
| #FFFFFF | #2D3748 | Card background |
| #36454F | #F5F5DC | Text |
| #718096 | #CBD5E0 | Secondary text |
| #009688 | #4DB6AC | Primary (lighter) |

### Implementation
```css
/* Tailwind Dark Mode */
<div className="bg-cream-white dark:bg-charcoal-black">
  <h1 className="text-charcoal-black dark:text-cream-white">
    Noor SuperApp
  </h1>
</div>
```

---

## Responsive Design

### Breakpoints
```javascript
const breakpoints = {
  mobile: '320px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
};
```

### Mobile-First Approach
```css
/* Mobile default */
.container {
  padding: 16px;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: 24px;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

---

## Accessibility

### Contrast Ratios
- **Normal text**: 4.5:1 minimum
- **Large text**: 3:1 minimum
- **UI components**: 3:1 minimum

### Focus States
```css
*:focus-visible {
  outline: 2px solid #009688;
  outline-offset: 2px;
}
```

### ARIA Labels
```html
<button aria-label="Open prayer times">
  <PrayerIcon />
</button>
```

### Screen Reader Support
- Semantic HTML5 elements
- Proper heading hierarchy
- Alt text for all images
- Skip navigation links

---

## Imagery

### Photography
- Natural, authentic Muslim life
- Diverse representation (age, ethnicity, geography)
- High quality, well-lit images
- Respectful cultural representation

### Illustrations
- Flat, modern style
- Geometric patterns inspired by Islamic art
- Color palette aligned with brand
- Culturally appropriate

### Image Specifications
- **Format**: WebP (with fallback)
- **Hero images**: 1920x1080px
- **Thumbnails**: 400x300px
- **Icons**: SVG (scalable)
- **Optimization**: <200KB per image

---

## Resources

### Design Tools
- **Figma**: Primary design tool
- **Adobe Illustrator**: Icon creation
- **Adobe Photoshop**: Image editing

### Figma File Structure
```
Noor SuperApp Design System
├── 🎨 Foundations
│   ├── Colors
│   ├── Typography
│   └── Spacing
├── 🧩 Components
│   ├── Buttons
│   ├── Cards
│   ├── Forms
│   └── Navigation
├── 📱 Screens
│   ├── Web
│   ├── Mobile - iOS
│   └── Mobile - Android
└── 🌙 Dark Mode
```

---

**Last Updated**: October 7, 2025
**Maintained By**: Noor SuperApp Design Team
**Figma Link**: [Design System](https://figma.com/noor-superapp)
