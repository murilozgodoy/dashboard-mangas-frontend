import styled from "styled-components"
import { colors } from "@/theme/colors"

export const GeoCard = styled.div`
  background: ${colors.cardBg};
  border: 1px solid ${colors.grayPale};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`

export const GeoTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.textPrimary};
`

export const RegionFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

export const RegionFilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.textSecondary};
`

export const RegionFilterSelect = styled.select`
  padding: 0.5rem 0.75rem;
  border: 1px solid ${colors.grayPale};
  border-radius: 8px;
  font-size: 0.875rem;
  color: ${colors.textPrimary};
  background: ${colors.cardBg};
  min-width: 160px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${colors.green};
  }
`

export const MapWrapper = styled.div`
  width: 100%;
  max-width: 560px;
  margin: 0 auto;
`

export const Legend = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1rem;
  font-size: 0.8125rem;
  color: ${colors.textSecondary};
`

export const LegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
`

export const LegendColor = styled.span<{ $color: string }>`
  width: 14px;
  height: 14px;
  border-radius: 4px;
  background: ${(p) => p.$color};
  border: 1px solid rgba(0, 0, 0, 0.1);
`

export const TableWrapper = styled.div`
  overflow-x: auto;
`

export const GeoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  th,
  td {
    padding: 0.5rem 0.75rem;
    text-align: left;
    border-bottom: 1px solid ${colors.grayPale};
  }
  th {
    font-weight: 600;
    color: ${colors.textSecondary};
    background: ${colors.bg};
  }
  td {
    color: ${colors.textPrimary};
  }
`
