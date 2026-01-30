import styled from "styled-components"
import { colors } from "@/theme/colors"

export const DashboardGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`

export const ChartCard = styled.div`
  background: ${colors.cardBg};
  border: 1px solid ${colors.grayPale};
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s ease, border-color 0.2s ease;
  min-height: 320px;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    border-color: ${colors.grayPale};
  }
`

export const ChartTitle = styled.h2`
  margin: 0 0 1rem 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  letter-spacing: -0.01em;
`

export const ChartPlaceholder = styled.div`
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${colors.textMuted};
  font-size: 0.9375rem;
`

export const ErrorBanner = styled.div`
  padding: 0.75rem 1rem;
  border-radius: 10px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
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
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${colors.green};
  }
`

export const Tabs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid ${colors.grayPale};
  padding-bottom: 0;
`

export const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(p) => (p.$active ? colors.greenDark : colors.textSecondary)};
  background: ${(p) => (p.$active ? colors.greenBg : "transparent")};
  border: none;
  border-bottom: 2px solid ${(p) => (p.$active ? colors.green : "transparent")};
  margin-bottom: -1px;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: color 0.15s, background 0.15s;

  &:hover {
    color: ${colors.greenDark};
    background: ${colors.greenBg};
  }
  &:focus-visible {
    outline: 2px solid ${colors.green};
    outline-offset: 2px;
  }
`
