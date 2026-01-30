import styled from "styled-components"
import { colors } from "@/theme/colors"

export const UploadModes = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`

export const ModeButton = styled.button<{ $active?: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid ${(p) => (p.$active ? colors.green : colors.grayPale)};
  background: ${(p) => (p.$active ? colors.greenBg : colors.cardBg)};
  color: ${(p) => (p.$active ? colors.greenDark : colors.textSecondary)};
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  font-size: 0.9375rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;

  &:hover {
    border-color: ${colors.green};
    background: ${colors.greenBg};
    color: ${colors.greenDark};
  }
`

export const UploadCard = styled.div`
  background: ${colors.cardBg};
  border: 1px solid ${colors.grayPale};
  border-radius: 12px;
  padding: 1.5rem;
  max-width: 520px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
`

export const FormRow = styled.div`
  margin-bottom: 1rem;

  &:last-of-type {
    margin-bottom: 1.25rem;
  }
`

export const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${colors.textPrimary};
  margin-bottom: 0.35rem;
`

export const Input = styled.input`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${colors.grayPale};
  border-radius: 8px;
  font-size: 0.9375rem;
  color: ${colors.textPrimary};
  background: ${colors.cardBg};

  &:focus {
    outline: none;
    border-color: ${colors.green};
    box-shadow: 0 0 0 2px rgba(64, 145, 108, 0.2);
  }

  &[type="file"] {
    padding: 0.4rem 0;
    cursor: pointer;
  }
`

export const Select = styled.select`
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid ${colors.grayPale};
  border-radius: 8px;
  font-size: 0.9375rem;
  color: ${colors.textPrimary};
  background: ${colors.cardBg};
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${colors.green};
  }
`

export const SubmitButton = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: none;
  background: ${colors.green};
  color: ${colors.white};
  font-weight: 600;
  font-size: 0.9375rem;
  cursor: pointer;
  transition: background 0.15s, transform 0.05s;

  &:hover:not(:disabled) {
    background: ${colors.greenMedium};
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`

export const Message = styled.div<{ $success?: boolean }>`
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  background: ${(p) => (p.$success ? colors.greenBg : "#fef2f2")};
  color: ${(p) => (p.$success ? colors.greenDark : "#991b1b")};
  border: 1px solid ${(p) => (p.$success ? colors.greenPale : "#fecaca")};
`

export const ResumoLista = styled.ul`
  margin: 0.5rem 0 0 0;
  padding-left: 1.25rem;
  font-size: 0.8125rem;
  color: ${colors.textSecondary};
`

export const ResumoItem = styled.li`
  margin-bottom: 0.25rem;
`
