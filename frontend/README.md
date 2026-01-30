# AgroMango — Dashboard (Frontend)

Interface do dashboard AgroMango para visualização de métricas de **polpa congelada** e **extrato de manga**: receita, canais, segmentos, qualidade, geografia e upload de planilhas.

## Tecnologias

- **React 19** + **TypeScript**
- **Vite 7** (build e dev server)
- **React Router** (rotas)
- **Styled Components** (estilos)
- **Recharts** (gráficos)
- **Lucide React** (ícones)
- **Tailwind CSS** (utilitários)

## Pré-requisitos

- **Node.js** 18+ (recomendado 20+)
- **npm** ou **yarn**
- Backend da API rodando (repositório `dashboard-mangas-backend`) para dados reais

## Instalação

```bash
npm install
```

## Scripts

| Comando      | Descrição                          |
|-------------|-------------------------------------|
| `npm run dev`     | Sobe o servidor de desenvolvimento (porta 5173) |
| `npm run build`   | Gera build de produção em `dist/`   |
| `npm run preview` | Serve o build localmente (preview)  |
| `npm run lint`    | Roda o ESLint                      |

## Como rodar

1. **Suba o backend** (em outro terminal), por exemplo na porta **8002**:
   ```bash
   cd ../dashboard-mangas-backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Suba o frontend**:
   ```bash
   npm run dev
   ```

3. Acesse **http://localhost:5173**. O frontend usa a API em `http://localhost:8002` quando rodando na porta 5173 ou 3000.

## Configuração da API

A URL da API está em `src/config/config.ts`:

- Em **desenvolvimento** (porta 5173 ou 3000): usa `http://localhost:8002`.
- Em **outro ambiente**: `apiBaseUrl` fica vazio e as requisições são relativas (`/api/...`). Para produção com backend em outro host, altere esse arquivo ou use variáveis de ambiente.

## Estrutura do projeto

```
src/
├── App.tsx              # Rotas principais
├── main.tsx             # Entrada da aplicação
├── config/
│   └── config.ts        # URL da API
├── components/
│   ├── dashboard/       # Gráficos reutilizáveis (ChartReceita, ChartTopCanais, etc.)
│   ├── geografia/       # Mapa do Brasil e utilitários
│   ├── home/            # KpiCard, PeriodSelector, TipoSelector
│   ├── layout/          # Layout, Sidebar
│   └── upload/          # Estilos do upload
├── pages/               # Páginas por rota (VisaoGeral, Financeiro, Canal, etc.)
├── services/
│   └── api.ts           # Chamadas à API
├── theme/
│   └── colors.ts        # Paleta de cores
└── styles/              # CSS global e mobile
```

## Páginas (rotas)

| Rota | Página | Descrição |
|------|--------|-----------|
| `/` | Visão geral | KPIs, receita no tempo, top canais/regiões, pizza Polpa vs Extrato |
| `/financeiro` | Financeiro | Receita total, ticket médio, gráfico receita por período, tabela por competência |
| `/geografia` | Geografia | Receita por região (mapa) |
| `/canal` | Canal | Ranking de canais e receita por mês |
| `/segmentos` | Segmentos | Ranking de segmentos e receita por mês |
| `/quantidade` | Quantidade | Quantidade (kg/L) por período |
| `/qualidade` | Qualidade | NPS por período e por canal |
| `/polpa` | Polpa | Indicadores específicos da polpa (qualidade, logística, receita, preço) |
| `/extrato` | Extrato | Indicadores do extrato (concentração, solvente, certificação, receita) |
| `/upload` | Inserir dados | Upload por produto (uma aba) ou base completa (todas as abas) |

## Licença

Projeto privado.
