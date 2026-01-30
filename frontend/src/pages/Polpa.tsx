import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriods,
  fetchIndicesPorPeriodo,
  fetchPolpaLogisticaDesconto,
  fetchReceitaQuantidadePeriodo,
  fetchPrecoMedioPeriodo,
  type IndicesPeriodoPoint,
  type PolpaLogisticaDescontoPoint,
  type ReceitaQuantidadePeriodoPoint,
  type PrecoMedioPeriodoPoint,
} from "@/services/api"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v)

function formatPeriodo(periodo: string) {
  const [y, m] = String(periodo).split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const mes = meses[parseInt(m, 10) - 1] ?? m
  return `${mes}/${y?.slice(2) ?? ""}`
}

export function Polpa() {
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [indices, setIndices] = useState<IndicesPeriodoPoint[]>([])
  const [logisticaDesconto, setLogisticaDesconto] = useState<PolpaLogisticaDescontoPoint[]>([])
  const [receitaQtd, setReceitaQtd] = useState<ReceitaQuantidadePeriodoPoint[]>([])
  const [precoMedio, setPrecoMedio] = useState<PrecoMedioPeriodoPoint[]>([])
  const [loadingPeriods, setLoadingPeriods] = useState(true)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoadingPeriods(true)
    const load = async () => {
      try {
        const list = await fetchPeriods("polpa")
        if (!cancelled) {
          setPeriods(list)
          if (list.length > 0) {
            const sorted = [...list].sort()
            setFromComp((prev) => (sorted.includes(prev) ? prev : sorted[0]))
            setToComp((prev) => (sorted.includes(prev) ? prev : sorted[sorted.length - 1]))
          } else { setFromComp(""); setToComp("") }
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar períodos.")
      } finally {
        if (!cancelled) setLoadingPeriods(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    if (!fromComp && !toComp) {
      setIndices([])
      setLogisticaDesconto([])
      setReceitaQtd([])
      setPrecoMedio([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [idx, logDesc, recQtd, preco] = await Promise.all([
          fetchIndicesPorPeriodo("polpa", fromComp, toComp),
          fetchPolpaLogisticaDesconto(fromComp, toComp),
          fetchReceitaQuantidadePeriodo("polpa", fromComp, toComp),
          fetchPrecoMedioPeriodo("polpa", fromComp, toComp),
        ])
        if (!cancelled) {
          setIndices(idx)
          setLogisticaDesconto(logDesc)
          setReceitaQtd(recQtd)
          setPrecoMedio(preco)
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar dados.")
      } finally {
        if (!cancelled) setLoadingData(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [fromComp, toComp])

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Polpa congelada</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Indicadores específicos da polpa: índice de qualidade, perda de processamento, logística, desconto e receita por quantidade (kg).
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>De (mês):</S.FilterLabel>
            <S.Select
              value={fromComp}
              onChange={(e) => setFromComp(e.target.value)}
              aria-label="Competência inicial"
            >
              <option value="">—</option>
              {periods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.FilterLabel>Até (mês):</S.FilterLabel>
            <S.Select
              value={toComp}
              onChange={(e) => setToComp(e.target.value)}
              aria-label="Competência final"
            >
              <option value="">—</option>
              {periods.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </S.Select>
          </S.FilterGroup>
        </S.FiltersRow>

        {error && <S.ErrorBanner role="alert">{error}</S.ErrorBanner>}
        {loadingPeriods && <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>}

        {!error && !loadingPeriods && (
          <S.DashboardGrid>
            {/* Índice de qualidade e perda (polpa) */}
            <S.ChartCard>
              <S.ChartTitle>Índice de qualidade e perda de processamento</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && indices.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && indices.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={indices} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 12, fill: colors.textMuted }} domain={[0, 10]} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <Tooltip
                      formatter={(value: number, name: string) => [name === "Qualidade (1-10)" ? formatNumber(value) : `${formatNumber(value)}%`, name]}
                      labelFormatter={formatPeriodo}
                      contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="qualidade_media" name="Qualidade (1-10)" stroke={colors.green} strokeWidth={2} dot={{ fill: colors.green }} />
                    <Line yAxisId="right" type="monotone" dataKey="perda_media" name="Perda (%)" stroke={colors.amber} strokeWidth={2} dot={{ fill: colors.amber }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Logística e desconto (polpa) */}
            <S.ChartCard>
              <S.ChartTitle>Logística e desconto por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && logisticaDesconto.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && logisticaDesconto.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={logisticaDesconto} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} width={72} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), ""]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Legend />
                    <Bar dataKey="logistica_total" name="Logística (R$)" fill={colors.green} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="desconto_total" name="Desconto (R$)" fill={colors.amber} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Receita e quantidade (kg) */}
            <S.ChartCard>
              <S.ChartTitle>Receita e quantidade (kg) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && receitaQtd.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && receitaQtd.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={receitaQtd} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis yAxisId="left" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} width={72} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} tick={{ fontSize: 12, fill: colors.textMuted }} width={56} />
                    <Tooltip
                      formatter={(value: number, name: string) => [name === "Receita" ? formatCurrency(value) : formatNumber(value), name]}
                      labelFormatter={formatPeriodo}
                      contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="receita" name="Receita" fill={colors.green} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="quantidade" name="Quantidade (kg)" stroke={colors.amber} strokeWidth={2} dot={{ fill: colors.amber }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Preço médio (polpa: BRL/kg) */}
            <S.ChartCard>
              <S.ChartTitle>Preço médio (R$/kg) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && precoMedio.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && precoMedio.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={precoMedio} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} width={72} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Preço médio"]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Line type="monotone" dataKey="preco_medio" name="Preço médio (R$/kg)" stroke={colors.green} strokeWidth={2} dot={{ fill: colors.green }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>
          </S.DashboardGrid>
        )}
      </LayoutS.PageContent>
    </>
  )
}
