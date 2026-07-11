# Plot Bunni - Minimalist UI Redesign Guide

## Overview
This document outlines a comprehensive redesign to make the Plot Bunni UI more minimalistic while retaining all features. The approach focuses on:
- **Reduced visual clutter** through whitespace and simplified layouts
- **Cleaner typography** with improved hierarchy
- **Subtle interactions** instead of prominent UI elements
- **Context-sensitive controls** that appear only when needed
- **Streamlined navigation** with icon-primary design
- **Reduced padding/margins** while maintaining readability

---

## 1. Global Design Principles

### 1.1 Spacing & Layout
- **Reduce default padding/margins by 20-30%**
  - Button padding: `px-3 py-2` instead of `px-4 py-2.5`
  - Card padding: `p-4` instead of `p-6`
  - Section margins: `gap-3` instead of `gap-4`
  
- **Maximize vertical space**
  - Remove unnecessary dividers between sections
  - Use subtle background colors instead of borders
  - Collapse accordion sections by default
  
### 1.2 Typography
- **Simplified font sizes**
  - Headings: Use 2-3 levels instead of 4-5
  - Remove text-xs, use sm sparingly
  - Increase line-height to 1.6 for better readability despite reduced size
  
- **Reduce visual weight**
  - Use font-normal for most text (avoid font-semibold where unnecessary)
  - Reserve bold for primary headings and critical labels only

### 1.3 Colors & Borders
- **Minimize borders**
  - Replace borders with subtle shadows or background color changes
  - Use borders only for input fields and interactive elements
  - Replace thick borders with `border-b-2` or `border-t-1`
  
- **Use opacity strategically**
  - Secondary text: `text-foreground/60` instead of `text-muted-foreground`
  - Inactive state: `opacity-50` instead of grayscale effects

### 1.4 Interactive Elements
- **Icons over text labels** where space-efficient
- **Hover states only on interactive elements**
- **Reduced button sizes and prominence**
  - Prefer ghost/outline buttons over solid
  - Use sm size variant for secondary actions
  - Minimize padding on icon-only buttons

---

## 2. Component-Specific Changes

### 2.1 NovelGridView
**Current:** Large cards with cover images, prominent action buttons overlaid
**Minimalist:**
- Reduce card height from `h-80` to `h-64`
- Move action buttons to card footer area (hidden until hover)
- Use `group` and `group-hover:` for subtle reveal
- Remove excessive shadows; use `shadow-sm` instead of `shadow-md`
- Smaller, more compact novel names (text-base instead of text-lg)
- Add novel count/metadata as small badges instead of separate card sections

### 2.2 NovelCard
**Changes:**
```jsx
// Before: Large cover + prominent overlay buttons
// After:
- Cover image: Keep 2:3 ratio but reduce overall card size
- Name: Small, centered, subtle
- Actions: Icon buttons (sm) revealed on hover
- No background hover effects; only button visibility changes
```

### 2.3 App.jsx (Novel Editor Layout)
**Current:** Prominent header with tabs, sidebar with collapsible sections
**Minimalist:**
- **Header:** Reduce height from 16 to 12 units
  - Smaller logo/title
  - Compact breadcrumb instead of full header
  - Move less-critical actions to menu (⋮)
  
- **Sidebar:** More compact
  - Reduce padding from p-6 to p-3
  - Tabs: Use smaller text-size (sm)
  - Collapse empty/secondary sections by default
  
- **Main content area:**
  - Increase margins/padding slightly (since sidebar is smaller)
  - Use full width when sidebar is collapsed

### 2.4 Tabs & Navigation
**Changes:**
- Reduce tab height and padding
- Use text-sm for labels
- Subtle underline instead of colored backgrounds
- Visually de-emphasize inactive tabs (use opacity)

### 2.5 Forms & Modals
**Current:** Large modal dialogs with substantial padding and spacing
**Minimalist:**
- Reduce modal max-width if appropriate (e.g., w-96 instead of w-full for small forms)
- Compact form layouts:
  - Stack form fields with `gap-2` instead of `gap-4`
  - Use label-input combos without extra spacing
  - Remove placeholder text; use only labels
  
- Button groups: Reduce spacing between buttons

### 2.6 Concept Cache & Plan View
**Changes:**
- Concept list: Use compact list items (no cards for each concept)
  - Single line per concept: `[Icon] Name [Tag] [Action]`
  - Actions revealed on hover
  
- Plan (Act/Chapter/Scene):
  - Remove excessive nesting indentation
  - Use subtle visual hierarchy (color/weight instead of size)
  - Scene cards: Ultra-compact (text-sm, minimal padding)
  - Drag handles: Icon-only, visible on hover

### 2.7 WriteView
**Changes:**
- Maximize text area focus
- Reduce margins around scene textareas
- Move toolbar (AI button, help) to compact corner position
- Scene dividers: Subtle (thin line + small spacing) instead of prominent
- Scene headers: Small, subtle (maybe even collapsed by default)

### 2.8 Settings/Theme Editor
**Changes:**
- Vertical stack of settings (not multiple columns)
- Color pickers: Inline (not full modal)
- Settings groups: Use subtle background instead of cards
- Labels: Smaller, more compact

---

## 3. Specific Implementation Guidelines

### 3.1 Button Sizing
```jsx
// Primary actions: md
<Button>Save</Button>

// Secondary actions: sm
<Button variant="outline" size="sm">Cancel</Button>

// Icon-only: sm
<Button variant="ghost" size="icon" className="h-8 w-8"><ChevronDown /></Button>

// Reduce default padding
<Button className="px-3 py-2">Compact Button</Button>
```

### 3.2 Spacing Classes
```jsx
// Replace:
gap-4 → gap-3 or gap-2.5
p-6 → p-4 or p-3
px-4 py-2.5 → px-3 py-2
mb-4 → mb-3
```

### 3.3 Card & Container Styling
```jsx
// Instead of bordered cards:
<div className="bg-muted/40 rounded-lg p-4">
  {/* content */}
</div>

// For more separation:
<div className="bg-secondary/10 rounded-lg p-3 border-l-2 border-primary">
  {/* content */}
</div>
```

### 3.4 Hover & Interaction States
```jsx
// Reveal on hover pattern:
<div className="group">
  <div className="group-hover:visible invisible">
    <Button size="sm" variant="ghost">Action</Button>
  </div>
</div>

// Subtle focus states
<input className="focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
```

### 3.5 Typography
```jsx
// Main heading
<h1 className="text-lg font-semibold">Title</h1>

// Subheading
<h2 className="text-base font-medium">Subtitle</h2>

// Regular text
<p className="text-sm text-foreground/80">Content</p>

// Meta text
<span className="text-xs text-foreground/50">Meta info</span>
```

---

## 4. Migration Strategy

### Phase 1: Foundation (Global changes)
1. Update tailwind spacing defaults in `tailwind.config.js`
2. Create Shadcn UI component overrides with compact defaults
3. Update global CSS variables for reduced padding/margins

### Phase 2: Layouts (Major containers)
1. Redesign `App.jsx` header and sidebar
2. Update `NovelGridView` card layout
3. Streamline modal and form styling

### Phase 3: Components (Feature components)
1. Update `ConceptCacheList` and concept modals
2. Redesign `PlanView` components
3. Streamline `WriteView` layout

### Phase 4: Polish (Details & refinement)
1. Review all icon usage and positioning
2. Ensure hover states work smoothly
3. Test on different screen sizes
4. Verify all features still accessible

---

## 5. Key File Changes Priority

**High Priority (Major Impact):**
- `src/App.jsx` - Header and layout restructure
- `src/components/novel/NovelGridView.jsx` - Card size/density
- `src/components/novel/NovelCard.jsx` - Compact design
- `src/components/write/WriteView.jsx` - Maximize content area
- Global spacing in component files

**Medium Priority (Polish):**
- `src/components/concept/ConceptCacheList.jsx` - Compact list
- `src/components/plan/PlanView.jsx` - Hierarchy refinement
- All modal components - Form compaction
- `tailwind.config.js` - Theme/spacing adjustments

**Lower Priority (Details):**
- Individual button styling across components
- Icon size consistency
- Minor color/opacity adjustments

---

## 6. Minimalist Design Checklist

- [ ] Remove unnecessary padding/margins globally
- [ ] Simplify color palette usage (fewer accent colors)
- [ ] Hide secondary actions until hover/context menu
- [ ] Use icons for common actions
- [ ] Reduce modal sizes where appropriate
- [ ] Simplify form layouts
- [ ] Use subtle backgrounds instead of borders
- [ ] Ensure adequate whitespace for readability
- [ ] Test all features remain accessible
- [ ] Verify mobile responsiveness
- [ ] Check keyboard navigation still works
- [ ] Ensure AI features still prominently accessible
- [ ] Verify all data display is readable at reduced sizes

---

## 7. Before/After Examples

### Novel Grid View
```
BEFORE:
┌─────────────────────────────────────────┐
│  [Cover Image - Large]                  │
│  [Rename] [Delete]                      │
│  Novel Name (Large)                     │
│  Author: ...                            │
│  Created: ...                           │
│  5 words                                │
└─────────────────────────────────────────┘

AFTER:
┌──────────────────┐
│ [Cover Image]    │
│ Novel Name       │
│ [•••] [Delete]   │ (hover reveal)
└──────────────────┘
```

### Novel Editor Header
```
BEFORE:
┌────────────────────────────────────────────┐
│ ← Home  |  Novel Title                [•••]│
├────────────────────────────────────────────┤
│ [Write] [Plan] [Concepts] [Settings]      │
└────────────────────────────────────────────┘

AFTER:
┌─────────────────────────────────┐
│ ← Novel Title           [•••]   │
├─────────────────────────────────┤
│ [W] [P] [C] [S]                │
└─────────────────────────────────┘
(With compact icons and smaller text)
```

---

## Notes
- Maintain all existing features - no feature removal
- Test thoroughly on small screens
- Ensure sufficient contrast for accessibility
- Consider providing a UI density setting in the future
- Document any new design tokens or component patterns
