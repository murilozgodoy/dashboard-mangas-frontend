import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
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
  fetchIndicesPorPeriodo,
  fetchExtratoConcentracao,
  fetchExtratoTipoSolvente,
  fetchExtratoCertificacao,
  fetchReceitaQuantidadePeriodo,
  fetchPrecoMedioPeriodo,
  type IndicesPeriodoPoint,
  type ExtratoConcentracaoPoint,
  type TipoSolventeItem,
  type CertificacaoItem,
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

const PIE_COLORS = [colors.green, colors.amber, colors.greenMedium, colors.amberMedium, colors.greenLight, colors.amberLight]

export function Extrato() {
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [indices, setIndices] = useState<IndicesPeriodoPoint[]>([])
  const [concentracao, setConcentracao] = useState<ExtratoConcentracaoPoint[]>([])
  const [tipoSolvente, setTipoSolvente] = useState<TipoSolventeItem[]>([])
  const [certificacao, setCertificacao] = useState<CertificacaoItem[]>([])
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
        const list = await fetchPeriods("extrato")
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
      setConcentracao([])
      setTipoSolvente([])
      setCertificacao([])
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
        const [idx, conc, solvente, cert, recQtd, preco] = await Promise.all([
          fetchIndicesPorPeriodo("extrato", fromComp, toComp),
          fetchExtratoConcentracao(fromComp, toComp),
          fetchExtratoTipoSolvente(fromComp, toComp),
          fetchExtratoCertificacao(fromComp, toComp),
          fetchReceitaQuantidadePeriodo("extrato", fromComp, toComp),
          fetchPrecoMedioPeriodo("extrato", fromComp, toComp),
        ])
        if (!cancelled) {
          setIndices(idx)
          setConcentracao(conc)
          setTipoSolvente(solvente)
          setCertificacao(cert)
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
        <LayoutS.PageTitle>Extrato de manga</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Indicadores específicos do extrato: concentração ativa, tipo de solvente, índice de cor, índice de pureza, certificação e receita por quantidade (L).
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>De (mês):</S.FilterLabel>
            <S.Select value={fromComp} onChange={(e) => setFromComp(e.target.value)} aria-label="Competência inicial">
              <option value="">—</option>
              {periods.map((p) => (<option key={p} value={p}>{p}</option>))}
            </S.Select>
          </S.FilterGroup>
          <S.FilterGroup>
            <S.FilterLabel>Até (mês):</S.FilterLabel>
            <S.Select value={toComp} onChange={(e) => setToComp(e.target.value)} aria-label="Competência final">
              <option value="">—</option>
              {periods.map((p) => (<option key={p} value={p}>{p}</option>))}
            </S.Select>
          </S.FilterGroup>
        </S.FiltersRow>

        {error && <S.ErrorBanner role="alert">{error}</S.ErrorBanner>}
        {loadingPeriods && <S.ChartPlaceholder>Carregando períodos…</S.ChartPlaceholder>}

        {!error && !loadingPeriods && (
          <S.DashboardGrid>
            {/* Concentração ativa (%) */}
            <S.ChartCard>
              <S.ChartTitle>Concentração ativa (%) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && concentracao.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && concentracao.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={concentracao} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: colors.textMuted }} width={56} />
                    <Tooltip formatter={(v: number) => [`${formatNumber(v)}%`, "Concentração"]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Line type="monotone" dataKey="concentracao_media" name="Concentração ativa (%)" stroke={colors.green} strokeWidth={2} dot={{ fill: colors.green }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Índice de cor e pureza (extrato) */}
            <S.ChartCard>
              <S.ChartTitle>Índice de cor e pureza (1-10) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && indices.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && indices.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={indices} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12, fill: colors.textMuted }} width={32} />
                    <Tooltip formatter={(v: number) => [formatNumber(v), ""]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Legend />
                    <Line type="monotone" dataKey="cor_media" name="Índice cor" stroke={colors.green} strokeWidth={2} dot={{ fill: colors.green }} />
                    <Line type="monotone" dataKey="pureza_media" name="Índice pureza" stroke={colors.amber} strokeWidth={2} dot={{ fill: colors.amber }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Tipo de solvente (barra) */}
            <S.ChartCard>
              <S.ChartTitle>Receita por tipo de solvente</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && tipoSolvente.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && tipoSolvente.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tipoSolvente} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis type="category" dataKey="tipo_solvente" width={120} tick={{ fontSize: 12, fill: colors.textSecondary }} axisLine={{ stroke: colors.grayPale }} tickLine={false} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Bar dataKey="receita" fill={colors.green} radius={[0, 4, 4, 0]} name="Receita" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Certificação (pizza) */}
            <S.ChartCard>
              <S.ChartTitle>Receita por certificação</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && certificacao.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && certificacao.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={certificacao.map((c) => ({ name: c.certificacao, value: c.receita }))}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {certificacao.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Receita e quantidade (L) */}
            <S.ChartCard>
              <S.ChartTitle>Receita e quantidade (L) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && receitaQtd.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && receitaQtd.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <ComposedChart data={receitaQtd} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis yAxisId="left" tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} width={72} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} tick={{ fontSize: 12, fill: colors.textMuted }} width={56} />
                    <Tooltip formatter={(value: number, name: string) => [name === "Receita" ? formatCurrency(value) : formatNumber(value), name]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="receita" name="Receita" fill={colors.green} radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="quantidade" name="Quantidade (L)" stroke={colors.amber} strokeWidth={2} dot={{ fill: colors.amber }} />
                  </ComposedChart>
                </ResponsiveContainer>
              )}
            </S.ChartCard>

            {/* Preço médio (extrato: BRL/L) */}
            <S.ChartCard>
              <S.ChartTitle>Preço médio (R$/L) por período</S.ChartTitle>
              {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
              {!loadingData && precoMedio.length === 0 && <S.ChartPlaceholder>Nenhum dado no período.</S.ChartPlaceholder>}
              {!loadingData && precoMedio.length > 0 && (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={precoMedio} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                    <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 12, fill: colors.textMuted }} />
                    <YAxis tickFormatter={(v) => formatCurrency(v)} tick={{ fontSize: 12, fill: colors.textMuted }} width={72} />
                    <Tooltip formatter={(v: number) => [formatCurrency(v), "Preço médio"]} labelFormatter={formatPeriodo} contentStyle={{ borderRadius: 8, border: `1px solid ${colors.grayPale}` }} />
                    <Line type="monotone" dataKey="preco_medio" name="Preço médio (R$/L)" stroke={colors.green} strokeWidth={2} dot={{ fill: colors.green }} />
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
