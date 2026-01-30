import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import * as GeoS from "@/components/geografia/styled"
import { KpiCard } from "@/components/home/KpiCard"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import { ChartReceita } from "@/components/dashboard/ChartReceita"
import { ResponsiveContainer, BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriodsTodos,
  fetchPeriods,
  fetchFinanceiroResumo,
  fetchFinanceiroReceitaPorPeriodo,
  fetchTimeseriesRevenue,
  type FinanceiroResumo,
  type FinanceiroPeriodoPoint,
  type TimeseriesPoint,
} from "@/services/api"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

function formatPeriodo(periodo: string) {
  const [y, m] = String(periodo).split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const mes = meses[parseInt(m, 10) - 1] ?? m
  return `${mes}/${y?.slice(2) ?? ""}`
}

type TipoFin = "polpa" | "extrato" | "todos"

export function Financeiro() {
  const [tipo, setTipo] = useState<TipoFin>("todos")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [resumo, setResumo] = useState<FinanceiroResumo | null>(null)
  const [timeseries, setTimeseries] = useState<TimeseriesPoint[]>([])
  const [seriePeriodo, setSeriePeriodo] = useState<FinanceiroPeriodoPoint[]>([])
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
      setResumo(null)
      setTimeseries([])
      setSeriePeriodo([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        if (tipo === "todos") {
          const [resumoRes, serieRes, tsPolpa, tsExtrato] = await Promise.all([
            fetchFinanceiroResumo(tipo, fromComp, toComp),
            fetchFinanceiroReceitaPorPeriodo(tipo, fromComp, toComp),
            fetchTimeseriesRevenue("polpa", fromComp, toComp),
            fetchTimeseriesRevenue("extrato", fromComp, toComp),
          ])
          if (cancelled) return
          setResumo(resumoRes)
          setSeriePeriodo(serieRes)
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
        } else {
          const [resumoRes, serieRes, tsRes] = await Promise.all([
            fetchFinanceiroResumo(tipo, fromComp, toComp),
            fetchFinanceiroReceitaPorPeriodo(tipo, fromComp, toComp),
            fetchTimeseriesRevenue(tipo, fromComp, toComp),
          ])
          if (cancelled) return
          setResumo(resumoRes)
          setSeriePeriodo(serieRes)
          setTimeseries(tsRes)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados financeiros.")
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
        <LayoutS.PageTitle>Financeiro</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Visão financeira: receita total, ticket médio, evolução por período e comparação Polpa vs Extrato.
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>Tipo:</S.FilterLabel>
            <S.Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoFin)}
              aria-label="Selecionar tipo"
            >
              <option value="todos">Polpa + Extrato</option>
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

        {error && (
          <GeoS.GeoCard style={{ marginBottom: "1rem", borderColor: "#fecaca", background: "#fef2f2" }}>
            {error}
          </GeoS.GeoCard>
        )}

        {!error && loadingPeriods && (
          <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>
        )}

        {!error && !loadingPeriods && (
          <>
            {resumo && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label="Receita total (período)"
                  value={formatCurrency(resumo.receita_total)}
                  accent="green"
                />
                <KpiCard label="Registros" value={formatNumber(resumo.registros)} accent="amber" />
                <KpiCard
                  label="Ticket médio"
                  value={formatCurrency(resumo.ticket_medio)}
                  accent="green"
                />
                {tipo === "polpa" && resumo.quantidade_kg != null && (
                  <KpiCard label="Quantidade (kg)" value={formatNumber(resumo.quantidade_kg)} accent="green" />
                )}
                {tipo === "extrato" && resumo.quantidade_litros != null && (
                  <KpiCard label="Quantidade (L)" value={formatNumber(resumo.quantidade_litros)} accent="green" />
                )}
                {tipo === "todos" && (
                  <>
                    {resumo.receita_polpa != null && (
                      <KpiCard label="Receita Polpa" value={formatCurrency(resumo.receita_polpa)} accent="green" />
                    )}
                    {resumo.receita_extrato != null && (
                      <KpiCard label="Receita Extrato" value={formatCurrency(resumo.receita_extrato)} accent="amber" />
                    )}
                  </>
                )}
              </div>
            )}

            {/* Gráfico: Receita por período (mesmo da Visão geral) */}
            <div style={{ marginBottom: "1.5rem" }}>
              <ChartReceita
                data={timeseries}
                loading={loadingData}
                tipo={tipo === "todos" ? "polpa" : tipo}
              />
            </div>

            {/* Gráfico: Polpa vs Extrato (só quando tipo = todos) */}
            {tipo === "todos" && resumo && (resumo.receita_polpa != null || resumo.receita_extrato != null) && (
              <S.ChartCard style={{ marginBottom: "1.5rem" }}>
                <S.ChartTitle>Receita total por tipo (período)</S.ChartTitle>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={[
                      { name: "Polpa congelada", receita: resumo.receita_polpa ?? 0 },
                      { name: "Extrato de manga", receita: resumo.receita_extrato ?? 0 },
                    ]}
                    margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                    />
                    <YAxis
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                      width={72}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatCurrency(value), "Receita"]}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="receita" radius={[4, 4, 0, 0]} name="Receita">
                      <Cell fill={colors.green} />
                      <Cell fill={colors.amber} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </S.ChartCard>
            )}

            {/* Tabela: Receita por competência */}
            {seriePeriodo.length > 0 && (
              <GeoS.GeoCard>
                <GeoS.GeoTitle>Receita por competência</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Período</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                        {tipo === "todos" && (
                          <>
                            <th style={{ textAlign: "right" }}>Polpa</th>
                            <th style={{ textAlign: "right" }}>Extrato</th>
                          </>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {seriePeriodo.map((row) => (
                        <tr key={row.periodo}>
                          <td>{formatPeriodo(row.periodo)}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(row.receita)}</td>
                          {tipo === "todos" && (
                            <>
                              <td style={{ textAlign: "right" }}>
                                {row.receita_polpa != null ? formatCurrency(row.receita_polpa) : "-"}
                              </td>
                              <td style={{ textAlign: "right" }}>
                                {row.receita_extrato != null ? formatCurrency(row.receita_extrato) : "-"}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </GeoS.GeoTable>
                </GeoS.TableWrapper>
              </GeoS.GeoCard>
            )}

            {!loadingData && !resumo && fromComp && toComp && (
              <S.ChartPlaceholder>Nenhum dado financeiro no período selecionado.</S.ChartPlaceholder>
            )}
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
