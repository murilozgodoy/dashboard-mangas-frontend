/**
 * Paleta verde/amarelo (manga) – profissional e intuitivo
 */
export const colors = {
  // Verdes
  greenDark: "#1b4332",
  greenMedium: "#2d6a4f",
  green: "#40916c",
  greenLight: "#52b788",
  greenPale: "#74c69d",
  greenBg: "#e8f5e9",

  // Amarelos / âmbar
  amberDark: "#b45309",
  amber: "#d97706",
  amberMedium: "#f59e0b",
  amberLight: "#fbbf24",
  amberPale: "#fde68a",
  amberBg: "#fffbeb",

  // Neutros
  slate: "#264653",
  grayDark: "#374151",
  gray: "#6b7280",
  grayLight: "#9ca3af",
  grayPale: "#e5e7eb",
  white: "#ffffff",
  bg: "#f8faf8",
  cardBg: "#ffffff",

  // Texto
  textPrimary: "#1f2937",
  textSecondary: "#4b5563",
  textMuted: "#6b7280",
} as const

export type Colors = typeof colors
