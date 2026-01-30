import { useState, useEffect } from "react"
import {
  fetchMetrics,
  fetchMetricsTodos,
  fetchPeriods,
  fetchPeriodsTodos,
  type Tipo,
  type Metrics,
  type MetricsTodos,
} from "@/services/api"
import { KpiCard } from "@/components/home/KpiCard"
import { TipoSelector } from "@/components/home/TipoSelector"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import * as S from "@/components/home/styled"
import * as LayoutS from "@/components/layout/styled"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

type MetricsState = (Metrics & { _todos?: false }) | (MetricsTodos & { _todos: true })

export function Home() {
  const [tipo, setTipo] = useState<Tipo>("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [metrics, setMetrics] = useState<MetricsState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const load = async () => {
      try {
        const periodList =
          tipo === "todos"
            ? await fetchPeriodsTodos()
            : await fetchPeriods(tipo)
        if (cancelled) return
        setPeriods(periodList)
        if (periodList.length > 0 && !fromComp && !toComp) {
          const sorted = [...periodList].sort()
          setFromComp(sorted[0])
          setToComp(sorted[sorted.length - 1])
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar períodos.")
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const load = async () => {
      try {
        if (tipo === "todos") {
          const data = await fetchMetricsTodos(
            fromComp || undefined,
            toComp || undefined
          )
          if (!cancelled) setMetrics({ ...data, _todos: true })
        } else {
          const data = await fetchMetrics(
            tipo,
            fromComp || undefined,
            toComp || undefined
          )
          if (!cancelled) setMetrics({ ...data, _todos: false })
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Erro ao carregar métricas.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [tipo, fromComp, toComp])

  const isTodos = metrics && "_todos" in metrics && metrics._todos

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Início</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Indicadores principais. Selecione o tipo (Polpa, Extrato ou Todos) e o período (ano inteiro ou meses).
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <TipoSelector value={tipo} onChange={setTipo} />
          <PeriodSelector
          periods={periods}
          fromComp={fromComp}
          toComp={toComp}
          onFromChange={setFromComp}
          onToChange={setToComp}
          />
        </S.FiltersRow>
        {loading && !metrics && (
          <S.LoadingMessage>Carregando indicadores…</S.LoadingMessage>
        )}
        {error && <S.ErrorMessage>{error}</S.ErrorMessage>}
        {!loading && !error && metrics && (
          <S.KpiGrid>
            <KpiCard
              label="Receita total"
              value={formatCurrency(metrics.receita_total)}
              sub={fromComp || toComp ? "Período selecionado" : undefined}
              accent="green"
            />
            <KpiCard
              label="Registros"
              value={formatNumber(metrics.registros)}
              accent="amber"
            />
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
          </S.KpiGrid>
        )}
      </LayoutS.PageContent>
    </>
  )
}
