/**
 * Converte geometria GeoJSON (MultiPolygon) em path "d" para SVG.
 * Projeção equiretangular simples; bounds aproximados do Brasil.
 */
const LNG_MIN = -73.5
const LNG_MAX = -34.5
const LAT_MIN = -33.5
const LAT_MAX = 5.5
const WIDTH = 400
const HEIGHT = 420

function project(lng: number, lat: number): [number, number] {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * WIDTH
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * HEIGHT
  return [x, y]
}

function ringToPath(ring: number[][]): string {
  if (!ring.length) return ""
  const [lng0, lat0] = ring[0]
  const [x0, y0] = project(lng0, lat0)
  let d = `M ${x0.toFixed(2)} ${y0.toFixed(2)}`
  for (let i = 1; i < ring.length; i++) {
    const [lng, lat] = ring[i]
    const [x, y] = project(lng, lat)
    d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
  }
  return d + " Z"
}

type MultiPolygon = {
  type: "MultiPolygon"
  coordinates: number[][][][]
}
type Polygon = {
  type: "Polygon"
  coordinates: number[][][]
}

export function geometryToPath(geometry: MultiPolygon | Polygon): string {
  if (geometry.type === "MultiPolygon") {
    const paths: string[] = []
    for (const polygon of geometry.coordinates) {
      if (polygon[0]) paths.push(ringToPath(polygon[0]))
    }
    return paths.join(" ")
  }
  if (geometry.type === "Polygon") {
    if (geometry.coordinates[0]) return ringToPath(geometry.coordinates[0])
  }
  return ""
}

export const BRAZIL_VIEWBOX = `0 0 ${WIDTH} ${HEIGHT}`

export const BRAZIL_GEOJSON_URL =
  "https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson"
