import { useState, useEffect, useMemo } from "react"
import { colors } from "@/theme/colors"
import type { RegiaoGeografia } from "@/services/api"
import { UF_PARA_REGIAO } from "./UF_PARA_REGIAO"
import {
  geometryToPath,
  BRAZIL_VIEWBOX,
  BRAZIL_GEOJSON_URL,
} from "./brazilGeoJsonToSvg"
import * as S from "./styled"

/** Regiões para o filtro (ordem IBGE) */
const REGIOES_ORDEM = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"] as const

/** UFs por região (inverso de UF_PARA_REGIAO) */
const REGIAO_PARA_UFS: Record<string, string[]> = (() => {
  const out: Record<string, string[]> = {}
  for (const [uf, reg] of Object.entries(UF_PARA_REGIAO)) {
    if (!out[reg]) out[reg] = []
    out[reg].push(uf)
  }
  return out
})()

/** Posições aproximadas (x, y) no viewBox do SVG para etiquetas de receita por região */
const REGIAO_POSICOES: Record<string, [number, number]> = {
  Norte: [200, 100],
  Nordeste: [310, 170],
  "Centro-Oeste": [170, 230],
  Sudeste: [270, 310],
  Sul: [250, 370],
  Outros: [200, 210],
}

interface GeoFeature {
  type: string
  properties?: { sigla?: string; name?: string; [key: string]: unknown }
  geometry?: { type: string; coordinates: unknown }
}

function getCorPorQuantidade(registros: number, maxRegistros: number): string {
  if (maxRegistros <= 0) return colors.grayPale
  const pct = Math.min(1, registros / maxRegistros)
  const r = 0x1b + (0x40 - 0x1b) * pct
  const g = 0x43 + (0x91 - 0x43) * pct
  const b = 0x32 + (0x6c - 0x32) * pct
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function getCorPorReceita(receita: number, maxReceita: number): string {
  if (maxReceita <= 0) return colors.grayPale
  const pct = Math.min(1, receita / maxReceita)
  const r = 0x1b + (0x40 - 0x1b) * pct
  const g = 0x43 + (0x91 - 0x43) * pct
  const b = 0x32 + (0x6c - 0x32) * pct
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

const COR_ESMAECIDO = "#e5e7eb"

interface BrazilMapProps {
  regioes: RegiaoGeografia[]
  loading?: boolean
}

export function BrazilMap({ regioes, loading }: BrazilMapProps) {
  const [regiaoFiltro, setRegiaoFiltro] = useState<string>("")
  const [geoData, setGeoData] = useState<GeoFeature[]>([])
  const [geoLoading, setGeoLoading] = useState(true)
  const [geoError, setGeoError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setGeoLoading(true)
    setGeoError(null)
    fetch(BRAZIL_GEOJSON_URL)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        const features = data?.features ?? []
        setGeoData(Array.isArray(features) ? features : [])
      })
      .catch((err) => {
        if (!cancelled) setGeoError(err?.message ?? "Erro ao carregar mapa.")
      })
      .finally(() => {
        if (!cancelled) setGeoLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const receitaPorRegiao = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of regioes) {
      map[r.regiao] = r.receita
    }
    return map
  }, [regioes])

  const registrosPorRegiao = useMemo(() => {
    const map: Record<string, number> = {}
    for (const r of regioes) {
      map[r.regiao] = r.registros
    }
    return map
  }, [regioes])

  const maxReceita = useMemo(() => {
    return Math.max(0, ...regioes.map((r) => r.receita))
  }, [regioes])

  const maxRegistros = useMemo(() => {
    return Math.max(0, ...regioes.map((r) => r.registros))
  }, [regioes])

  const ufsDaRegiaoFiltro = useMemo(() => {
    if (!regiaoFiltro) return null
    return new Set(REGIAO_PARA_UFS[regiaoFiltro] ?? [])
  }, [regiaoFiltro])

  const getFill = (sigla: string) => {
    const regiao = UF_PARA_REGIAO[sigla] ?? "Outros"
    const receita = receitaPorRegiao[regiao] ?? 0
    if (ufsDaRegiaoFiltro !== null) {
      const pertence = ufsDaRegiaoFiltro.has(sigla)
      if (!pertence) return COR_ESMAECIDO
      return getCorPorReceita(receita, maxReceita)
    }
    return getCorPorReceita(receita, maxReceita)
  }

  const isLoading = loading || geoLoading

  if (isLoading) {
    return (
      <S.GeoCard>
        <S.GeoTitle>Compras por região (quantidade de registros)</S.GeoTitle>
        <S.MapWrapper
          style={{
            minHeight: 280,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: colors.textMuted,
          }}
        >
          Carregando mapa…
        </S.MapWrapper>
      </S.GeoCard>
    )
  }

  if (geoError) {
    return (
      <S.GeoCard>
        <S.GeoTitle>Compras por região</S.GeoTitle>
        <S.MapWrapper
          style={{
            minHeight: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#b91c1c",
            fontSize: "0.875rem",
          }}
        >
          {geoError}
        </S.MapWrapper>
      </S.GeoCard>
    )
  }

  const formatReceita = (v: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

  return (
    <S.GeoCard>
      <S.GeoTitle>Compras e receita por região</S.GeoTitle>
      <S.RegionFilterRow>
        <S.RegionFilterLabel htmlFor="filtro-regiao">Região:</S.RegionFilterLabel>
        <S.RegionFilterSelect
          id="filtro-regiao"
          value={regiaoFiltro}
          onChange={(e) => setRegiaoFiltro(e.target.value)}
          aria-label="Filtrar por região"
        >
          <option value="">Todas</option>
          {REGIOES_ORDEM.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </S.RegionFilterSelect>
      </S.RegionFilterRow>
      <S.MapWrapper>
        <svg
          viewBox={BRAZIL_VIEWBOX}
          width="100%"
          height="auto"
          style={{ maxHeight: 420 }}
          aria-label="Mapa do Brasil por região"
        >
          <g aria-hidden="true">
            {geoData.map((feature, i) => {
              const sigla =
                feature.properties?.sigla ??
                feature.properties?.abbrev ??
                feature.properties?.uf ??
                ""
              const geom = feature.geometry
              if (!geom || (geom.type !== "MultiPolygon" && geom.type !== "Polygon"))
                return null
              const d = geometryToPath(geom as { type: "MultiPolygon" | "Polygon"; coordinates: unknown[] })
              if (!d) return null
              const fill = getFill(String(sigla))
              return (
                <path
                  key={sigla || i}
                  d={d}
                  fill={fill}
                  stroke={colors.white}
                  strokeWidth={0.8}
                  aria-label={`${sigla}: ${registrosPorRegiao[UF_PARA_REGIAO[sigla] ?? ""] ?? 0} compras`}
                />
              )
            })}
          </g>
          {/* Etiqueta de receita só quando uma região está selecionada */}
          {regioes.length > 0 &&
            regiaoFiltro &&
            regioes
              .filter((r) => r.regiao === regiaoFiltro)
              .map((r) => {
                const pos = REGIAO_POSICOES[r.regiao]
                if (!pos) return null
                const [x, y] = pos
                const receita = receitaPorRegiao[r.regiao] ?? 0
                return (
                  <g key={r.regiao} style={{ pointerEvents: "none", userSelect: "none" }}>
                    <text x={x} y={y} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fff" stroke="#fff" strokeWidth={3}>
                      {r.regiao}: {formatReceita(receita)}
                    </text>
                    <text x={x} y={y} textAnchor="middle" fontSize={14} fontWeight={700} fill={colors.textPrimary}>
                      {r.regiao}: {formatReceita(receita)}
                    </text>
                  </g>
                )
              })}
        </svg>
      </S.MapWrapper>
      <S.Legend>
        <span>Compras por região:</span>
        {regioes.length > 0 &&
          regioes.map((r) => (
            <S.LegendItem key={r.regiao}>
              <S.LegendColor $color={getCorPorReceita(r.receita, maxReceita)} />
              {r.regiao}: {new Intl.NumberFormat("pt-BR").format(r.registros)} compras
            </S.LegendItem>
          ))}
      </S.Legend>
    </S.GeoCard>
  )
}
