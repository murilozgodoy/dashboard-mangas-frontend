import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { colors } from "@/theme/colors"
import type { TopCanal } from "@/services/api"
import * as S from "./styled"

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v)

interface ChartTopCanaisProps {
  data: TopCanal[]
  loading?: boolean
}

export function ChartTopCanais({ data, loading }: ChartTopCanaisProps) {
  if (loading) {
    return (
      <S.ChartCard>
        <S.ChartTitle>Top canais por receita</S.ChartTitle>
        <S.ChartPlaceholder>Carregando…</S.ChartPlaceholder>
      </S.ChartCard>
    )
  }

  if (!data?.length) {
    return (
      <S.ChartCard>
        <S.ChartTitle>Top canais por receita</S.ChartTitle>
        <S.ChartPlaceholder>Nenhum dado no período selecionado.</S.ChartPlaceholder>
      </S.ChartCard>
    )
  }

  const chartData = data.map((d) => ({ name: d.canal || "(sem canal)", receita: d.receita }))

  return (
    <S.ChartCard>
      <S.ChartTitle>Top canais por receita</S.ChartTitle>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 8 }}>
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
            width={120}
            tick={{ fontSize: 12, fill: colors.textSecondary }}
            axisLine={{ stroke: colors.grayPale }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number) => [formatCurrency(value), "Receita"]}
            contentStyle={{
              borderRadius: 8,
              border: `1px solid ${colors.grayPale}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            }}
          />
          <Bar dataKey="receita" fill={colors.green} radius={[0, 4, 4, 0]} name="Receita" />
        </BarChart>
      </ResponsiveContainer>
    </S.ChartCard>
  )
}
