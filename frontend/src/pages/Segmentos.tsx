import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import * as GeoS from "@/components/geografia/styled"
import { KpiCard } from "@/components/home/KpiCard"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriods,
  fetchSegmentosRanking,
  fetchSegmentosReceitaPorMes,
  type SegmentoRankingItem,
  type SegmentoReceitaPorMesItem,
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

const CORES_SEGMENTOS = [colors.green, colors.amber, colors.greenMedium, colors.amberMedium, colors.greenLight]

export function Segmentos() {
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [ranking, setRanking] = useState<SegmentoRankingItem[]>([])
  const [receitaPorMes, setReceitaPorMes] = useState<SegmentoReceitaPorMesItem[]>([])
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
      setRanking([])
      setReceitaPorMes([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [rankRes, mesRes] = await Promise.all([
          fetchSegmentosRanking(tipo, fromComp, toComp, 15),
          fetchSegmentosReceitaPorMes(tipo, fromComp, toComp, 5),
        ])
        if (cancelled) return
        setRanking(rankRes)
        setReceitaPorMes(mesRes)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados de segmentos.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  const receitaTotalSegmentos = ranking.reduce((s, r) => s + r.receita, 0)
  const topSegmento = ranking[0]

  const seriePorSegmentoData = (() => {
    if (!receitaPorMes.length) return []
    const periodos = new Set<string>()
    receitaPorMes.forEach((s) => s.dados.forEach((d) => periodos.add(d.periodo)))
    const sortedPeriodos = [...periodos].sort()
    return sortedPeriodos.map((periodo) => {
      const point: Record<string, string | number> = { periodo }
      receitaPorMes.forEach((s) => {
        const d = s.dados.find((x) => x.periodo === periodo)
        point[s.segmento] = d?.receita ?? 0
      })
      return point
    })
  })()

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Segmentos de cliente</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Análise por segmento de cliente: ranking por receita, registros e evolução mensal dos principais segmentos.
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

        {!error && loadingPeriods && <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>}

        {!error && !loadingPeriods && (
          <>
            {ranking.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label="Receita total (segmentos no período)"
                  value={formatCurrency(receitaTotalSegmentos)}
                  accent="green"
                />
                {topSegmento && (
                  <KpiCard label="Top segmento" value={String(topSegmento.segmento).slice(0, 20)} accent="amber" />
                )}
                {topSegmento && (
                  <KpiCard
                    label="Receita do top segmento"
                    value={formatCurrency(topSegmento.receita)}
                    accent="green"
                  />
                )}
                <KpiCard label="Segmentos no ranking" value={formatNumber(ranking.length)} accent="amber" />
              </div>
            )}

            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>Ranking de segmentos por receita</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && ranking.length > 0 && (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={ranking.map((r) => ({
                      name: (r.segmento || "(sem segmento)").slice(0, 25),
                      receita: r.receita,
                      registros: r.registros,
                    }))}
                    layout="vertical"
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => formatCurrency(v)}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={160}
                      tick={{ fontSize: 11, fill: colors.textSecondary }}
                      axisLine={{ stroke: colors.grayPale }}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "receita" ? formatCurrency(value) : formatNumber(value),
                        name === "receita" ? "Receita" : "Registros",
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="receita" fill={colors.green} radius={[0, 4, 4, 0]} name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loadingData && !ranking.length && (
                <S.ChartPlaceholder>Nenhum dado no período selecionado.</S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>Receita por mês (top 5 segmentos)</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && seriePorSegmentoData.length > 0 && receitaPorMes.length > 0 && (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={seriePorSegmentoData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis
                      dataKey="periodo"
                      tickFormatter={formatPeriodo}
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
                      labelFormatter={(label) => formatPeriodo(String(label))}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Legend />
                    {receitaPorMes.map((s, i) => (
                      <Line
                        key={s.segmento}
                        type="monotone"
                        dataKey={s.segmento}
                        name={String(s.segmento).slice(0, 20)}
                        stroke={CORES_SEGMENTOS[i % CORES_SEGMENTOS.length]}
                        strokeWidth={2}
                        dot={{ fill: CORES_SEGMENTOS[i % CORES_SEGMENTOS.length] }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
              {!loadingData && (!receitaPorMes.length || !seriePorSegmentoData.length) && ranking.length > 0 && (
                <S.ChartPlaceholder>Nenhuma série por segmento no período.</S.ChartPlaceholder>
              )}
            </S.ChartCard>

            {ranking.length > 0 && (
              <GeoS.GeoCard>
                <GeoS.GeoTitle>Segmentos: receita e registros</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Segmento</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                        <th style={{ textAlign: "right" }}>Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((r) => (
                        <tr key={r.segmento}>
                          <td>{r.segmento || "(não informado)"}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(r.receita)}</td>
                          <td style={{ textAlign: "right" }}>{formatNumber(r.registros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </GeoS.GeoTable>
                </GeoS.TableWrapper>
              </GeoS.GeoCard>
            )}

            {!loadingData && !ranking.length && fromComp && toComp && (
              <S.ChartPlaceholder>Nenhum dado de segmento no período selecionado.</S.ChartPlaceholder>
            )}
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
