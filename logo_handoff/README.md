assets/
├── logo-icon-dark.svg    — Calendar mark for dark backgrounds (navbar, app)
├── logo-icon-light.svg   — Calendar mark for light backgrounds
└── logo-lockup-dark.svg  — Full "CougarPlanner" wordmark lockup

## Usage in React

```jsx
// In Navbar.jsx — recommended size: 28×28
import logoIcon from '../assets/logo-icon-dark.svg';

<img src={logoIcon} alt="CougarPlanner" width={28} height={28} />
```

Or inline the SVG directly for color control (copy from the .svg files).

## Wordmark (text only — no SVG needed)
```jsx
<span style={{ fontFamily:'Space Mono', fontWeight:700, fontSize:16, 
  color:'#e8eaed', letterSpacing:'-0.02em' }}>
  Cougar<span style={{ color:'#c8102e' }}>Planner</span>
</span>
```
