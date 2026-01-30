import { useState, useEffect } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/dashboard/styled"
import * as GeoS from "@/components/geografia/styled"
import { BrazilMap } from "@/components/geografia/BrazilMap"
import { KpiCard } from "@/components/home/KpiCard"
import { PeriodSelector } from "@/components/home/PeriodSelector"
import {
  fetchPeriods,
  fetchGeografiaRegioes,
  fetchTopRegioes,
  type RegiaoGeografia,
  type TopRegiao,
} from "@/services/api"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
const formatNumber = (v: number) => new Intl.NumberFormat("pt-BR").format(v)

type TipoGeo = "polpa" | "extrato"

export function Geografia() {
  const [tipo, setTipo] = useState<TipoGeo>("polpa")
  const [periods, setPeriods] = useState<string[]>([])
  const [fromComp, setFromComp] = useState("")
  const [toComp, setToComp] = useState("")
  const [regioes, setRegioes] = useState<RegiaoGeografia[]>([])
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
      setRegioes([])
      setTopRegioes([])
      setLoadingData(false)
      return
    }
    let cancelled = false
    setLoadingData(true)
    setError(null)
    const load = async () => {
      try {
        const [geoRes, topRes] = await Promise.all([
          fetchGeografiaRegioes(tipo, fromComp, toComp),
          fetchTopRegioes(tipo, fromComp, toComp, 15),
        ])
        if (cancelled) return
        setRegioes(geoRes)
        setTopRegioes(topRes)
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

  const receitaTotal = regioes.reduce((s, r) => s + r.receita, 0)
  const registrosTotal = regioes.reduce((s, r) => s + r.registros, 0)

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Geografia</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Mapa do Brasil por macro região e indicadores de localização. Selecione o tipo e o período.
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.FiltersRow>
          <S.FilterGroup>
            <S.FilterLabel>Tipo:</S.FilterLabel>
            <S.Select
              value={tipo}
              onChange={(e) => setTipo(e.target.value as TipoGeo)}
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
            {regioes.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
                <KpiCard
                  label="Receita total (período)"
                  value={formatCurrency(receitaTotal)}
                  accent="green"
                />
                <KpiCard label="Registros (todas as regiões)" value={formatNumber(registrosTotal)} accent="amber" />
              </div>
            )}

            <div style={{ marginBottom: "1.5rem" }}>
              <BrazilMap regioes={regioes} loading={loadingData} />
            </div>

            {regioes.length > 0 && (
              <GeoS.GeoCard style={{ marginBottom: "1.5rem" }}>
                <GeoS.GeoTitle>Receita e registros por macro região</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Região</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                        <th style={{ textAlign: "right" }}>Registros</th>
                        {tipo === "polpa" && (
                          <th style={{ textAlign: "right" }}>Quantidade (kg)</th>
                        )}
                        {tipo === "extrato" && (
                          <th style={{ textAlign: "right" }}>Quantidade (L)</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {regioes.map((r) => (
                        <tr key={r.regiao}>
                          <td>{r.regiao}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(r.receita)}</td>
                          <td style={{ textAlign: "right" }}>{formatNumber(r.registros)}</td>
                          {tipo === "polpa" && (
                            <td style={{ textAlign: "right" }}>
                              {formatNumber(r.quantidade_kg ?? 0)}
                            </td>
                          )}
                          {tipo === "extrato" && (
                            <td style={{ textAlign: "right" }}>
                              {formatNumber(r.quantidade_litros ?? 0)}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </GeoS.GeoTable>
                </GeoS.TableWrapper>
              </GeoS.GeoCard>
            )}

            {topRegioes.length > 0 && (
              <GeoS.GeoCard>
                <GeoS.GeoTitle>Top destinos (região de destino no período)</GeoS.GeoTitle>
                <GeoS.TableWrapper>
                  <GeoS.GeoTable>
                    <thead>
                      <tr>
                        <th>Região / Estado</th>
                        <th style={{ textAlign: "right" }}>Receita</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topRegioes.map((r, i) => (
                        <tr key={r.regiao + String(i)}>
                          <td>{r.regiao || "(não informado)"}</td>
                          <td style={{ textAlign: "right" }}>{formatCurrency(r.receita)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </GeoS.GeoTable>
                </GeoS.TableWrapper>
              </GeoS.GeoCard>
            )}

            {!loadingData && regioes.length === 0 && topRegioes.length === 0 && fromComp && toComp && (
              <S.ChartPlaceholder>Nenhum dado de geografia no período selecionado.</S.ChartPlaceholder>
            )}
          </>
        )}
      </LayoutS.PageContent>
    </>
  )
}
