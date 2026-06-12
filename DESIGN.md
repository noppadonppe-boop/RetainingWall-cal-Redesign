---
name: Structural Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#444653'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#757684'
  outline-variant: '#c4c5d5'
  surface-tint: '#3755c3'
  primary: '#00288e'
  on-primary: '#ffffff'
  primary-container: '#1e40af'
  on-primary-container: '#a8b8ff'
  inverse-primary: '#b8c4ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#323537'
  on-tertiary: '#ffffff'
  tertiary-container: '#484c4e'
  on-tertiary-container: '#b9bcbe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dde1ff'
  primary-fixed-dim: '#b8c4ff'
  on-primary-fixed: '#001453'
  on-primary-fixed-variant: '#173bab'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  mono-data:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 24px
  margin-page: 40px
  container-max: 1280px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system is engineered for technical precision, reliability, and clarity. It caters to structural engineers and architects who require a high-density information environment that remains legible during complex calculation workflows.

The visual style is **Corporate / Modern** with a lean towards **Industrial Minimalism**. It prioritizes functional hierarchy over decorative elements. The interface uses a systematic approach to whitespace and alignment to reduce cognitive load when managing multi-step engineering formulas. The emotional response is one of "calculated confidence"—the UI feels like a high-end calibration tool: stable, responsive, and uncompromisingly accurate.

## Colors
The palette is rooted in "Engineering Blue," providing a sense of institutional trust and stability. "Purple Accent" is used sparingly to denote interactive logic, calculation triggers, or premium features, distinguishing them from standard navigation.

- **Primary (#1E40AF):** Used for structural branding, primary actions, and active selection states.
- **Secondary (#7C3AED):** Used for "Calculate" buttons, specialized tooltips, and data-driven highlights.
- **Surface & Background:** The main workspace uses #FFFFFF for maximum contrast. Sub-panels and input groups use #F8FAFC to create subtle containment without heavy borders.
- **Status:** High-saturation Green and Red are reserved strictly for safety factor passes/fails and validation errors.

## Typography
This design system utilizes **Inter** for its exceptional legibility in data-heavy interfaces. Its tall x-height ensures that technical labels remain readable even at small sizes. 

For numerical output and calculation results, a monospaced font (JetBrains Mono) is introduced to ensure that decimal points align vertically in tables, facilitating quick visual audits of structural values. Use `label-caps` for all form field headers and table headers to distinguish them from user-generated input.

## Layout & Spacing
The design system employs a **Fixed Grid** model for the main calculation workspace to maintain the integrity of complex diagrams and multi-column input forms. 

- **Desktop:** 12-column grid with 24px gutters. Content is centered in a 1280px container.
- **Tablet:** 8-column grid with 16px gutters.
- **Mobile:** 4-column grid with 16px margins. 

The vertical rhythm follows a strict 4px base unit. Input groups should be stacked with 16px (stack-md) spacing, while major section headers use 32px (stack-lg) to create clear separation between calculation modules (e.g., Soil Properties vs. Stem Reinforcement).

## Elevation & Depth
To maintain an industrial, high-fidelity feel, the design system utilizes **Low-contrast outlines** paired with **Tonal layers**. 

Avoid heavy shadows that might distract from the data. Instead, use 1px borders in `#E2E8F0` for cards. When a card or element is focused, use a subtle 4px "Soft Glow" shadow tinted with the primary blue at 10% opacity. 

Z-index levels:
- **Level 0 (Background):** #F8FAFC
- **Level 1 (Card/Surface):** #FFFFFF with 1px border.
- **Level 2 (Popovers/Dropdowns):** #FFFFFF with a 12px blur, 15% opacity neutral shadow.

## Shapes
The design system uses **Soft (0.25rem)** roundedness to reflect a modern yet disciplined aesthetic. Sharp edges are avoided to prevent the UI from feeling "dated," but large radii are avoided to maintain the professional, tool-like character.

- **Inputs & Buttons:** 4px (0.25rem) radius.
- **Cards & Containers:** 8px (0.5rem) radius.
- **Status Badges:** Fully rounded (pill) to distinguish them from interactive buttons.

## Components
- **Buttons:** Primary buttons use `primary_color_hex` with white text. Calculation triggers use `secondary_color_hex`. Use a 2px inset border on active/pressed states.
- **Input Fields:** Use a 1px border (`#CBD5E1`). On focus, the border shifts to `primary_color_hex` with a 2px outer glow. Include trailing units (e.g., "kN/m²", "mm") in a neutral gray within the field.
- **Technical Tables:** Use `label-caps` for headers with a subtle gray background. Rows should have a hover state of `tertiary_color_hex`. Use monospaced font for all numerical cells.
- **Status Badges:** Use a "Light Fill" style—low-opacity background of the status color with high-opacity text (e.g., Success: 10% Green background, 100% Green text).
- **Calculation Cards:** Group related inputs (e.g., "Surcharge Loads") into white cards with a light gray border. Use a vertical blue accent bar (3px wide) on the left edge of the "Active" card to guide the user's focus.
- **Diagram Containers:** Place 2D/3D wall cross-sections in a container with a `#F1F5F9` background to differentiate the visual canvas from the data entry area.
