# Bidooze Design System - Figma Design Tokens

This document contains all design variables and metadata extracted from the Bidooze Figma project.

## File Information
- **File Key**: `TlM2PFZzkKu5T7LkXOoUka`
- **Project Name**: Bidooze
- **URL**: https://www.figma.com/design/TlM2PFZzkKu5T7LkXOoUka/Bidooze

---

## Color Tokens

### Primary Colors (Green)
```css
--green-50: #f9fef0;
--green-100: #f3fde0;
--green-200: #d8fb8a;
--green-300: #d2f57d;
--green-400: #d2f57d;
--green-500: #cef17b;
--green-600: #9fbb5e;
--green-700: #748943;
--green-800: #4c5a2a;
--green-900: #272f13;
--green-950: #161c08;

/* Primary Surface/Border/Text Tokens */
--primary-surface-subtle: #f9fef0;
--primary-border-subtle: #f3fde0;
--primary-surface-lighter: #d8fb8a;
--primary-surface-default: #cef17b;
--primary-surface-darker: #748943;
--primary-text-label: #748943;
```

### Secondary Colors (Purple)
```css
--purple-50: #f5f2fe;
--purple-100: #eae5fc;
--purple-200: #d6cbfa;
--purple-300: #c3b1f7;
--purple-400: #b097f4;
--purple-500: #9e7bf1;
--purple-600: #8650eb;
--purple-700: #6a28cd;
--purple-800: #491990;
--purple-900: #2a0b57;
--purple-950: #1b053c;
```

### Greyscale Colors
```css
--grey-50: #f6f7f6;
--grey-100: #edeeec;
--grey-200: #d9dad8;
--grey-300: #c8cac7;
--grey-400: #b5b6b4;
--grey-500: #a4a5a3;
--grey-600: #818180;
--grey-700: #606160;
--grey-800: #40403f;
--grey-900: #232423;
--grey-950: #151615;

/* Greyscale Surface/Border/Text Tokens */
--greyscale-surface-subtle: #f6f7f6;
--greyscale-surface-default: #edeeec;
--greyscale-surface-disabled: #c8cac7;
--greyscale-border-default: #b5b6b4;
--greyscale-border-disabled: #c8cac7;
--greyscale-border-darker: #606160;
--greyscale-text-title: #232423;
--greyscale-text-body: #40403f;
--greyscale-text-subtitle: #606160;
--greyscale-text-caption: #a4a5a3;
--greyscale-text-negative: #f6f7f6;
--greyscale-text-disabled: #b5b6b4;
```

### Error/Red Colors
```css
--red-50: #ffedec;
--red-100: #ffdad9;
--red-200: #ffb3b1;
--red-300: #ff8985;
--red-400: #ff4d43;
--red-500: #e52200;
--red-600: #b61900;
--red-700: #8f1100;
--red-800: #660900;
--red-900: #3f0300;
--red-950: #2b0200;

/* Error Surface/Border/Text Tokens */
--error-surface-subtle: #ffedec;
--error-border-subtle: #ffdad9;
--error-surface-lighter: #ff8985;
--error-surface-default: #e52200;
--error-surface-darker: #8f1100;
--error-text-label: #8f1100;
```

### Warning Colors
*Note: Warning color palette structure similar to Error/Red, but specific values need to be extracted from individual nodes*

---

## Typography

### Font Family
- **Primary Font**: Jura (Bold, Regular)
- **Usage**: Headings and body text

### Heading Styles
- **H1**: 77px height
- **H2**: 58px height
- **H3**: 48px height
- **H4**: 38px height
- **H5**: 29px height
- **H6**: 24px height

### Body Text Styles
- **Body Large**: 25px height
- **Body Regular**: 22px height
- **Body Small**: 20px height

### Caption Styles
- **Caption Large**: 17px height
- **Caption Small**: 14px height

---

## Component Structure

### Color Token Sections
1. **Primary** (Frame ID: 1:310)
   - Surface variations (Subtle, Lighter, Default, Darker)
   - Border variations (Subtle, Lighter, Default, Darker)
   - Text/Icon (Label)

2. **Secondary** (Frame ID: 1:400)
   - Purple color palette
   - Similar structure to Primary

3. **Greyscale** (Frame ID: 1:333)
   - Surface variations
   - Border variations
   - Text variations (Title, Body, Subtitle, Caption, Negative, Disabled)

4. **Warning** (Frame ID: 1:423)
   - Warning color palette

5. **Error** (Frame ID: 1:446)
   - Error/Red color palette

### Typography Section
- **Headings** (Section ID: 11:102)
  - H1 through H6 styles
- **Body** (Section ID: 11:135)
  - Body Large, Regular, Small
  - Base, Strong, Slant variants
- **Captions** (Section ID: 11:158)
  - Caption styles

### Button Components
- **Component Library** (Frame ID: 37:924)
  - Primary and Secondary button types
  - Multiple states: Default, Hover, Focused, Selected, Disabled
  - Multiple sizes: Small, Medium, Large
  - Pills variant (rounded)
  - Icon positions: None, Left, Right, Alone

---

## Design Metadata

### Color Palette Structure
The design system uses a hierarchical color naming convention:
- `{category}/{type}/{variant}`
- Examples:
  - `surface/subtle`
  - `border/default`
  - `text/label`

### Border Radius
- Default: 12px (rounded-[12px])
- Used consistently across components

### Spacing
- Components use consistent padding and margins
- Grid-based layout system

---

## Recommendations for Implementation

1. **Map Figma Variables to CSS Variables**
   - Convert Figma variable names to CSS custom properties
   - Maintain the hierarchical naming structure

2. **Typography Scale**
   - Implement the Jura font family
   - Create heading and body text utility classes
   - Map font sizes to the design system

3. **Color System**
   - Implement all color tokens as CSS variables
   - Support light/dark mode if applicable
   - Create utility classes for common color combinations

4. **Component Library**
   - Button components with all variants
   - Consistent border radius (12px)
   - State management (hover, focus, disabled, etc.)

---

## Next Steps

To extract more detailed information:
1. Get variable definitions for Secondary and Warning color sections
2. Extract specific color values from individual color swatches
3. Get design context for button components to understand exact styling
4. Extract spacing and sizing tokens
5. Get typography specifications (font weights, line heights, letter spacing)

