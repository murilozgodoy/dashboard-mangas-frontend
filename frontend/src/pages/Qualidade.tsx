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
} from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriods,
  fetchNpsPorPeriodo,
  fetchNpsPorCanal,
  type NpsPeriodoPoint,
  type NpsCanalItem,
} from "@/services/api"

const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)
const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

function formatPeriodo(periodo: string) {
  const [y, m] = String(periodo).split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const mes = meses[parseInt(m, 10) - 1] ?? m
  return `${mes}/${y?.slice(2) ?? ""}`
}

export function Qualidade() {
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [npsPeriodo, setNpsPeriodo] = useState<NpsPeriodoPoint[]>([])
  const [npsCanal, setNpsCanal] = useState<NpsCanalItem[]>([])
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
      setNpsPeriodo([])
      setNpsCanal([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [npsP, npsC] = await Promise.all([
          fetchNpsPorPeriodo(tipo, fromComp, toComp),
          fetchNpsPorCanal(tipo, fromComp, toComp, 10),
        ])
        if (cancelled) return
        setNpsPeriodo(npsP)
        setNpsCanal(npsC)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados de qualidade.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  const npsMedioGeral =
    npsPeriodo.length > 0
      ? npsPeriodo.reduce((s, d) => s + d.nps_medio * d.registros, 0) /
        Math.max(1, npsPeriodo.reduce((s, d) => s + d.registros, 0))
      : 0

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Qualidade e NPS</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          NPS médio no tempo e por canal.
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
            {npsPeriodo.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label="NPS médio (período)"
                  value={formatNumber(npsMedioGeral)}
                  sub="0 a 10"
                  accent="green"
                />
                <KpiCard
                  label="Registros com NPS"
                  value={formatNumber(npsPeriodo.reduce((s, d) => s + d.registros, 0))}
                  accent="amber"
                />
              </div>
            )}

            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>NPS médio por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && npsPeriodo.length > 0 && (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={npsPeriodo} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis
                      dataKey="periodo"
                      tickFormatter={formatPeriodo}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                      width={32}
                    />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), "NPS médio"]}
                      labelFormatter={(label) => formatPeriodo(String(label))}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="nps_medio"
                      name="NPS médio"
                      stroke={colors.green}
                      strokeWidth={2}
                      dot={{ fill: colors.green }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {!loadingData && !npsPeriodo.length && (
                <S.ChartPlaceholder>Nenhum dado de NPS no período ou registros sem NPS.</S.ChartPlaceholder>
              )}
            </S.ChartCard>

            <S.ChartCard style={{ marginBottom: "1.5rem" }}>
              <S.ChartTitle>NPS médio por canal (ordenado por receita)</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && npsCanal.length > 0 && (
                <ResponsiveContainer width="100%" height={340}>
                  <BarChart
                    data={npsCanal.map((c) => ({
                      name: (c.canal || "(sem canal)").slice(0, 20),
                      nps_medio: c.nps_medio,
                      receita: c.receita,
                    }))}
                    margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} vertical={false} />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                    />
                    <YAxis
                      domain={[0, 10]}
                      tick={{ fontSize: 12, fill: colors.textMuted }}
                      axisLine={{ stroke: colors.grayPale }}
                      width={32}
                    />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "receita" ? formatCurrency(value) : formatNumber(value),
                        name === "receita" ? "Receita" : "NPS médio",
                      ]}
                      contentStyle={{
                        borderRadius: 8,
                        border: `1px solid ${colors.grayPale}`,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                      }}
                    />
                    <Bar dataKey="nps_medio" fill={colors.green} radius={[4, 4, 0, 0]} name="NPS médio" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {!loadingData && !npsCanal.length && (
                <S.ChartPlaceholder>Nenhum dado de NPS por canal no período.</S.ChartPlaceholder>
              )}
            </S.ChartCard>

            {npsCanal.length > 0 && (
              <GeoS.GeoCard>
                <GeoS.GeoTitle>NPS por canal</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Canal</th>
                        <th style={{ textAlign: "right" }}>NPS médio</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                        <th style={{ textAlign: "right" }}>Registros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {npsCanal.map((c) => (
                        <tr key={c.canal}>
                          <td>{c.canal || "(não informado)"}</td>
                          <td style={{ textAlign: "right" }}>{formatNumber(c.nps_medio)}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(c.receita)}</td>
                          <td style={{ textAlign: "right" }}>{formatNumber(c.registros)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </GeoS.GeoTable>
                </GeoS.TableWrapper>
              </GeoS.GeoCard>
            )}
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
