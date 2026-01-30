import * as S from "./styled"
import {
  LayoutDashboard,
  Upload,
  DollarSign,
  Radio,
  PieChart,
  Hash,
  Award,
  Package,
  Droplets,
  LineChart,
  MapPin,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"

const mainNavItems = [
  { to: "/", label: "Visão geral", icon: LayoutDashboard },
  { to: "/financeiro", label: "Financeiro", icon: DollarSign },
  { to: "/geografia", label: "Geografia", icon: MapPin },
  { to: "/canal", label: "Canal", icon: Radio },
  { to: "/segmentos", label: "Segmentos", icon: PieChart },
  { to: "/quantidade", label: "Quantidade", icon: Hash },
  { to: "/qualidade", label: "Qualidade", icon: Award },
  { to: "/analise-avancada", label: "Análise avançada", icon: LineChart },
]

const produtosItems = [
  { to: "/polpa", label: "Polpa", icon: Package },
  { to: "/extrato", label: "Extrato", icon: Droplets },
]

const uploadItems = [
  { to: "/upload", label: "Inserir dados", icon: Upload },
]

interface SidebarProps {
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ collapsed = false, onToggleCollapse }: SidebarProps) {
  return (
    <S.Sidebar $collapsed={collapsed}>
      <S.SidebarTop>
        <S.SidebarToggle onClick={onToggleCollapse} $collapsed={collapsed} type="button" aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
        </S.SidebarToggle>
        {!collapsed && (
          <S.SidebarLogo>
            <S.SidebarLogoText>AgroMango</S.SidebarLogoText>
          </S.SidebarLogo>
        )}
      </S.SidebarTop>
      <S.SidebarNav>
        {mainNavItems.map(({ to, label, icon: Icon }) => (
          <S.NavLinkWrapper key={to} to={to} end={to === "/"}>
            {({ isActive }: { isActive: boolean }) => (
              <S.NavLinkInner $active={isActive} $collapsed={collapsed} title={collapsed ? label : undefined}>
                <Icon size={20} strokeWidth={2} aria-hidden />
                {!collapsed && <span>{label}</span>}
              </S.NavLinkInner>
            )}
          </S.NavLinkWrapper>
        ))}
        <S.SidebarSection>
          <S.SidebarSectionTitle $collapsed={collapsed}>Produtos</S.SidebarSectionTitle>
          <S.SidebarSectionLinks $collapsed={collapsed}>
            {produtosItems.map(({ to, label, icon: Icon }) => (
              <S.NavLinkWrapper key={to} to={to}>
                {({ isActive }: { isActive: boolean }) => (
                  <S.NavLinkInner $active={isActive} $collapsed={collapsed} $sub title={collapsed ? label : undefined}>
                    <Icon size={20} strokeWidth={2} aria-hidden />
                    {!collapsed && <span>{label}</span>}
                  </S.NavLinkInner>
                )}
              </S.NavLinkWrapper>
            ))}
          </S.SidebarSectionLinks>
        </S.SidebarSection>
        <S.SidebarSection>
          <S.SidebarSectionTitle $collapsed={collapsed}>Upload</S.SidebarSectionTitle>
          <S.SidebarSectionLinks $collapsed={collapsed}>
            {uploadItems.map(({ to, label, icon: Icon }) => (
              <S.NavLinkWrapper key={to} to={to}>
                {({ isActive }: { isActive: boolean }) => (
                  <S.NavLinkInner $active={isActive} $collapsed={collapsed} $sub title={collapsed ? label : undefined}>
                    <Icon size={20} strokeWidth={2} aria-hidden />
                    {!collapsed && <span>{label}</span>}
                  </S.NavLinkInner>
                )}
              </S.NavLinkWrapper>
            ))}
          </S.SidebarSectionLinks>
        </S.SidebarSection>
      </S.SidebarNav>
    </S.Sidebar>
  )
}
