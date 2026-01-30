import type { Tipo } from "@/services/api"
import * as S from "./styled"

interface TipoSelectorProps {
  value: Tipo
  onChange: (tipo: Tipo) => void
}

export function TipoSelector({ value, onChange }: TipoSelectorProps) {
  return (
    <S.FilterGroup>
      <S.FilterLabel>Tipo:</S.FilterLabel>
      <S.Select
        value={value}
        onChange={(e) => onChange(e.target.value as Tipo)}
        aria-label="Selecionar tipo (Polpa, Extrato ou Todos)"
      >
        <option value="polpa">Polpa congelada</option>
        <option value="extrato">Extrato de manga</option>
        <option value="todos">Todos</option>
      </S.Select>
    </S.FilterGroup>
  )
}
