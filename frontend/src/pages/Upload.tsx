import { useState } from "react"
import * as LayoutS from "@/components/layout/styled"
import * as S from "@/components/upload/styled"
import { colors } from "@/theme/colors"
import {
  uploadPlanilha,
  uploadPlanilhaTodasAbas,
  type UploadResult,
  type UploadTodasAbasResult,
} from "@/services/api"

const MESES = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Fev" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Abr" },
  { value: 5, label: "Mai" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Ago" },
  { value: 9, label: "Set" },
  { value: 10, label: "Out" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dez" },
]

const anoAtual = new Date().getFullYear()
const ANOS = Array.from({ length: 25 }, (_, i) => anoAtual - 10 + i)

type Modo = "uma" | "todas"

export function Upload() {
  const [modo, setModo] = useState<Modo>("uma")
  const [file, setFile] = useState<File | null>(null)
  const [month, setMonth] = useState(anoAtual === new Date().getFullYear() ? new Date().getMonth() + 1 : 1)
  const [year, setYear] = useState(anoAtual)
  const [tipo, setTipo] = useState<"polpa" | "extrato">("polpa")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successResult, setSuccessResult] = useState<UploadResult | UploadTodasAbasResult | null>(null)

  const resetMessage = () => {
    setError(null)
    setSuccessResult(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    setFile(f ?? null)
    resetMessage()
  }

  const handleSubmitUma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Selecione um arquivo.")
      return
    }
    setLoading(true)
    setError(null)
    setSuccessResult(null)
    try {
      const result = await uploadPlanilha(file, month, year, tipo)
      setSuccessResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar planilha.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitTodas = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError("Selecione um arquivo Excel (.xlsx).")
      return
    }
    setLoading(true)
    setError(null)
    setSuccessResult(null)
    try {
      const result = await uploadPlanilhaTodasAbas(file, year)
      setSuccessResult(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar planilha.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <LayoutS.PageHeader>
        <LayoutS.PageTitle>Upload</LayoutS.PageTitle>
        <LayoutS.PageSubtitle>
          Envie planilhas Excel (polpa ou extrato). Uma aba ou todas as abas de uma vez.
        </LayoutS.PageSubtitle>
      </LayoutS.PageHeader>
      <LayoutS.PageContent>
        <S.UploadModes>
          <S.ModeButton type="button" $active={modo === "uma"} onClick={() => { setModo("uma"); resetMessage() }}>
            Uma aba
          </S.ModeButton>
          <S.ModeButton type="button" $active={modo === "todas"} onClick={() => { setModo("todas"); resetMessage() }}>
            Todas as abas
          </S.ModeButton>
        </S.UploadModes>

        <S.UploadCard>
          {modo === "uma" ? (
            <form onSubmit={handleSubmitUma}>
              <S.FormRow>
                <S.Label htmlFor="upload-file-uma">Arquivo (Excel ou CSV)</S.Label>
                <S.Input
                  id="upload-file-uma"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  required
                />
              </S.FormRow>
              <S.FormRow>
                <S.Label htmlFor="upload-mes">Mês</S.Label>
                <S.Select id="upload-mes" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MESES.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </S.Select>
              </S.FormRow>
              <S.FormRow>
                <S.Label htmlFor="upload-ano-uma">Ano</S.Label>
                <S.Select id="upload-ano-uma" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {ANOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </S.Select>
              </S.FormRow>
              <S.FormRow>
                <S.Label htmlFor="upload-tipo">Tipo</S.Label>
                <S.Select id="upload-tipo" value={tipo} onChange={(e) => setTipo(e.target.value as "polpa" | "extrato")}>
                  <option value="polpa">Polpa congelada</option>
                  <option value="extrato">Extrato de manga</option>
                </S.Select>
              </S.FormRow>
              <S.SubmitButton type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Enviar planilha"}
              </S.SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleSubmitTodas}>
              <S.FormRow>
                <S.Label htmlFor="upload-file-todas">Arquivo Excel (.xlsx) com várias abas</S.Label>
                <S.Input
                  id="upload-file-todas"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileChange}
                  required
                />
              </S.FormRow>
              <S.FormRow>
                <S.Label htmlFor="upload-ano-todas">Ano (aplicado a todas as abas)</S.Label>
                <S.Select id="upload-ano-todas" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                  {ANOS.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </S.Select>
              </S.FormRow>
              <p style={{ fontSize: "0.8125rem", color: colors.textMuted, marginBottom: "1rem" }}>
                As abas devem ter nomes como &quot;Polpa congelada - Jul&quot; ou &quot;Extrato de manga - Ago&quot; para
                identificar tipo e mês.
              </p>
              <S.SubmitButton type="submit" disabled={loading}>
                {loading ? "Enviando…" : "Enviar todas as abas"}
              </S.SubmitButton>
            </form>
          )}

          {error && (
            <S.Message $success={false} role="alert">
              {error}
            </S.Message>
          )}
          {successResult && (
            <S.Message $success role="alert">
              {"linhas_importadas" in successResult && !("abas_processadas" in successResult) ? (
                <>
                  <strong>Importação concluída.</strong> Competência: {(successResult as UploadResult).competencia},{" "}
                  {(successResult as UploadResult).linhas_importadas} linha(s) importada(s).
                  {(successResult as UploadResult).linhas_substituidas > 0 &&
                    ` ${(successResult as UploadResult).linhas_substituidas} substituída(s).`}
                </>
              ) : (
                <>
                  <strong>{(successResult as UploadTodasAbasResult).message}</strong>
                  <br />
                  Total: {(successResult as UploadTodasAbasResult).total_linhas} linha(s) em{" "}
                  {(successResult as UploadTodasAbasResult).abas_processadas.length} aba(s).
                  {(successResult as UploadTodasAbasResult).abas_processadas.length > 0 && (
                    <S.ResumoLista>
                      {(successResult as UploadTodasAbasResult).abas_processadas.map((r, i) => (
                        <S.ResumoItem key={i}>
                          {r.aba}: {r.linhas_importadas} linha(s) ({r.competencia})
                        </S.ResumoItem>
                      ))}
                    </S.ResumoLista>
                  )}
                  {(successResult as UploadTodasAbasResult).erros?.length > 0 && (
                    <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>
                      Avisos: {(successResult as UploadTodasAbasResult).erros.join("; ")}
                    </div>
                  )}
                </>
              )}
            </S.Message>
          )}
        </S.UploadCard>
      </LayoutS.PageContent>
    </>
  )
}
