/**
 * Brand Color Palette and Gradients
 * 
 * Modern React/Tailwind color scheme for Student Tracker
 */

export const brandColors = {
  // Primary Colors
  orange: '#ea580c',
  amber: '#f59e0b',
  
  // Secondary Colors
  dark: '#020617',
  light: '#f8fafc',
  success: '#22c55e',
  
  // Backgrounds
  background: '#ffffff',
  foreground: '#0a0a0a',
} as const;

export const brandGradients = {
  // Hero/Brand text gradient
  brandText: 'linear-gradient(to right, #ea580c, #f59e0b)',
  
  // CTA Section fade
  ctaFade: 'linear-gradient(to bottom, transparent, #fff7ed)',
  
  // Tailwind class versions
  textClass: 'bg-gradient-to-r from-orange-600 to-amber-500',
  ctaClass: 'bg-gradient-to-b from-transparent to-orange-50',
} as const;

export const heroOrbs = {
  // Top-right orb
  topRight: {
    color: '#ffedd5',
    opacity: 0.4,
    class: 'bg-orange-100/40',
  },
  
  // Bottom-left orb
  bottomLeft: {
    color: '#eff6ff',
    opacity: 0.5,
    class: 'bg-blue-50/50',
  },
} as const;

export const colorPalette = {
  'primary-orange': '#ea580c',
  'secondary-amber': '#f59e0b',
  'dark-background': '#020617',
  'light-background': '#f8fafc',
  'border': '#e2e8f0',
  'success': '#22c55e',
} as const;

// Tailwind class helper
export const brandClassNames = {
  // Brand Text Gradient
  heroText: 'bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent',
  
  // Buttons with brand colors
  buttonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
  buttonSecondary: 'bg-amber-500 hover:bg-amber-600 text-white',
  
  // Backgrounds
  bgLight: 'bg-slate-50',
  bgDark: 'bg-slate-950',
  
  // Gradient backgrounds
  gradientBrand: 'bg-gradient-to-r from-orange-600 to-amber-500',
  gradientCta: 'bg-gradient-to-b from-transparent to-orange-50',
} as const;
