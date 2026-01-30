/**
 * Paths SVG das 5 macro regiões do Brasil (Norte, Nordeste, Centro-Oeste, Sudeste, Sul).
 * Forma simplificada mas reconhecível do território brasileiro.
 */
export const VIEWBOX = "0 0 300 360"

export const REGIAO_PATHS: Record<string, string> = {
  Norte:
    "M 52 32 L 98 26 L 148 38 L 172 58 L 182 92 L 168 128 L 138 148 L 98 142 L 62 118 L 48 78 Z",
  Nordeste:
    "M 182 58 L 238 42 L 278 68 L 288 118 L 278 162 L 248 192 L 202 198 L 172 168 L 168 128 L 182 92 Z",
  "Centro-Oeste":
    "M 62 118 L 168 128 L 202 198 L 198 258 L 168 288 L 128 298 L 88 278 L 58 248 L 48 198 L 52 158 Z",
  Sudeste:
    "M 198 258 L 248 242 L 278 262 L 282 298 L 258 328 L 218 338 L 168 288 Z",
  Sul:
    "M 128 298 L 218 338 L 242 358 L 228 398 L 178 418 L 128 408 L 88 378 L 78 338 Z",
}
