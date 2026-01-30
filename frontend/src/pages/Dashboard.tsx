import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import { KpiCard } from "@/components/home/KpiCard"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import { ChartReceita } from "@/components/dashboard/ChartReceita"
import { ChartTopCanais } from "@/components/dashboard/ChartTopCanais"
import { ChartTopRegioes } from "@/components/dashboard/ChartTopRegioes"
import {
  fetchMetrics,
  fetchPeriods,
  fetchTimeseriesRevenue,
  fetchTopCanais,
  fetchTopRegioes,
  type Metrics,
  type TimeseriesPoint,
  type TopCanal,
  type TopRegiao,
} from "@/services/api"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

type TipoDashboard = "polpa" | "extrato"
type ViewMode = "overview" | "receita" | "canais" | "regioes"

export function Dashboard() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [tipo, setTipo] = useState<TipoDashboard>("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([])
  const [topCanais, setTopCanais] = useState<TopCanal[]>([])
  const [topRegioes, setTopRegioes] = useState<TopRegiao[]>([])
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
      setMetrics(null)
      setTimeseries([])
      setTopCanais([])
      setTopRegioes([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [metricsRes, tsRes, canaisRes, regioesRes] = await Promise.all([
          fetchMetrics(tipo, fromComp, toComp),
          fetchTimeseriesRevenue(tipo, fromComp, toComp),
          fetchTopCanais(tipo, fromComp, toComp, 10),
          fetchTopRegioes(tipo, fromComp, toComp, 10),
        ])
        if (cancelled) return
        setMetrics(metricsRes)
        setTimeseries(tsRes)
        setTopCanais(canaisRes)
        setTopRegioes(regioesRes)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Dashboard</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Gráficos e análises por período. Selecione o tipo (Polpa ou Extrato) e o intervalo de meses.
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>Tipo:</S.FilterLabel>
            <S.Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoDashboard)}
              aria-label="Selecionar tipo"
            >
              <option value="polpa">Polpa congelada</option>
              <option value="extrato">Extrato de manga</option>
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

        {error && <S.ChartPlaceholder style={{ color: "#b91c1c" }}>{error}</S.ChartPlaceholder>}

        {!error && loadingPeriods && (
          <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>
        )}

        {!error && !loadingPeriods && (
          <>
            <S.Tabs aria-label="Tipo de visualização">
              <S.Tab $active={viewMode === "overview"} onClick={() => setViewMode("overview")}>
                Visão geral
              </S.Tab>
              <S.Tab $active={viewMode === "receita"} onClick={() => setViewMode("receita")}>
                Receita no tempo
              </S.Tab>
              <S.Tab $active={viewMode === "canais"} onClick={() => setViewMode("canais")}>
                Top Canais
              </S.Tab>
              <S.Tab $active={viewMode === "regioes"} onClick={() => setViewMode("regioes")}>
                Top Regiões
              </S.Tab>
            </S.Tabs>

            {metrics && (viewMode === "overview" || viewMode === "receita") && (
              <S.DashboardGrid style={{ marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                  <KpiCard
                    label="Receita total (período)"
                    value={formatCurrency(metrics.receita_total)}
                    accent="green"
                  />
                  <KpiCard label="Registros" value={formatNumber(metrics.registros)} accent="amber" />
                  <KpiCard
                    label={tipo === "polpa" ? "Quantidade (kg)" : "Quantidade (L)"}
                    value={formatNumber(
                      tipo === "polpa"
                        ? (metrics.quantidade_kg ?? 0)
                        : (metrics.quantidade_litros ?? 0)
                    )}
                    accent="green"
                  />
                </div>
              </S.DashboardGrid>
            )}

            <S.DashboardGrid>
              {(viewMode === "overview" || viewMode === "receita") && (
                <ChartReceita data={timeseries} loading={loadingData} tipo={tipo} />
              )}
              {viewMode === "overview" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
                  <ChartTopCanais data={topCanais} loading={loadingData} />
                  <ChartTopRegioes data={topRegioes} loading={loadingData} />
                </div>
              )}
              {viewMode === "canais" && <ChartTopCanais data={topCanais} loading={loadingData} />}
              {viewMode === "regioes" && <ChartTopRegioes data={topRegioes} loading={loadingData} />}
            </S.DashboardGrid>
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
