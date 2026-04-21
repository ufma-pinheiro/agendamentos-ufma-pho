# FEAT-001: Central de Notificações Administrativa

## Objetivo
Criar um painel de controle centralizado para que administradores gerenciem a logística de comunicação do sistema.

## Funcionalidades Detalhadas (PRD)
1. **Configuração de Regras (1.2):**
   - Campo para definir a antecedência do alerta (Padrão: 24h).
2. **Editor de Templates (1.3):**
   - Campo de texto para o assunto e corpo do e-mail institucional.
3. **Modo Manual / Trigger (1.5):**
   - Botão "Notificar Agora" para cada evento na lista de pendentes.
4. **Painel de Histórico (1.1):**
   - Listagem de logs com data, destinatário e status de entrega.
5. **Notificação de Cancelamento (3.2):**
   - Disparo automático de e-mail ao excluir um evento.

## Segurança e Acesso (2.1)
- Visibilidade e interação restritas ao nível de acesso `dono`.

## Critérios de Aceite
- [ ] Aba "Notificações" possui seções de Configuração e Histórico.
- [ ] O Administrador pode salvar um novo template de e-mail.
- [ ] O botão "Notificar Agora" simula/realiza o disparo para o responsável.
- [ ] Ao excluir um evento, um log de notificação de cancelamento é gerado.
