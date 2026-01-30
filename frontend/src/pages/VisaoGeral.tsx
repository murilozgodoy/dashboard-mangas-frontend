import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import { KpiCard } from "@/components/home/KpiCard"
import { TipoSelector } from "@/components/home/TipoSelector"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import * as HomeS from "@/components/home/styled"
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts"
import { colors } from "@/theme/colors"
import { ChartReceita } from "@/components/dashboard/ChartReceita"
import { ChartTopCanais } from "@/components/dashboard/ChartTopCanais"
import { ChartTopRegioes } from "@/components/dashboard/ChartTopRegioes"
import {
  fetchMetrics,
  fetchMetricsTodos,
  fetchPeriods,
  fetchPeriodsTodos,
  fetchTimeseriesRevenue,
  fetchTopCanais,
  fetchTopRegioes,
  type Tipo,
  type Metrics,
  type MetricsTodos,
  type TimeseriesPoint,
  type TopCanal,
  type TopRegiao,
} from "@/services/api"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

type MetricsState = (Metrics & { _todos?: false }) | (MetricsTodos & { _todos: true })
type ViewMode = "overview" | "receita" | "canais" | "regioes"

export function VisaoGeral() {
  const [viewMode, setViewMode] = useState<ViewMode>("overview")
  const [tipo, setTipo] = useState<Tipo>("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [metrics, setMetrics] = useState<MetricsState | null>(null)
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
        const list =
          tipo === "todos"
            ? await fetchPeriodsTodos()
            : await fetchPeriods(tipo)
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
        if (tipo === "todos") {
          const [metricsRes, tsPolpa, tsExtrato] = await Promise.all([
            fetchMetricsTodos(fromComp, toComp),
            fetchTimeseriesRevenue("polpa", fromComp, toComp),
            fetchTimeseriesRevenue("extrato", fromComp, toComp),
          ])
          if (cancelled) return
          setMetrics({ ...metricsRes, _todos: true })
          const byPeriod: Record<string, number> = {}
          tsPolpa.forEach((d) => {
            byPeriod[d.periodo] = (byPeriod[d.periodo] ?? 0) + d.receita
          })
          tsExtrato.forEach((d) => {
            byPeriod[d.periodo] = (byPeriod[d.periodo] ?? 0) + d.receita
          })
          const merged: TimeseriesPoint[] = Object.entries(byPeriod)
            .map(([periodo, receita]) => ({ periodo, receita }))
            .sort((a, b) => a.periodo.localeCompare(b.periodo))
          setTimeseries(merged)
          setTopCanais([])
          setTopRegioes([])
        } else {
          const [metricsRes, tsRes, canaisRes, regioesRes] = await Promise.all([
            fetchMetrics(tipo, fromComp, toComp),
            fetchTimeseriesRevenue(tipo, fromComp, toComp),
            fetchTopCanais(tipo, fromComp, toComp, 10),
            fetchTopRegioes(tipo, fromComp, toComp, 10),
          ])
          if (cancelled) return
          setMetrics({ ...metricsRes, _todos: false })
          setTimeseries(tsRes)
          setTopCanais(canaisRes)
          setTopRegioes(regioesRes)
        }
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

  const isTodos = metrics && "_todos" in metrics && metrics._todos
  const tipoChart = tipo === "todos" ? "polpa" : tipo

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Visão geral</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Indicadores principais, receita no tempo e rankings. Selecione o tipo (Polpa, Extrato ou Todos) e o período.
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <HomeS.FiltersRow>
          <TipoSelector value={tipo} onChange={setTipo} />
          <PeriodSelector
            periods={periods}
            fromComp={fromComp}
            toComp={toComp}
            onFromChange={setFromComp}
            onToChange={setToComp}
          />
        </HomeS.FiltersRow>

        {error && (
          <S.ErrorBanner role="alert">{error}</S.ErrorBanner>
        )}

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
                    label="Receita total"
                    value={formatCurrency(metrics.receita_total)}
                    sub={fromComp || toComp ? "Período selecionado" : undefined}
                    accent="green"
                  />
                  <KpiCard label="Registros" value={formatNumber(metrics.registros)} accent="amber" />
                  {isTodos ? (
                    <>
                      <KpiCard
                        label="Quantidade polpa (kg)"
                        value={formatNumber(metrics.quantidade_kg)}
                        accent="green"
                      />
                      <KpiCard
                        label="Quantidade extrato (L)"
                        value={formatNumber(metrics.quantidade_litros)}
                        accent="green"
                      />
                    </>
                  ) : (
                    <KpiCard
                      label={tipo === "polpa" ? "Quantidade (kg)" : "Quantidade (L)"}
                      value={formatNumber(
                        tipo === "polpa"
                          ? (metrics.quantidade_kg ?? 0)
                          : (metrics.quantidade_litros ?? 0)
                      )}
                      accent="green"
                    />
                  )}
                </div>
              </S.DashboardGrid>
            )}

            <S.DashboardGrid>
              {(viewMode === "overview" || viewMode === "receita") && (
                <ChartReceita data={timeseries} loading={loadingData} tipo={tipoChart} />
              )}
              {viewMode === "overview" && tipo !== "todos" && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
                  <ChartTopCanais data={topCanais} loading={loadingData} />
                  <ChartTopRegioes data={topRegioes} loading={loadingData} />
                </div>
              )}
              {viewMode === "overview" && tipo === "todos" && metrics && (metrics.receita_polpa != null || metrics.receita_extrato != null) && (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem" }}>
                  <S.ChartCard>
                    <S.ChartTitle>Receita: Polpa vs Extrato (Pizza)</S.ChartTitle>
                    {(() => {
                      const pieData = [
                        { name: "Polpa", value: metrics.receita_polpa ?? 0 },
                        { name: "Extrato", value: metrics.receita_extrato ?? 0 },
                      ].filter((d) => d.value > 0)
                      if (pieData.length === 0) {
                        return <S.ChartPlaceholder>Nenhum dado de receita no período.</S.ChartPlaceholder>
                      }
                      return (
                        <ResponsiveContainer width="100%" height={260}>
                          <PieChart>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={90}
                              paddingAngle={2}
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill={colors.green} />
                              <Cell fill={colors.amber} />
                            </Pie>
                            <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} />
                          </PieChart>
                        </ResponsiveContainer>
                      )
                    })()}
                  </S.ChartCard>
                  <S.ChartCard>
                    <S.ChartTitle>Top Canais e Regiões</S.ChartTitle>
                    <S.ChartPlaceholder>
                      Selecione Polpa ou Extrato no filtro para ver o ranking de canais e regiões.
                    </S.ChartPlaceholder>
                  </S.ChartCard>
                </div>
              )}
              {viewMode === "canais" && tipo !== "todos" && (
                <ChartTopCanais data={topCanais} loading={loadingData} />
              )}
              {viewMode === "canais" && tipo === "todos" && (
                <S.ChartCard>
                  <S.ChartTitle>Top canais por receita</S.ChartTitle>
                  <S.ChartPlaceholder>
                    Selecione Polpa ou Extrato no filtro para ver o ranking de canais.
                  </S.ChartPlaceholder>
                </S.ChartCard>
              )}
              {viewMode === "regioes" && tipo !== "todos" && (
                <ChartTopRegioes data={topRegioes} loading={loadingData} />
              )}
              {viewMode === "regioes" && tipo === "todos" && (
                <S.ChartCard>
                  <S.ChartTitle>Top regiões por receita</S.ChartTitle>
                  <S.ChartPlaceholder>
                    Selecione Polpa ou Extrato no filtro para ver o ranking de regiões.
                  </S.ChartPlaceholder>
                </S.ChartCard>
              )}
            </S.DashboardGrid>
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
