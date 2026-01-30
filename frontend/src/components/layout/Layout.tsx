import { useState } from "react"
import { Outlet } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import * as S from "./styled"

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  return (
    <S.LayoutWrapper>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
      />
      <S.Main $sidebarCollapsed={sidebarCollapsed}>
        <Outlet />
      </S.Main>
    </S.LayoutWrapper>
  )
}
