import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts"
import { colors } from "@/theme/colors"
import type { TimeseriesPoint } from "@/services/api"
import * as S from "./styled"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

/** Formata YYYY-MM para "Jan/YY" */
function formatPeriodo(periodo: string) {
  const [y, m] = periodo.split("-")
  const meses = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const mes = meses[parseInt(m, 10) - 1] ?? m
  return `${mes}/${y.slice(2)}`
}

interface ChartReceitaProps {
  data: TimeseriesPoint[]
  loading?: boolean
  tipo: "polpa" | "extrato"
}

export function ChartReceita({ data, loading, tipo }: ChartReceitaProps) {
  if (loading) {
    return (
      <S.ChartCard>
        <S.ChartTitle>Receita por período</S.ChartTitle>
        <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>
      </S.ChartCard>
    )
  }

  if (!data?.length) {
    return (
      <S.ChartCard>
        <S.ChartTitle>Receita por período</S.ChartTitle>
        <S.ChartPlaceholder>Nenhum dado no período selecionado.</S.ChartPlaceholder>
      </S.ChartCard>
    )
  }

  return (
    <S.ChartCard>
      <S.ChartTitle>Receita por período</S.ChartTitle>
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
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
          <Line
            type="monotone"
            dataKey="receita"
            stroke={colors.green}
            strokeWidth={2}
            dot={{ fill: colors.green, strokeWidth: 0 }}
            activeDot={{ r: 6, fill: colors.greenLight, stroke: colors.green }}
            name="Receita"
          />
        </LineChart>
      </ResponsiveContainer>
    </S.ChartCard>
  )
}
