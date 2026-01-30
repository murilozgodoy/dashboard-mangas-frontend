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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriods,
  fetchCanalRanking,
  fetchCanalReceitaPorMes,
  type CanalRankingItem,
  type CanalReceitaPorMesItem,
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

const CORES_CANAIS = [colors.green, colors.amber, colors.greenMedium, colors.amberMedium, colors.greenLight]
const PIE_COLORS = [colors.green, colors.amber, colors.greenMedium, colors.amberMedium, colors.greenLight, colors.amberLight]

export function Canal() {
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [ranking, setRanking] = useState<CanalRankingItem[]>([])
  const [receitaPorMes, setReceitaPorMes] = useState<CanalReceitaPorMesItem[]>([])
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
          fetchCanalRanking(tipo, fromComp, toComp, 15),
          fetchCanalReceitaPorMes(tipo, fromComp, toComp, 5),
        ])
        if (cancelled) return
        setRanking(rankRes)
        setReceitaPorMes(mesRes)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados de canais.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  const receitaTotalCanais = ranking.reduce((s, r) => s + r.receita, 0)
  const topCanal = ranking[0]

  /** Monta dados para o gráfico de linhas: um ponto por período com uma chave por canal */
  const seriePorCanalData = (() => {
    if (!receitaPorMes.length) return []
    const periodos = new Set<string>()
    receitaPorMes.forEach((c) => c.dados.forEach((d) => periodos.add(d.periodo)))
    const sortedPeriodos = [...periodos].sort()
    return sortedPeriodos.map((periodo) => {
      const point: Record<string, string | number> = { periodo }
      receitaPorMes.forEach((c) => {
        const d = c.dados.find((x) => x.periodo === periodo)
        point[c.canal] = d?.receita ?? 0
      })
      return point
    })
  })()

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Canal</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Análise por canal de venda: ranking por receita, registros e evolução mensal dos principais canais.
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

        {!error && loadingPeriods && (
          <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>
        )}

        {!error && !loadingPeriods && (
          <>
            {ranking.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label="Receita total (canais no período)"
                  value={formatCurrency(receitaTotalCanais)}
                  accent="green"
                />
                {topCanal && (
                  <KpiCard
                    label="Top canal"
                    value={topCanal.canal}
                    accent="amber"
                  />
                )}
                {topCanal && (
                  <KpiCard
                    label="Receita do top canal"
                    value={formatCurrency(topCanal.receita)}
                    accent="green"
                  />
                )}
                <KpiCard label="Canais no ranking" value={formatNumber(ranking.length)} accent="amber" />
              </div>
            )}

            {/* Bar + Pie: Ranking e participação */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
              <S.ChartCard>
                <S.ChartTitle>Ranking de canais por receita (Barras)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && ranking.length > 0 && (
                  <ResponsiveContainer width="100%" height={360}>
                    <BarChart
                    data={ranking.map((r) => ({ name: r.canal || "(sem canal)", receita: r.receita, registros: r.registros }))}
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
                      width={140}
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
              {!loadingData && !ranking.length && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              </S.ChartCard>
              <S.ChartCard>
                <S.ChartTitle>Participação da receita por canal (Pizza)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && ranking.length > 0 && (
                  <ResponsiveContainer width="100%" height={360}>
                    <PieChart>
                      <Pie
                        data={ranking.slice(0, 8).map((r) => ({ name: (r.canal || "(sem canal)").slice(0, 14), value: r.receita }))}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {ranking.slice(0, 8).map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && !ranking.length && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              </S.ChartCard>
            </div>

            {/* Gráfico: Receita por mês (top 5 canais) */}
            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>Receita por mês (top 5 canais)</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && seriePorCanalData.length > 0 && receitaPorMes.length > 0 && (
                <ResponsiveContainer width="100%" height={320}>
                  <LineChart data={seriePorCanalData} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
                    {receitaPorMes.map((c, i) => (
                      <Line
                        key={c.canal}
                        type="monotone"
                        dataKey={c.canal}
                        name={c.canal}
                        stroke={CORES_CANAIS[i % CORES_CANAIS.length]}
                        strokeWidth={2}
                        dot={{ fill: CORES_CANAIS[i % CORES_CANAIS.length] }}
                        activeDot={{ r: 5 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
              {!loadingData && (!receitaPorMes.length || !seriePorCanalData.length) && ranking.length > 0 && (
                <S.ChartPlaceholder>Nenhuma série por canal no período.</S.ChartPlaceholder>
              )}
            </S.ChartCard>

            {/* Tabela: Canal x Receita x Registros */}
            {ranking.length > 0 && (
              <GeoS.GeoCard>
                <GeoS.GeoTitle>Canais: receita e registros</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Canal</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                        <th style={{ textAlign: "right" }}>Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ranking.map((r) => (
                        <tr key={r.canal}>
                          <td>{r.canal || "(não informado)"}</td>
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
              <S.ChartPlaceholder>Nenhum dado de canal no período selecionado.</S.ChartPlaceholder>
            )}
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
