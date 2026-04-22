# FEAT-003: Polimento UI/UX - Responsividade e Cards de Data

## Objetivo
Melhorar a experiência do usuário (UX) e o apelo visual (UI) do calendário e do sistema de seleção de datas no formulário de agendamento.

## Requisitos
1.  **Responsividade do Calendário**: 
    *   Melhorar a visualização em dispositivos móveis (FullCalendar).
    *   Ajustar alturas e fontes para evitar quebra de layout em telas pequenas.
2.  **Cards de Datas (Formulário)**:
    *   Redesenhar a `data-row-styled` para parecer um "card" premium.
    *   Melhorar o feedback visual de remoção e seleção.
    *   Garantir alinhamento perfeito entre inputs de data e hora.

## Referências
*   `style.css`: Seção de FullCalendar e Modais.
*   `js/reservas.js`: Função `adicionarLinhaData`.

## Critérios de Aceite
- [ ] Calendário utilizável em smartphones (iPhone/Android).
- [ ] Seleção de datas múltipla com visual moderno (Glassmorphism ou Flat UI Premium).
- [ ] Sem regressões nas funcionalidades de agendamento.
