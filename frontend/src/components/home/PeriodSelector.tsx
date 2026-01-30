import * as S from "./styled"

/** Extrai anos únicos dos períodos (YYYY-MM) */
function yearsFromPeriods(periods: string[]): string[] {
  const set = new Set(periods.map((p) => p.slice(0, 4)))
  return [...set].sort()
}

interface PeriodSelectorProps {
  periods: string[]
  fromComp: string
  toComp: string
  onFromChange: (v: string) => void
  onToChange: (v: string) => void
}

const VALUE_TODOS = "__todos__"

export function PeriodSelector({
  periods,
  fromComp,
  toComp,
  onFromChange,
  onToChange,
}: PeriodSelectorProps) {
  const years = yearsFromPeriods(periods)
  const sorted = [...periods].sort()
  const isFullRange = sorted.length > 0 && fromComp === sorted[0] && toComp === sorted[sorted.length - 1]
  const selectedYear =
    isFullRange
      ? VALUE_TODOS
      : fromComp?.startsWith("20") && toComp?.startsWith("20") && fromComp?.endsWith("-01") && toComp?.endsWith("-12")
        ? fromComp.slice(0, 4)
        : ""

  const handleYearChange = (year: string) => {
    if (!year) return
    if (year === VALUE_TODOS) {
      if (sorted.length > 0) {
        onFromChange(sorted[0])
        onToChange(sorted[sorted.length - 1])
      }
      return
    }
    onFromChange(`${year}-01`)
    onToChange(`${year}-12`)
  }

  return (
    <>
      <S.FilterGroup>
        <S.FilterLabel>Ano inteiro:</S.FilterLabel>
        <S.Select
          value={selectedYear}
          onChange={(e) => handleYearChange(e.target.value)}
          aria-label="Selecionar ano inteiro"
        >
          <option value="">—</option>
          <option value={VALUE_TODOS}>Todos</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </S.Select>
      </S.FilterGroup>
      <S.FilterGroup>
        <S.FilterLabel>De (mês):</S.FilterLabel>
        <S.Select
          value={fromComp}
          onChange={(e) => onFromChange(e.target.value)}
          aria-label="Competência inicial"
        >
          <option value="">—</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </S.Select>
      </S.FilterGroup>
      <S.FilterGroup>
        <S.FilterLabel>Até (mês):</S.FilterLabel>
        <S.Select
          value={toComp}
          onChange={(e) => onToChange(e.target.value)}
          aria-label="Competência final"
        >
          <option value="">—</option>
          {periods.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </S.Select>
      </S.FilterGroup>
    </>
  )
}
