import * as S from "./styled"

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: "green" | "amber"
}

export function KpiCard({ label, value, sub, accent }: KpiCardProps) {
  return (
    <S.KpiCardWrapper>
      <S.KpiLabel>{label}</S.KpiLabel>
      <S.KpiValue $accent={accent}>{value}</S.KpiValue>
      {sub && <S.KpiSub>{sub}</S.KpiSub>}
    </S.KpiCardWrapper>
  )
}
