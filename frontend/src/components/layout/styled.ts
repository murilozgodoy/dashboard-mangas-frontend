import styled from "styled-components"
import { NavLink } from "react-router-dom"
import { colors } from "@/theme/colors"

export const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${colors.bg};
`

export const Sidebar = styled.aside<{ $collapsed?: boolean }>`
  width: ${(p) => (p.$collapsed ? "72px" : "260px")};
  min-width: ${(p) => (p.$collapsed ? "72px" : "260px")};
  height: 100vh;
  background: ${colors.greenDark};
  color: ${colors.white};
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 12px rgba(0, 0, 0, 0.08);
  transition: width 0.25s ease, min-width 0.25s ease;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
  overflow-y: auto;
  overflow-x: hidden;
`

export const SidebarTop = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  min-height: 56px;
`

export const SidebarLogo = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
`

export const SidebarLogoText = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: ${colors.white};
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

export const SidebarNav = styled.nav`
  flex: 1;
  padding: 0.75rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

export const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
`

export const SidebarSectionTitle = styled.span<{ $collapsed?: boolean }>`
  display: ${(p) => (p.$collapsed ? "none" : "block")};
  padding: 0.5rem 1.25rem 0.25rem;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.5);
`

export const SidebarSectionLinks = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  padding-left: ${(p) => (p.$collapsed ? "0" : "0.5rem")};
`

export const NavLinkWrapper = styled(NavLink)`
  display: block;
  text-decoration: none;
`

export const NavLinkInner = styled.span<{ $active?: boolean; $collapsed?: boolean; $sub?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(p) => (p.$collapsed ? "center" : "flex-start")};
  gap: 0.75rem;
  padding: ${(p) => (p.$collapsed ? "0.75rem" : p.$sub ? "0.5rem 1rem 0.5rem 1.25rem" : "0.75rem 1.25rem")};
  color: ${(p) => (p.$active ? colors.amberLight : "rgba(255, 255, 255, 0.88)")};
  font-weight: ${(p) => (p.$active ? 600 : 500)};
  font-size: ${(p) => (p.$sub ? "0.875rem" : "0.9375rem")};
  border-left: 3px solid ${(p) => (p.$active ? colors.amberLight : "transparent")};
  background: ${(p) => (p.$active ? "rgba(255, 255, 255, 0.06)" : "transparent")};
  transition: background 0.15s, color 0.15s;

  ${NavLinkWrapper}:hover & {
    background: rgba(255, 255, 255, 0.08);
    color: ${colors.white};
  }
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: -2px;
  }
`

export const SidebarToggle = styled.button<{ $collapsed?: boolean }>`
  flex-shrink: 0;
  padding: 0.5rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: ${colors.white};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
  &:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.4);
    outline-offset: 2px;
  }
`

export const Main = styled.main<{ $sidebarCollapsed?: boolean }>`
  flex: 1;
  margin-left: ${(p) => (p.$sidebarCollapsed ? "72px" : "260px")};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: auto;
  transition: margin-left 0.25s ease;
`

export const PageHeader = styled.header`
  background: ${colors.cardBg};
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid ${colors.grayPale};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
`

export const PageTitle = styled.h1`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: ${colors.textPrimary};
  letter-spacing: -0.02em;
`

export const PageSubtitle = styled.p`
  margin: 0.35rem 0 0 0;
  font-size: 0.875rem;
  color: ${colors.textMuted};
  line-height: 1.45;
`

export const PageContent = styled.div`
  padding: 1.5rem 1.75rem;
  flex: 1;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
`
