---
name: Academic Focus
colors:
  surface: '#f9f9fd'
  surface-dim: '#d9dade'
  surface-bright: '#f9f9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f3f7'
  surface-container: '#ededf2'
  surface-container-high: '#e8e8ec'
  surface-container-highest: '#e2e2e6'
  on-surface: '#1a1c1f'
  on-surface-variant: '#42474f'
  inverse-surface: '#2f3034'
  inverse-on-surface: '#f0f0f4'
  outline: '#72777f'
  outline-variant: '#c2c7d0'
  surface-tint: '#35618d'
  primary: '#00375e'
  on-primary: '#ffffff'
  primary-container: '#1f4e79'
  on-primary-container: '#95bff1'
  inverse-primary: '#a0cafc'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#313539'
  on-tertiary: '#ffffff'
  tertiary-container: '#474c4f'
  on-tertiary-container: '#b8bcc0'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d1e4ff'
  primary-fixed-dim: '#a0cafc'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#184974'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#dfe3e7'
  tertiary-fixed-dim: '#c3c7cb'
  on-tertiary-fixed: '#171c1f'
  on-tertiary-fixed-variant: '#43474b'
  background: '#f9f9fd'
  on-background: '#1a1c1f'
  surface-variant: '#e2e2e6'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  container-max: 1200px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  stack-xl: 64px
---

## Brand & Style
The design system is engineered for high-level cognitive work, research, and structured learning. The personality is authoritative yet modern—blending the prestige of traditional academia with the fluidity of contemporary software.

The visual style is **Modern Glassmorphism**. This approach utilizes depth and translucency to organize information without the visual "weight" of traditional borders. By using frosted glass effects and layered elevations, the system reduces cognitive load, allowing users to focus on complex data and educational content. The emotional response is one of clarity, intellectual rigor, and premium quality.

## Colors
The palette is rooted in **Deep Navy (#1F4E79)**, providing a sense of stability and institutional trust. **Energetic Azure (#3B82F6)** is used sparingly for primary actions and focus states to keep the interface feeling dynamic and responsive.

Backgrounds utilize **Soft Slate (#F1F5F9)** to minimize eye strain during long reading sessions. Accent colors (Emerald, Amber, Rose) are desaturated slightly to maintain a refined, professional tone while providing clear semantic signaling for success, warnings, and errors.

## Typography
This design system employs a dual-typeface strategy to balance character with utility. **Outfit** is used for headlines to provide a clean, geometric, and modern academic feel. **Inter** is used for body text and functional labels due to its exceptional legibility and systematic performance.

Hierarchy is enforced through significant weight contrast. Headlines should be bold and tightly tracked, while body text maintains generous line-height to facilitate deep reading and comprehension.

## Layout & Spacing
The layout philosophy centers on a **Fixed Grid** with a max-width container to prevent line lengths from becoming unreadable on ultra-wide displays. Content is centered to create a focused, "study-like" environment.

Whitespace is treated as a functional element rather than empty space. Large vertical gaps (`stack-xl`) are used to separate major sections, while tight internal padding (`stack-sm`) groups related metadata. On mobile, margins compress significantly, but the central focus remains consistent through a single-column reflow.

## Elevation & Depth
Depth is achieved through the intersection of three layers:
1.  **The Canvas:** The Soft Slate base layer.
2.  **The Glass Layer:** Elevated cards use a background blur (`backdrop-filter: blur(12px)`) and a semi-transparent white fill (`rgba(255, 255, 255, 0.7)`).
3.  **The Stroke:** Every glass element is defined by a 1px subtle white border (`rgba(255, 255, 255, 0.4)`) to simulate light catching the edge of a lens.

Shadows are multi-layered and diffused. Avoid harsh, high-opacity shadows. Instead, use "ambient" shadows with a large blur radius and very low opacity (e.g., `0 20px 40px rgba(31, 78, 121, 0.08)`).

## Shapes
Shapes in the design system are approachable but structured. A standard border radius of **16px (1rem)** is applied to main container cards to soften the academic tone. 

- **Small elements** (inputs, buttons): Use 8px (0.5rem).
- **Medium elements** (cards, modals): Use 16px (1rem).
- **Interactive pills** (tags, progress bar containers): Use Full Radius (999px).

## Components

### Buttons
Primary buttons use the Deep Navy background with white text. Hover states should initiate a subtle lift (Y-axis translation) and a deepening of the energetic azure shadow. Secondary buttons should use the Glassmorphism style: transparent background, blur effect, and the 1px white stroke.

### Cards
Cards are the primary container. They must feature generous internal padding (min 32px). On hover, cards should transition to a slightly higher elevation with a more pronounced background blur, creating a "magnified" effect.

### Progress Bars
Progress bars utilize a horizontal gradient from Energetic Azure to a lighter tint of the same hue. The track should be a desaturated Slate with a slight inner shadow to give the illusion of an inset groove.

### Input Fields
Inputs should be clean with a 1px slate border that transforms into a 2px Energetic Azure border on focus. Use Inter for input text to ensure maximum readability of user-generated data.

### Icons
Icons should be 24px by default, using a "Medium" stroke weight to match the visual weight of the Outfit headers. Use the Deep Navy for standard icons and the Energetic Azure for interactive icons.
