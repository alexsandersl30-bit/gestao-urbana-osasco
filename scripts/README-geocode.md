Script de geocodificação (server-side)

Objetivo
- Geocodificar documentos que não possuem `lat`/`lon` e gravar no Firestore.

Pré-requisitos
- Node 18+ (recomendado, para `fetch` global) ou forneça um polifill.
- Credenciais de serviço do Firebase (service account JSON).

Como executar
1. Instale dependências (adicionamos `firebase-admin` no `package.json`):

```bash
npm install
```

2. Exporte a variável de ambiente apontando para o JSON da service account:

Windows (PowerShell):

```powershell
$env:GOOGLE_APPLICATION_CREDENTIALS = "C:\caminho\para\serviceAccountKey.json"
npm run geocode
```

Linux / macOS:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/caminho/para/serviceAccountKey.json"
npm run geocode
```

3. Recomendado: definir um `User-Agent` com e-mail/contato para o Nominatim (melhor prática).

```bash
# variável usada para o header `User-Agent`; pode ser apenas um e-mail ou texto identificador
export NOMINATIM_USER_AGENT="gestao-urbana-osasco - seu-email@dominio.com"
# alternativa legada (NOMINATIM_EMAIL) também é suportada
export NOMINATIM_EMAIL="seu-email@dominio.com"
```

4. Executar o script:

```bash
node scripts/geocode_batch.js
```

Observações
- O script respeita a política pública do Nominatim (1 requisição/segundo) e envia `User-Agent` com o valor de `NOMINATIM_USER_AGENT` (ou `NOMINATIM_EMAIL` se não estiver definido).
- É seguro executar uma vez para enriquecer a base; se quiser, posso adaptar para rodar como Cloud Function.
