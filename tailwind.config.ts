// tailwind.config.ts
export const brandColors = {
  blue: "#3498db",
  green: "#2ecc71",
  gold: "#f1c40f",
  danger: "#FF4D4F",
  primary: "#0A7CFF",
  surface: "var(--surface)",
  background: "var(--background)",
  text: "var(--text)",
};

// tailwind.config.ts
const config = {
  theme: {
    extend: {
      keyframes: {
        'suredeal-flow': {
          '0%, 20%': { transform: 'scale(1)', opacity: '1' },
          '10%, 30%': { transform: 'scale(1.25)', opacity: '0.9' }, // Expand/Contract twice
          '40%': { transform: 'rotate(360deg) scale(0)', opacity: '0' }, // Rotate and disappear
          '50%, 70%': { transform: 'scale(1.5)', opacity: '1' }, // "S" form expands twice
          '60%, 80%': { transform: 'scale(1.2)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' }, // Reset to word
        }
      },
      animation: {
        'brand-load': 'suredeal-flow 4s infinite ease-in-out',
      }
    }
  }
};

export default config;