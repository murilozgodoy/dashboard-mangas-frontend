import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import * as GeoS from "@/components/geografia/styled"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts"
import { colors } from "@/theme/colors"
import {
  fetchPeriods,
  fetchTimeseriesRevenue,
  fetchTopCanais,
  fetchPrecoMedioPeriodo,
  fetchPolpaLogisticaDesconto,
  fetchExtratoConcentracao,
  fetchExtratoTipoSolvente,
  fetchExtratoCertificacao,
  fetchReceitaQuantidadePeriodo,
  fetchNpsPorCanal,
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

const PIE_COLORS = [colors.green, colors.amber, colors.greenMedium, colors.amberMedium, colors.greenLight, colors.amberLight, colors.greenPale]

export function AnaliseAvancada() {
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [timeseries, setTimeseries] = useState<{ periodo: string; receita: number }[]>([])
  const [topCanais, setTopCanais] = useState<{ canal: string; receita: number }[]>([])
  const [precoMedio, setPrecoMedio] = useState<{ periodo: string; preco_medio: number }[]>([])
  const [logisticaDesconto, setLogisticaDesconto] = useState<{ periodo: string; logistica_total: number; desconto_total: number }[]>([])
  const [concentracao, setConcentracao] = useState<{ periodo: string; concentracao_media: number }[]>([])
  const [tipoSolvente, setTipoSolvente] = useState<{ tipo_solvente: string; receita: number }[]>([])
  const [certificacao, setCertificacao] = useState<{ certificacao: string; receita: number }[]>([])
  const [receitaQtd, setReceitaQtd] = useState<{ periodo: string; receita: number; quantidade: number }[]>([])
  const [npsCanal, setNpsCanal] = useState<{ canal: string; nps_medio: number; receita: number; registros: number }[]>([])
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
      setTopCanais([])
      setPrecoMedio([])
      setLogisticaDesconto([])
      setConcentracao([])
      setTipoSolvente([])
      setCertificacao([])
      setReceitaQtd([])
      setNpsCanal([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [
          tsRes,
          canaisRes,
          precoRes,
          recQtdRes,
          npsRes,
        ] = await Promise.all([
          fetchTimeseriesRevenue(tipo, fromComp, toComp),
          fetchTopCanais(tipo, fromComp, toComp, 6),
          fetchPrecoMedioPeriodo(tipo, fromComp, toComp),
          fetchReceitaQuantidadePeriodo(tipo, fromComp, toComp),
          fetchNpsPorCanal(tipo, fromComp, toComp, 6),
        ])
        if (cancelled) return
        setTimeseries(tsRes.map((d) => ({ periodo: d.periodo, receita: d.receita })))
        setTopCanais(canaisRes)
        setPrecoMedio(precoRes.map((d) => ({ periodo: d.periodo, preco_medio: d.preco_medio })))
        setReceitaQtd(recQtdRes)
        setNpsCanal(npsRes)

        if (tipo === "polpa") {
          const ld = await fetchPolpaLogisticaDesconto(fromComp, toComp)
          if (!cancelled) setLogisticaDesconto(ld)
          setConcentracao([])
          setTipoSolvente([])
          setCertificacao([])
        } else {
          const [conc, solv, cert] = await Promise.all([
            fetchExtratoConcentracao(fromComp, toComp),
            fetchExtratoTipoSolvente(fromComp, toComp, 8),
            fetchExtratoCertificacao(fromComp, toComp, 8),
          ])
          if (!cancelled) {
            setConcentracao(conc.map((d) => ({ periodo: d.periodo, concentracao_media: d.concentracao_media })))
            setTipoSolvente(solv)
            setCertificacao(cert)
          }
          setLogisticaDesconto([])
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

  const pieCanaisData = topCanais.map((c) => ({ name: (c.canal || "(sem canal)").slice(0, 15), value: c.receita }))
  const totalReceitaPie = pieCanaisData.reduce((s, d) => s + d.value, 0)

  const radarData = (() => {
    if (!npsCanal.length) return { rows: [] as { subject: string; fullMark: number; [k: string]: number | string }[], names: [] as string[] }
    const canais = npsCanal.slice(0, 5)
    const maxReceita = Math.max(...canais.map((c) => c.receita), 1)
    const maxReg = Math.max(...canais.map((c) => c.registros), 1)
    const rows = [
      { subject: "Receita", fullMark: 100, ...Object.fromEntries(canais.map((c, i) => [`c${i}`, Math.round((c.receita / maxReceita) * 100)])) },
      { subject: "Registros", fullMark: 100, ...Object.fromEntries(canais.map((c, i) => [`c${i}`, Math.round((c.registros / maxReg) * 100)])) },
      { subject: "NPS", fullMark: 100, ...Object.fromEntries(canais.map((c, i) => [`c${i}`, Math.round((c.nps_medio / 10) * 100)])) },
    ]
    return { rows, names: canais.map((c) => (c.canal || "").slice(0, 12)) }
  })()

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Análise avançada</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Gráficos variados: Pizza, Área, Composto, Radar. Preço médio, logística, desconto (polpa), concentração, tipo solvente e certificação (extrato).
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "1.5rem" }}>
              {/* Pie: Receita por canal */}
              <S.ChartCard>
                <S.ChartTitle>Receita por canal (Pizza)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && pieCanaisData.length > 0 && (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieCanaisData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieCanaisData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && !pieCanaisData.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
              </S.ChartCard>

              {/* Area: Receita no tempo */}
              <S.ChartCard>
                <S.ChartTitle>Receita no tempo (Área)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && timeseries.length > 0 && (
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={timeseries} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <defs>
                        <linearGradient id="areaReceita" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={colors.green} stopOpacity={0.4} />
                          <stop offset="100%" stopColor={colors.green} stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                      <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} width={64} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} labelFormatter={formatPeriodo} />
                      <Area type="monotone" dataKey="receita" stroke={colors.green} strokeWidth={2} fill="url(#areaReceita)" name="Receita" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && !timeseries.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
              </S.ChartCard>

              {/* Composed: Receita + Quantidade (eixo duplo) */}
              <S.ChartCard>
                <S.ChartTitle>Receita e quantidade no tempo (Composto)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && receitaQtd.length > 0 && (
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={receitaQtd} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                      <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="left" tickFormatter={(v) => formatCurrency(v)} width={64} tick={{ fontSize: 11 }} />
                      <YAxis yAxisId="right" orientation="right" tickFormatter={formatNumber} width={48} tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(v: number, name: string) => [name === "receita" ? formatCurrency(v) : formatNumber(v), name === "receita" ? "Receita" : "Quantidade"]}
                        labelFormatter={formatPeriodo}
                      />
                      <Bar yAxisId="right" dataKey="quantidade" fill={colors.amberPale} radius={[4, 4, 0, 0]} name="Quantidade" />
                      <Line yAxisId="left" type="monotone" dataKey="receita" stroke={colors.green} strokeWidth={2} dot={{ r: 3 }} name="Receita" />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && !receitaQtd.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
              </S.ChartCard>

              {/* Line: Preço médio */}
              <S.ChartCard>
                <S.ChartTitle>Preço unitário médio no tempo</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && precoMedio.length > 0 && (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={precoMedio} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                      <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 11 }} />
                      <YAxis tickFormatter={(v) => formatCurrency(v)} width={64} tick={{ fontSize: 11 }} />
                      <Tooltip formatter={(v: number) => [formatCurrency(v), "Preço médio"]} labelFormatter={formatPeriodo} />
                      <Line type="monotone" dataKey="preco_medio" stroke={colors.amber} strokeWidth={2} dot={{ fill: colors.amber }} name="Preço médio" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && !precoMedio.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
              </S.ChartCard>

              {/* Polpa: Logística e Desconto (stacked bar) */}
              {tipo === "polpa" && (
                <S.ChartCard>
                  <S.ChartTitle>Logística e desconto por período (Polpa)</S.ChartTitle>
                  {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                  {!loadingData && logisticaDesconto.length > 0 && (
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={logisticaDesconto} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} vertical={false} />
                        <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => formatCurrency(v)} width={64} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number, name: string) => [formatCurrency(v), name === "logistica_total" ? "Logística" : "Desconto"]} labelFormatter={formatPeriodo} />
                        <Bar dataKey="logistica_total" stackId="a" fill={colors.gray} name="Logística" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="desconto_total" stackId="a" fill={colors.amber} name="Desconto" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                  {!loadingData && !logisticaDesconto.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
                </S.ChartCard>
              )}

              {/* Extrato: Concentração */}
              {tipo === "extrato" && (
                <S.ChartCard>
                  <S.ChartTitle>Concentração ativa média (%) por período</S.ChartTitle>
                  {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                  {!loadingData && concentracao.length > 0 && (
                    <ResponsiveContainer width="100%" height={280}>
                      <AreaChart data={concentracao} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                        <defs>
                          <linearGradient id="areaConc" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors.amber} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={colors.amber} stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={colors.grayPale} />
                        <XAxis dataKey="periodo" tickFormatter={formatPeriodo} tick={{ fontSize: 11 }} />
                        <YAxis tickFormatter={(v) => `${formatNumber(v)}%`} width={48} tick={{ fontSize: 11 }} />
                        <Tooltip formatter={(v: number) => [`${formatNumber(v)}%`, "Concentração"]} labelFormatter={formatPeriodo} />
                        <Area type="monotone" dataKey="concentracao_media" stroke={colors.amber} strokeWidth={2} fill="url(#areaConc)" name="Concentração %" />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                  {!loadingData && !concentracao.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
                </S.ChartCard>
              )}

              {/* Extrato: Pie tipo solvente */}
              {tipo === "extrato" && (
                <S.ChartCard>
                  <S.ChartTitle>Receita por tipo de solvente (Pizza)</S.ChartTitle>
                  {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                  {!loadingData && tipoSolvente.length > 0 && (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={tipoSolvente.map((s) => ({ name: String(s.tipo_solvente).slice(0, 12), value: s.receita }))}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={2}
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {tipoSolvente.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {!loadingData && !tipoSolvente.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
                </S.ChartCard>
              )}

              {/* Extrato: Pie certificação */}
              {tipo === "extrato" && (
                <S.ChartCard>
                  <S.ChartTitle>Receita por certificação exigida (Pizza)</S.ChartTitle>
                  {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                  {!loadingData && certificacao.length > 0 && (
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={certificacao.map((c) => ({ name: String(c.certificacao).slice(0, 12), value: c.receita }))}
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
                        <Tooltip formatter={(v: number) => [formatCurrency(v), "Receita"]} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                  {!loadingData && !certificacao.length && <S.ChartPlaceholder>Sem dados.</S.ChartPlaceholder>}
                </S.ChartCard>
              )}

              {/* Radar: um polígono por canal (Receita, Registros, NPS normalizados) */}
              <S.ChartCard>
                <S.ChartTitle>Radar: canais (Receita, Registros, NPS em 0–100)</S.ChartTitle>
                {loadingData && <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>}
                {!loadingData && radarData.rows?.length > 0 && radarData.names?.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData.rows}>
                      <PolarGrid stroke={colors.grayPale} />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                      {radarData.names.map((nome, i) => (
                        <Radar
                          key={i}
                          name={nome}
                          dataKey={`c${i}`}
                          stroke={PIE_COLORS[i % PIE_COLORS.length]}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          fillOpacity={0.2}
                          strokeWidth={2}
                        />
                      ))}
                      <Legend />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
                {!loadingData && (!radarData.rows?.length || !radarData.names?.length) && <S.ChartPlaceholder>Sem dados de NPS por canal.</S.ChartPlaceholder>}
              </S.ChartCard>
            </div>
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
