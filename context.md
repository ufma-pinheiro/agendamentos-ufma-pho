# 📋 Contexto do Projeto — Fonte da Verdade
> ⚠️ Este arquivo NÃO é preenchido manualmente pelo humano.
> A IA deve inferir e preencher automaticamente com base nos artefatos fornecidos.
> Todos os especialistas devem ler este arquivo antes de qualquer ação.

---

## 📌 Versão deste Arquivo
- Versão: `1.0.0`
- Última atualização: `2026-04-20`
- Atualizado por: `Antigravity`

---

## 2️⃣ Identidade e Propósito
- Nome do Produto: `Sistema de Agendamento UFMA (Pinheiro)`
- Proposta de Valor (1 frase): `Gestão centralizada e automatizada de reservas de espaços acadêmicos com detecção de conflitos em tempo real.`
- Fase Atual: `Refatoração e Otimização`
- Tipo de Sistema: `Ferramenta Interna`

---

## 3️⃣ Domínio e Glossário
- Termos-chave do negócio: `Agendamento (Reserva), Sala (Espaço), Responsável, Conflito, Dashboard.`
- Regras de negócio não-óbvias:
    - Eventos de múltiplos dias no CSV foram fragmentados em entradas diárias individuais para melhor visualização no calendário.
    - O status "BLOQUEADO" no sistema legado podia ser interpretado incorretamente como conflito.
    - Fuso horário fixo em UTC-3 (Horário de Brasília).
- Entidades e relações principais: `Reservas (Eventos) -> Locais (Salas) -> Responsáveis.`

---

## 4️⃣ Usuários e Mercado
- Público Principal: `Administradores e Professores/Alunos da UFMA.`
- Perfis / Níveis de Acesso: `Admin (ex: tipinheiro@ufma.br) e Usuário Padrão [inferido — confirmar].`
- Nível de Confiança Exigido: `Médio (Controle de agenda pública).`

---

## 5️⃣ Fluxos e Funcionalidades Críticas
- Fluxo Principal (Job to be Done): `Consultar disponibilidade de sala e registrar reserva sem sobreposição de horários.`
- Funcionalidades Essenciais: `Calendário Dinâmico (FullCalendar), Dashboard de Métricas (Chart.js), Exportação de Relatórios (Excel/PDF).`
- Fluxos de Alto Risco / Sensíveis: `Cálculo de conflitos automáticos e exclusão de eventos.`

---

## 6️⃣ Stack e Arquitetura
- Frontend: `Vanilla JavaScript, HTML5, CSS3.`
- Backend: `Supabase (PostgreSQL + Realtime).`
- Banco de Dados: `PostgreSQL (Supabase).`
- Infra / Deploy: `Vercel (Repositório Público).`
- Estilo de API: `Supabase Client (Direct PostgREST).`
- Autenticação / Autorização: `Supabase Auth (em implementação/ajuste).`
- Dependências Críticas: `FullCalendar, Chart.js, XLSX, jsPDF, SweetAlert2, Flatpickr.`

---

## 7️⃣ Ambientes e Secrets
- Ambientes ativos: `Local e Produção (Vercel).`
- URLs de referência: `https://github.com/ufma-pinheiro/agendamentos-ufma-pho`

---

## 8️⃣ Restrições e Regras
- Equipe e Recursos: `Refatoração focada em performance e segurança.`
- Compliance / Privacidade: `Uso interno universitário.`
- Limites Técnicos: `Código legado em arquivo monolítico (app.js ~800 linhas) em processo de modularização.`

---

## 9️⃣ Contrato de Qualidade
- Tratamento de erros: `Obrigatório para falhas de rede/Supabase.`
- Acessibilidade: `Semântica básica de HTML.`
- Internacionalização: `PT-BR apenas.`

---

## 📂 Artefatos Vinculados
- Status do Projeto: [PROJETO_STATUS.md](file:///c:/Users/Admin/OneDrive/Documentos/TRABALHO/SISTEMA%20AGENDAMENTO/em-dev-agendamentos-main/PROJETO_STATUS.md)
- Plano de Melhoria: [melhora agenda.md](file:///c:/Users/Admin/OneDrive/Documentos/TRABALHO/SISTEMA%20AGENDAMENTO/em-dev-agendamentos-main/melhora%20agenda.md)

---

## 🔍 Contexto Inferido pela IA
*(Preenchido automaticamente. Não apague.)*

- **Estrutura de Pastas Detectada**: Raiz com arquivos desacoplados (HTML/JS/CSS). Presença de `.agents` e `.antigravityignore`. 
- **Riscos Imediatos Observados**: Manutenibilidade de script único de 800 linhas (`app.js`). Falsos positivos em conflitos de agenda devido a nomes de colunas.
- **Lacunas de Contexto**: Níveis de permissão detalhados por usuário ainda não mapeados completamente no código.
