# Guia de Importação de Protocolos 156 do Excel

## Como usar a importação

### 1. Preparar a planilha
Certifique-se de que sua planilha Excel tem **pelo menos uma coluna "Número"**.

Colunas reconhecidas automaticamente:
- **Número**: número, protocolo, nº, no, n°, protocolo 156
- **Tipo**: tipo, natureza da denúncia, natureza, tipo de denúncia
- **Endereço**: endereço, endereco, endereço completo, rua, local
- **Bairro**: bairro, bairro/zona, zona
- **Data Abertura**: data abertura, data de abertura, data do protocolo, data, data de criação
- **Prazo**: prazo, prazo de atendimento, vencimento, data vencimento, data prazo
- **Status**: status, situação, situacao, estado, andamento
- **Descrição**: descrição, obs, observação, detalhes, reclamação
- **Responsável**: responsável, responsavel, atribuído a, atribuido (opcional)
- **Telefone**: telefone, tel, celular (opcional)
- **Email**: email, e-mail (opcional)

### 2. Status reconhecidos automaticamente
- "Concluído", "Concluida", "Finalizado" → **Concluído**
- "Em atendimento", "Atendimento", "Processando" → **Em atendimento**
- "Agendado", "Agenda" → **Agendado**
- "Aberto", "Vencido", "Pendente" → **Aberto**

### 3. Tipos reconhecidos automaticamente
Os tipos serão mapeados automaticamente. Se não encontrar, usa "Outro".

### 4. Importar na aplicação
1. Vá para **Protocolos 156** → **Lista**
2. Clique no botão **"Importar Excel"** (canto superior direito)
3. Selecione seu arquivo Excel (.xlsx, .xls ou .csv)
4. Aguarde o processamento
5. Revise o preview dos dados
6. Clique no botão verde **"✓ Confirmar importação"**
7. Pronto! Os protocolos serão importados para o sistema

## Dicas importantes

- ✅ Nomes de colunas **não diferenciam maiúsculas/minúsculas**
- ✅ Acentos e espaços extras são ignorados
- ✅ O Excel detecta automaticamente a primeira planilha
- ✅ Linhas vazias são ignoradas
- ✅ Datas podem estar em qualquer formato padrão (Excel detecta)
- ✅ O preview mostra até 20 registros antes de confirmar

## Solução de problemas

### "Coluna 'Número' não encontrada"
- Verifique se sua planilha tem uma coluna com o número do protocolo
- O nome pode ser "Número", "numero", "Protocolo", "nº", etc.

### Dados não aparecem no preview
- Certifique-se de que a planilha não está vazia
- A primeira linha deve ser o cabeçalho (nomes das colunas)
- Os dados começam a partir da segunda linha

### Datas em formato errado
- O Excel detecta automaticamente datas
- Se a data estiver como texto, tente salvar como CSV e tentar novamente

## Informações adicionais

- Todos os registros importados recebem timestamp de criação automaticamente
- Um histórico de status é criado automaticamente para cada importação
- Responsável padrão na importação é "Importação" (se não especificado)
- Cada protocolo importado recebe um ID único no banco de dados
