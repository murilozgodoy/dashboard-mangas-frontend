import { config } from "@/config/config"

const BASE = config.apiBaseUrl

export type Tipo = "polpa" | "extrato" | "todos"

export interface Metrics {
  receita_total: number
  registros: number
  quantidade_kg?: number
  quantidade_litros?: number
  from?: string
  to?: string
  tipo: string
}

/** Métricas combinadas quando tipo = "todos" */
export interface MetricsTodos {
  receita_total: number
  registros: number
  quantidade_kg: number
  quantidade_litros: number
  from?: string
  to?: string
}

export interface TimeseriesPoint {
  periodo: string
  receita: number
  quantidade_kg?: number
  quantidade_litros?: number
}

export async function fetchMetrics(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<Metrics> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/metrics?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar métricas")
  return res.json()
}

/** Busca métricas de polpa e extrato e combina (para tipo "todos"). */
export async function fetchMetricsTodos(
  fromComp?: string,
  toComp?: string
): Promise<MetricsTodos> {
  const [polpa, extrato] = await Promise.all([
    fetchMetrics("polpa", fromComp, toComp),
    fetchMetrics("extrato", fromComp, toComp),
  ])
  return {
    receita_total: (polpa.receita_total ?? 0) + (extrato.receita_total ?? 0),
    registros: (polpa.registros ?? 0) + (extrato.registros ?? 0),
    quantidade_kg: polpa.quantidade_kg ?? 0,
    quantidade_litros: extrato.quantidade_litros ?? 0,
    from: fromComp,
    to: toComp,
  }
}

export async function fetchPeriods(tipo: "polpa" | "extrato"): Promise<string[]> {
  const res = await fetch(`${BASE}/api/periods?tipo=${tipo}`)
  if (!res.ok) throw new Error("Erro ao buscar períodos")
  const data = await res.json()
  return data.periodos ?? data.periods ?? []
}

/** Períodos únicos de polpa + extrato (para tipo "todos"). */
export async function fetchPeriodsTodos(): Promise<string[]> {
  const [polpa, extrato] = await Promise.all([
    fetchPeriods("polpa"),
    fetchPeriods("extrato"),
  ])
  const set = new Set([...polpa, ...extrato])
  return [...set].sort()
}

export async function fetchTimeseriesRevenue(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<TimeseriesPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/timeseries/revenue?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar série temporal")
  const data = await res.json()
  return data.dados ?? []
}

export interface TopCanal {
  canal: string
  receita: number
}

export interface TopRegiao {
  regiao: string
  receita: number
}

export async function fetchTopCanais(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limit = 10
): Promise<TopCanal[]> {
  const params = new URLSearchParams({ tipo, limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/top-canais?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar canais")
  const data = await res.json()
  return data.canais ?? []
}

export async function fetchTopRegioes(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limit = 10
): Promise<TopRegiao[]> {
  const params = new URLSearchParams({ tipo, limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/top-regioes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar regiões")
  const data = await res.json()
  return data.regioes ?? []
}

/** Região macro (geografia) com receita e métricas */
export interface RegiaoGeografia {
  regiao: string
  receita: number
  registros: number
  quantidade_kg?: number
  quantidade_litros?: number
}

export async function fetchGeografiaRegioes(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<RegiaoGeografia[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/geografia/regioes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar dados de geografia")
  const data = await res.json()
  return data.regioes ?? []
}

/** Resumo financeiro (período ou tipo polpa/extrato/todos). */
export interface FinanceiroResumo {
  receita_total: number
  registros: number
  ticket_medio: number
  receita_polpa?: number
  receita_extrato?: number
  quantidade_kg?: number
  quantidade_litros?: number
  from?: string
  to?: string
  tipo: string
}

export async function fetchFinanceiroResumo(
  tipo: "polpa" | "extrato" | "todos",
  fromComp?: string,
  toComp?: string
): Promise<FinanceiroResumo> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/financeiro/resumo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar resumo financeiro")
  return res.json()
}

/** Ponto da série: período + receita (e opcionalmente polpa/extrato). */
export interface FinanceiroPeriodoPoint {
  periodo: string
  receita: number
  receita_polpa?: number
  receita_extrato?: number
  quantidade_kg?: number
  quantidade_litros?: number
}

/** Normaliza período para string YYYY-MM (para gráficos). */
function normalizarPeriodo(p: unknown): string {
  if (p == null) return ""
  const s = String(p)
  if (/^\d{4}-\d{2}$/.test(s)) return s
  if (/^\d{6}$/.test(s)) return `${s.slice(0, 4)}-${s.slice(4, 6)}`
  return s
}

export async function fetchFinanceiroReceitaPorPeriodo(
  tipo: "polpa" | "extrato" | "todos",
  fromComp?: string,
  toComp?: string
): Promise<FinanceiroPeriodoPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/financeiro/receita-por-periodo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar receita por período")
  const data = await res.json()
  const raw = data.dados ?? data.data ?? []
  if (!Array.isArray(raw)) return []
  return raw.map((r: Record<string, unknown>) => ({
    periodo: normalizarPeriodo(r.periodo ?? r._id ?? r.competencia),
    receita: Number(r.receita) || 0,
    receita_polpa: r.receita_polpa != null ? Number(r.receita_polpa) : undefined,
    receita_extrato: r.receita_extrato != null ? Number(r.receita_extrato) : undefined,
    quantidade_kg: r.quantidade_kg != null ? Number(r.quantidade_kg) : undefined,
    quantidade_litros: r.quantidade_litros != null ? Number(r.quantidade_litros) : undefined,
  }))
}

/** Canal no ranking (com registros). */
export interface CanalRankingItem {
  canal: string
  receita: number
  registros: number
}

export async function fetchCanalRanking(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limit = 15
): Promise<CanalRankingItem[]> {
  const params = new URLSearchParams({ tipo, limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/canal/ranking?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar ranking de canais")
  const data = await res.json()
  return data.canais ?? []
}

/** Série de receita por mês para um canal. */
export interface CanalReceitaPorMesItem {
  canal: string
  dados: { periodo: string; receita: number }[]
}

export async function fetchCanalReceitaPorMes(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limitCanais = 5
): Promise<CanalReceitaPorMesItem[]> {
  const params = new URLSearchParams({ tipo, limit_canais: String(limitCanais) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/canal/receita-por-mes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar receita por mês por canal")
  const data = await res.json()
  return data.canais ?? []
}

/** Segmento de cliente no ranking. */
export interface SegmentoRankingItem {
  segmento: string
  receita: number
  registros: number
  quantidade_kg?: number
  quantidade_litros?: number
}

export async function fetchSegmentosRanking(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limit = 15
): Promise<SegmentoRankingItem[]> {
  const params = new URLSearchParams({ tipo, limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/segmentos/ranking?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar ranking de segmentos")
  const data = await res.json()
  return data.segmentos ?? []
}

export interface SegmentoReceitaPorMesItem {
  segmento: string
  dados: { periodo: string; receita: number }[]
}

export async function fetchSegmentosReceitaPorMes(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limitSegmentos = 5
): Promise<SegmentoReceitaPorMesItem[]> {
  const params = new URLSearchParams({ tipo, limit_segmentos: String(limitSegmentos) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/segmentos/receita-por-mes?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar receita por mês por segmento")
  const data = await res.json()
  return data.segmentos ?? []
}

/** NPS e qualidade por período. */
export interface NpsPeriodoPoint {
  periodo: string
  nps_medio: number
  registros: number
}

export async function fetchNpsPorPeriodo(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<NpsPeriodoPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/qualidade/nps-por-periodo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar NPS por período")
  const data = await res.json()
  return data.dados ?? []
}

export interface NpsCanalItem {
  canal: string
  nps_medio: number
  receita: number
  registros: number
}

export async function fetchNpsPorCanal(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string,
  limit = 10
): Promise<NpsCanalItem[]> {
  const params = new URLSearchParams({ tipo, limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/qualidade/nps-por-canal?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar NPS por canal")
  const data = await res.json()
  return data.canais ?? []
}

/** Índices de qualidade por período (polpa: qualidade, perda; extrato: cor, pureza). */
export interface IndicesPeriodoPoint {
  periodo: string
  qualidade_media?: number
  perda_media?: number
  cor_media?: number
  pureza_media?: number
  registros: number
}

export async function fetchIndicesPorPeriodo(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<IndicesPeriodoPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/qualidade/indices-por-periodo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar índices por período")
  const data = await res.json()
  return data.dados ?? []
}

/** Análise avançada */
export interface PrecoMedioPeriodoPoint {
  periodo: string
  preco_medio: number
  registros: number
}

export async function fetchPrecoMedioPeriodo(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<PrecoMedioPeriodoPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/preco-medio-periodo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar preço médio")
  const data = await res.json()
  return data.dados ?? []
}

export interface PolpaLogisticaDescontoPoint {
  periodo: string
  logistica_total: number
  desconto_total: number
  registros: number
}

export async function fetchPolpaLogisticaDesconto(
  fromComp?: string,
  toComp?: string
): Promise<PolpaLogisticaDescontoPoint[]> {
  const params = new URLSearchParams()
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/polpa-logistica-desconto?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar logística/desconto")
  const data = await res.json()
  return data.dados ?? []
}

export interface ExtratoConcentracaoPoint {
  periodo: string
  concentracao_media: number
  registros: number
}

export async function fetchExtratoConcentracao(
  fromComp?: string,
  toComp?: string
): Promise<ExtratoConcentracaoPoint[]> {
  const params = new URLSearchParams()
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/extrato-concentracao?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar concentração")
  const data = await res.json()
  return data.dados ?? []
}

export interface TipoSolventeItem {
  tipo_solvente: string
  receita: number
  registros: number
}

export async function fetchExtratoTipoSolvente(
  fromComp?: string,
  toComp?: string,
  limit = 10
): Promise<TipoSolventeItem[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/extrato-tipo-solvente?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar tipo solvente")
  const data = await res.json()
  return data.itens ?? []
}

export interface CertificacaoItem {
  certificacao: string
  receita: number
  registros: number
}

export async function fetchExtratoCertificacao(
  fromComp?: string,
  toComp?: string,
  limit = 10
): Promise<CertificacaoItem[]> {
  const params = new URLSearchParams({ limit: String(limit) })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/extrato-certificacao?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar certificação")
  const data = await res.json()
  return data.itens ?? []
}

export interface ReceitaQuantidadePeriodoPoint {
  periodo: string
  receita: number
  quantidade: number
}

export async function fetchReceitaQuantidadePeriodo(
  tipo: "polpa" | "extrato",
  fromComp?: string,
  toComp?: string
): Promise<ReceitaQuantidadePeriodoPoint[]> {
  const params = new URLSearchParams({ tipo })
  if (fromComp) params.set("from_comp", fromComp)
  if (toComp) params.set("to_comp", toComp)
  const res = await fetch(`${BASE}/api/analise/receita-quantidade-periodo?${params}`)
  if (!res.ok) throw new Error("Erro ao buscar receita/quantidade")
  const data = await res.json()
  return data.dados ?? []
}

/** Resposta do upload de uma aba. */
export interface UploadResult {
  message: string
  tipo: string
  competencia: string
  linhas_importadas: number
  linhas_substituidas: number
  erros: string[]
}

/** Resposta do upload de todas as abas. */
export interface UploadTodasAbasResult {
  message: string
  ano: number
  abas_processadas: { aba: string; tipo: string; competencia: string; linhas_importadas: number; linhas_substituidas: number }[]
  total_linhas: number
  erros: string[]
}

/** Upload de planilha (uma aba): file + month + year + tipo. */
export async function uploadPlanilha(
  file: File,
  month: number,
  year: number,
  tipo: "polpa" | "extrato",
  groupId?: string
): Promise<UploadResult> {
  const form = new FormData()
  form.append("file", file)
  form.append("month", String(month))
  form.append("year", String(year))
  form.append("tipo", tipo)
  if (groupId) form.append("group_id", groupId)
  const res = await fetch(`${BASE}/api/uploads`, { method: "POST", body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = Array.isArray(data.detail?.erros) ? data.detail.erros.join(" ") : data.detail?.erros ?? "Erro no upload"
    throw new Error(typeof msg === "string" ? msg : "Erro no upload")
  }
  return data
}

/** Upload de planilha com todas as abas: file + year (tipo e mês inferidos pelo nome da aba). */
export async function uploadPlanilhaTodasAbas(
  file: File,
  year: number,
  groupId?: string
): Promise<UploadTodasAbasResult> {
  const form = new FormData()
  form.append("file", file)
  form.append("year", String(year))
  if (groupId) form.append("group_id", groupId)
  const res = await fetch(`${BASE}/api/uploads/todas-abas`, { method: "POST", body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = Array.isArray(data.detail?.erros) ? data.detail.erros.join(" ") : data.detail?.erros ?? "Erro no upload"
    throw new Error(typeof msg === "string" ? msg : "Erro no upload")
  }
  return data
}
