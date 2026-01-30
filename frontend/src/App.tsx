import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "@/components/layout/Layout"
import { VisaoGeral } from "@/pages/VisaoGeral"
import { Upload } from "@/pages/Upload"
import { Geografia } from "@/pages/Geografia"
import { Financeiro } from "@/pages/Financeiro"
import { Canal } from "@/pages/Canal"
import { Segmentos } from "@/pages/Segmentos"
import { Quantidade } from "@/pages/Quantidade"
import { Qualidade } from "@/pages/Qualidade"
import { Polpa } from "@/pages/Polpa"
import { Extrato } from "@/pages/Extrato"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<VisaoGeral />} />
          <Route path="upload" element={<Upload />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="canal" element={<Canal />} />
          <Route path="segmentos" element={<Segmentos />} />
          <Route path="quantidade" element={<Quantidade />} />
          <Route path="qualidade" element={<Qualidade />} />
          <Route path="polpa" element={<Polpa />} />
          <Route path="extrato" element={<Extrato />} />
          <Route path="geografia" element={<Geografia />} />
          <Route path="dashboard" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
