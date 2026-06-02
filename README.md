# Gestão Urbana — Prefeitura de Osasco

Sistema web de gestão urbana com React, Vite, Firebase e Tailwind CSS.

## Instalação

```bash
npm install
npm run dev
```

## Firebase

Configure no [Console Firebase](https://console.firebase.google.com/project/gestao-urbana-osasco):

1. **Authentication** — E-mail/senha habilitado
2. **Firestore** — Coleções: `usuarios`, `pontos_viciados`, `cacambas`, `varricao`, `ecopontos`, `vistorias`, `protocolos_156`
3. **Regras Firestore** (desenvolvimento):

```firebase
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Primeiro usuário (Gestor)

1. Crie um usuário em Authentication → E-mail/senha
2. No Firestore, coleção `usuarios`, documento com ID = UID do usuário:

```json
{
  "email": "gestor@osasco.gov.br",
  "nome": "Administrador",
  "perfil": "Gestor"
}
```

## Perfis

| Perfil   | Permissões                          |
|----------|-------------------------------------|
| Gestor   | Acesso total + gestão de usuários   |
| Fiscal   | Cadastros e checklists              |
| Operador | Somente visualização                |

## Módulos

- Dashboard com métricas e gráficos (Recharts)
- Pontos Viciados, Caçambas, Varrição Municipal
- Ecopontos / PEVs / Cooperativas com checklist de vistoria e exportação PDF
- Protocolos 156
- Fotos comprimidas (800px) em base64 no Firestore

## Geocodificação / Geometrias

- O projeto inclui scripts e uma Cloud Function para geocodificação e obtenção de geometria (trechos de rua) usando Nominatim + Overpass.
- Variáveis de ambiente relevantes:
  - `GOOGLE_APPLICATION_CREDENTIALS` — caminho para a service account JSON usada pelos scripts/Cloud Functions.
  - `NOMINATIM_USER_AGENT` — texto enviado no header `User-Agent` para Nominatim/Overpass (recomendado incluir um e-mail de contato).
  - `NOMINATIM_EMAIL` — alternativa legada usada como fallback.

Para mais detalhes veja `scripts/README-geocode.md`.

## Build

```bash
npm run build
```
