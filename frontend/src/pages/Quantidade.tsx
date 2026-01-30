import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import * as GeoS from "@/components/geografia/styled"
import { KpiCard } from "@/components/home/KpiCard"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { colors } from "@/theme/colors"
import { fetchPeriods, fetchTimeseriesRevenue, type TimeseriesPoint } from "@/services/api"

const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

function formatPeriodo(periodo: string) {
  const [y, m] = String(periodo).split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const mes = meses[parseInt(m, 10) - 1] ?? m
  return `${mes}/${y?.slice(2) ?? ""}`
}

export function Quantidade() {
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([])
  const [loadingPeriods, setLoadingPeriods] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingPeriods(true)
    setError(null)
    const load = async () => {
      try {
        const list = await fetchPeriods(tipo)
        if (!cancelled) {
          setPeriods(list)
          if (list.length > 0) {
            const sorted = [...list].sort()
            setFromComp((prev) => (sorted.includes(prev) ? prev : sorted[0]))
            setToComp((prev) => (sorted.includes(prev) ? prev : sorted[sorted.length - 1]))
          } else {
            setFromComp("")
            setToComp("")
          }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar períodos.")
      } finally {
        if (!cancelled) setLoadingPeriods(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo])

  useEffect(() => {
    if (!fromComp && !toComp) {
      setTimeseries([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const data = await fetchTimeseriesRevenue(tipo, fromComp, toComp)
        if (!cancelled) setTimeseries(data)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar quantidade.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  const totalKg = timeseries.reduce((s, d) => s + (d.quantidade_kg ?? 0), 0)
  const totalLitros = timeseries.reduce((s, d) => s + (d.quantidade_litros ?? 0), 0)
  const dataKey = tipo === "polpa" ? "quantidade_kg" : "quantidade_litros"
  const unidade = tipo === "polpa" ? "kg" : "L"

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Quantidade</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Quantidade vendida por período: polpa (kg) ou extrato (litros).
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>Tipo:</S.FilterLabel>
            <S.Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as "polpa" | "extrato")}
              aria-label="Selecionar tipo"
            >
              <option value="polpa">Polpa congelada (kg)</option>
              <option value="extrato">Extrato de manga (L)</option>
            </S.Select>
          </S.FilterGroup>
          <PeriodSelector
            periods={periods}
            fromComp={fromComp}
            toComp={toComp}
            onFromChange={setFromComp}
            onToChange={setToComp}
          />
        </S.FiltersRow>

        {error && (
          <GeoS.GeoCard style={{ marginBottom: "1rem", borderColor: "#fecaca", background: "#fef2f2" }}>
            {error}
          </GeoS.GeoCard>
        )}

        {!error && loadingPeriods && <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>}

        {!error && !loadingPeriods && (
          <>
            {timeseries.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label={tipo === "polpa" ? "Total (kg) no período" : "Total (L) no período"}
                  value={formatNumber(tipo === "polpa" ? totalKg : totalLitros)}
                  accent="green"
                />
              </div>
            )}

            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>Quantidade por período ({unidade})</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && timeseries.length > 0 && (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={timeseries} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis
                      dataKey="periodo"
                      tickFormatter={formatPeriodo}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatNumber(v)}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                      width={56}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), `Quantidade (${unidade})`]}
                      labelFormatter={(label) => formatPeriodo(String(label))}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={dataKey}
                      name={`Quantidade (${unidade})`}
                      stroke={colors.green}
                      strokeWidth={2}
                      dot={{ fill: colors.green }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {!loadingData && !timeseries.length && (
                <S.ChartPlaceholder>Nenhum dado de quantidade no período selecionado.</S.ChartPlaceholder>
              )}
            </S.ChartCard>
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
