import styled from "styled-components"
import { colors } from "@/theme/colors"

export const KpiCardWrapper = styled.div`
  background: ${colors.cardBg};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  border: 1px solid ${colors.grayPale};
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
`

export const KpiLabel = styled.div`
  font-size: 0.8125rem;
  font-weight: 500;
  color: ${colors.textMuted};
  margin-bottom: 0.375rem;
`

export const KpiValue = styled.div<{ $accent?: "green" | "amber" }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${(p) =>
    p.$accent === "green" ? colors.greenMedium : p.$accent === "amber" ? colors.amber : colors.textPrimary};
  line-height: 1.2;
`

export const KpiSub = styled.div`
  font-size: 0.75rem;
  color: ${colors.textMuted};
  margin-top: 0.25rem;
`

export const KpiGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
`

export const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
`

export const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.375rem;
`

export const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.textSecondary};
  white-space: nowrap;
`

export const Select = styled.select`
  padding: 0.5rem 0.75rem;
  height: 2.25rem;
  border: 1px solid ${colors.grayPale};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${colors.textPrimary};
  background: ${colors.white};
  min-width: 7.5rem;
  cursor: pointer;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.green};
    box-shadow: 0 0 0 2px rgba(64, 145, 108, 0.2);
  }
`

export const SectionTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: ${colors.textPrimary};
`

export const LoadingMessage = styled.p`
  text-align: center;
  padding: 2rem;
  color: ${colors.textMuted};
  font-size: 0.9375rem;
`

export const ErrorMessage = styled.p`
  text-align: center;
  padding: 2rem;
  color: #b91c1c;
  font-size: 0.9375rem;
`
