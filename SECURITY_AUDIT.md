# SECURITY AUDIT — walter@portfolio

Auditoria de segurança do repositório `portfolio/`.
Auditor: Claude (sessão de auditoria autorizada pelo proprietário).
Escopo: **apenas** este repositório e artefatos locais. Sem testes contra produção nem terceiros.

---

## Metadados

- **Início da auditoria**: 2026-08-11
- **Ambiente sob teste**: filesystem local em `/Users/walterbarreto/Desktop/Projects/portfolio`
- **Estado do deploy**: **não deployado ainda** (sem remote git, sem site publicado, sem domínio)
- **Método**: revisão estática de código + análise de configuração (headers, CSP, dependências)

---

## Fase 1 — Mapeamento

### 1.1 Arquitetura

| Item | Valor |
|---|---|
| Tipo de aplicação | Site estático puro (sem SSR, sem framework) |
| Stack | HTML5 + CSS3 + JavaScript vanilla (ES6, IIFE) |
| Build step | Nenhum (deploy direto dos arquivos) |
| Backend | **Nenhum** |
| Banco de dados | **Nenhum** |
| Autenticação/sessão | **Nenhuma** |
| Formulários | **Nenhum** (só `mailto:` e `tel:` como links) |
| Uploads | **Nenhum** |
| Storage client-side | **Nenhum** (sem `localStorage`, `sessionStorage`, cookies próprios) |
| Hosting planejado | Netlify (Free) + domínio próprio via registro.br |
| Runtime server-side | N/A |

### 1.2 Inventário de arquivos

| Caminho | Tipo | Servido publicamente? |
|---|---|---|
| `index.html` | HTML site principal | Sim |
| `cv.html` | HTML CV profissional | Sim |
| `cv-terminal.html` | HTML CV estilo terminal | Sim |
| `walter-barreto-cv.pdf` | PDF gerado do cv.html | Sim |
| `assets/styles.css` | CSS | Sim |
| `assets/main.js` | JavaScript | Sim |
| `assets/favicon.svg` | SVG favicon | Sim |
| `robots.txt` | `User-agent: *  Allow: /` | Sim |
| `netlify.toml` | Config Netlify | **A verificar** (Netlify normalmente não serve `.toml`) |
| `DEPLOY.md` | Runbook | **A verificar** (Netlify serve `.md` por padrão) |
| `README.md` | Documentação | **A verificar** (idem) |
| `SECURITY_AUDIT.md` | Este relatório | **Não deve ser servido** |
| `.git/` | Metadados git | Netlify não expõe (default) |

### 1.3 Dependências externas

| Origem | Uso | Escopo do risco |
|---|---|---|
| `fonts.googleapis.com` | Preconnect + `<link rel="stylesheet">` (Inter, JetBrains Mono) | Terceiro carrega CSS crítico. Se comprometido → CSS malicioso. |
| `fonts.gstatic.com` | Arquivos `.woff2` das fontes | Terceiro. Menor risco (só binário de fonte). |
| Nenhuma dep JS empacotada | Sem `package.json`, sem `node_modules`, sem lock file | 0 CVE de supply chain via npm/yarn/pnpm. |

### 1.4 Superfície de ataque real

Como é 100% estático, sem input de usuário e sem código do lado do servidor, a superfície é muito estreita:

**Vetores possíveis (em ordem de relevância teórica):**
1. **Headers HTTP** (`netlify.toml`) — configuração de segurança na borda.
2. **Content-Security-Policy** — efetividade, permissividade, cobertura.
3. **Dependência externa em Google Fonts** — CSS de terceiro consumido em runtime.
4. **Vazamento de metadados** — PDF, HTML meta, arquivos de doc servidos publicamente.
5. **Links externos** — `target="_blank"` sem `rel="noopener noreferrer"`.
6. **SVG inline** — SVGs podem embutir `<script>` (o favicon foi verificado, limpo).
7. **JavaScript client-side** — `assets/main.js` usa APIs seguras (sem `innerHTML`, sem `eval`, sem `Function`, sem `document.write`).
8. **Robots/discovery** — o `robots.txt` permite tudo; arquivos internos podem ser indexados.

**Vetores tradicionais que NÃO se aplicam** (marcar explícito pra fechar escopo):
- SQL/NoSQL/Command injection → sem backend/DB
- Broken auth/session → sem auth
- IDOR/BOLA → sem recursos ID-based
- SSRF → sem fetch server-side
- CSRF → sem endpoints que mudem estado
- Deserialização insegura → sem processamento server-side de payloads
- Path traversal → sem file API server-side
- Upload malicioso → sem upload
- Race conditions/TOCTOU → sem operações concorrentes
- Logging insuficiente → não há logs próprios (só access log do Netlify)

### 1.5 Entradas de dados do usuário

**Nenhuma entrada estruturada.** Único ponto onde `main.js` toca em DOM baseado em atributos:

- [assets/main.js:9](assets/main.js#L9) `const id = a.getAttribute('href');` — o `href` vem de anchors **hardcoded no template** (`#stack`, `#cases`, etc.), não de input do usuário.
- [assets/main.js:11](assets/main.js#L11) `document.querySelector(id)` — mesmo argumento; risco de XSS aqui exigiria que um atacante conseguisse editar o HTML servido, o que não é uma vuln do app, é comprometimento do host.

### 1.6 Headers configurados no `netlify.toml`

| Header | Valor atual | Comentário técnico (Fase 2) |
|---|---|---|
| `X-Frame-Options` | `DENY` | OK |
| `X-Content-Type-Options` | `nosniff` | OK |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | OK |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Faltam diretivas modernas (ver Fase 2) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Falta `preload` (opcional) |
| `Content-Security-Policy` | `default-src 'self'; style-src 'self' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data:; script-src 'self'; base-uri 'self'; form-action 'self'` | Falta `object-src`, `frame-ancestors`, `upgrade-insecure-requests` (defesa em profundidade) |

Ausentes (a discutir na Fase 2):
- `Cross-Origin-Opener-Policy`
- `Cross-Origin-Resource-Policy`
- `Cross-Origin-Embedder-Policy`
- (Não obrigatórios pra site estático institucional, mas hardening extra.)

---

## Fase 2 — Análise de vulnerabilidades

Data: 2026-08-11

### Verificações executadas

- Scan de segredos no código (grep de `api_key|secret|token|password|bearer|private key`) → **nenhum encontrado**.
- Scan de padrões perigosos JS (`eval`, `Function()`, `innerHTML`, `document.write`, `on*=` inline, `javascript:`) → **nenhum encontrado**.
- Análise de `target="_blank"` em links externos → todos com `rel="noopener noreferrer"`.
- Análise de todas as URLs externas referenciadas → apenas Google Fonts (HTTPS).
- Inspeção de `assets/favicon.svg` → SVG estático limpo, sem `<script>` nem `<foreignObject>`.
- Inspeção de `assets/main.js` → só DOM APIs seguras (`textContent`, `scrollIntoView`, `IntersectionObserver`).
- Inspeção de metadata do PDF via `mdls` e `strings`.
- Análise das diretivas da CSP no `netlify.toml`.

### Padrão de simulação usado

Ambiente estático, sem servidor de teste. Verificações contra os arquivos exatos que serão deployados. Testes de comportamento em runtime foram construídos por raciocínio sobre o comportamento documentado do Netlify + navegador.

---

## Fase 3 — Relatório priorizado

Ordenação: mais crítico → menos crítico.

### 🔴 HIGH-01 · CSP quebra os CVs quando deployados (functional break)

- **Categoria OWASP**: A05:2021 · Security Misconfiguration
- **Severidade**: Alta — quebra funcional 100% reprodutível assim que o site sair do local.
- **Localização**:
  - [cv.html:13](cv.html#L13) — bloco `<style>` inline de ~180 linhas
  - [cv.html:301](cv.html#L301) — atributo `style="list-style: none; padding: 0;"` inline
  - [cv-terminal.html:13](cv-terminal.html#L13) — bloco `<style>` inline de ~230 linhas
- **Causa raiz**: A CSP em [netlify.toml:11](netlify.toml#L11) define `style-src 'self' https://fonts.googleapis.com`. Sem `'unsafe-inline'` ou hash SHA-256 dos blocos, o browser bloqueia todo `<style>` e todo `style="..."` embutido no HTML. Só o CSS externo (Google Fonts + `/assets/styles.css`) executa.
- **Prova de conceito**:
  ```
  Após deploy no Netlify:
  1. curl -sI https://seudominio/cv.html | grep -i content-security-policy
     → Content-Security-Policy: ...style-src 'self' https://fonts.googleapis.com...
  2. Abrir https://seudominio/cv.html no browser
  3. DevTools → Console mostrará:
     "Refused to apply inline style because it violates the following
      Content Security Policy directive: 'style-src 'self' https://fonts.googleapis.com'.
      Either the 'unsafe-inline' keyword, a hash ('sha256-...'), or a nonce
      ('nonce-...') is required to enable inline execution."
  4. Página renderiza como texto puro sem layout.
  ```
- **Impacto real**: Os dois CVs viram texto sem formatação em produção. Se um recrutador acessar `/cv.html`, vai ver algo quebrado. Também compromete a entrega das “horas complementares” caso o edital abra os arquivos.
- **Status**: ✅ **RESOLVIDO** em 2026-08-17
- **Correção aplicada**:
  - Criado [assets/cv.css](assets/cv.css) com o CSS extraído de `cv.html`, incluindo nova classe `.lang-list` que substitui o `style="..."` inline.
  - Criado [assets/cv-terminal.css](assets/cv-terminal.css) com o CSS extraído de `cv-terminal.html`.
  - `cv.html` e `cv-terminal.html` passaram a linkar o CSS via `<link rel="stylesheet" href="assets/...css" />`.
  - `<ul style="...">` na linha 301 de `cv.html` trocado por `<ul class="lang-list">`.
- **Re-testes**:
  - `grep '<style>' cv*.html` → 0 hits.
  - `grep 'style="' cv*.html` → 0 hits.
  - PDF regerado com CSS externo carregando: mantém 1 página, layout preservado.

---

### 🟠 MEDIUM-01 · Arquivos de documentação servidos publicamente

- **Categoria OWASP**: A05:2021 · Security Misconfiguration (Information Disclosure)
- **Severidade**: Média — não é exploit direto, mas reduz fricção pra reconnaissance e vaza a própria auditoria.
- **Localização**: raiz do repo (`SECURITY_AUDIT.md`, `DEPLOY.md`, `README.md`, `netlify.toml`)
- **Causa raiz**: `netlify.toml` define `publish = "."`, e o Netlify serve por padrão todo arquivo da publish dir, incluindo `.md` e `.toml`. Não há regra de exclusão nem `_headers`/redirects retornando 404.
- **Prova de conceito**:
  ```
  Após deploy:
    curl -s https://seudominio/SECURITY_AUDIT.md      → 200 OK, dump da auditoria
    curl -s https://seudominio/DEPLOY.md              → 200 OK, playbook de deploy
    curl -s https://seudominio/README.md              → 200 OK, estrutura do repo
    curl -s https://seudominio/netlify.toml           → 200 OK (comportamento típico Netlify), CSP e headers expostos
  ```
- **Impacto real**:
  - `SECURITY_AUDIT.md` **é um mapa da mina** para um atacante — expõe a auditoria e os pontos fracos conhecidos.
  - `netlify.toml` expõe a política CSP completa (facilita achar bypasses).
  - `DEPLOY.md`/`README.md` expõem estrutura interna e sugestões de nome de domínio.
- **Status**: ✅ **RESOLVIDO** em 2026-08-17
- **Correção aplicada** ([netlify.toml](netlify.toml)): três regras `[[redirects]]` com `status = 404, force = true` bloqueando `/*.md`, `/*.toml` e `/SECURITY_AUDIT*` antes de qualquer serving estático.
- **Re-teste pós-deploy** (rodar depois de subir no Netlify):
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/SECURITY_AUDIT.md   # esperado: 404
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/DEPLOY.md           # esperado: 404
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/README.md           # esperado: 404
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/netlify.toml        # esperado: 404
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/                    # esperado: 200
  curl -s -o /dev/null -w "%{http_code}\n" https://seudominio/cv.html             # esperado: 200
  ```

---

### 🟡 LOW-01 · PDF vaza fingerprint do Chromium headless que o gerou

- **Categoria OWASP**: A01/A05 · Information Disclosure via metadata
- **Severidade**: Baixa — não é exploit; é assinatura “gerado automaticamente” embutida no artefato.
- **Localização**: [walter-barreto-cv.pdf](walter-barreto-cv.pdf) (metadata PDF)
- **Prova de conceito**:
  ```
  mdls walter-barreto-cv.pdf | grep -i creator
    → kMDItemCreator = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)
       AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/150.0.0.0 Safari/537.36"

  strings walter-barreto-cv.pdf | grep -E '^/(Creator|Producer)'
    → /Creator (... HeadlessChrome/150.0.0.0 ...)
    → /Producer (Skia/PDF m150)
  ```
- **Impacto real**: Recrutador que abrir “Propriedades” do PDF vê **HeadlessChrome** como criador → sinaliza automação. Também vaza SO (macOS 10_15_7) e versão do Chrome. Não é vuln de segurança; é assinatura de bot que pode gerar dúvida.
- **Status**: **ABERTO**

---

### 🟡 LOW-02 · CSP sem diretivas de defesa em profundidade

- **Categoria OWASP**: A05:2021 · Security Misconfiguration
- **Severidade**: Baixa — sem vetor prático hoje, mas hardening trivial.
- **Localização**: [netlify.toml:11](netlify.toml#L11)
- **Diretivas ausentes**:
  - `object-src 'none'` (bloqueia `<object>`/`<embed>`; hoje cai no `default-src 'self'` mas explícito é padrão OWASP)
  - `frame-ancestors 'none'` (substituto moderno do X-Frame-Options)
  - `upgrade-insecure-requests` (força HTTPS em subresources caso algum link `http://` vaze no futuro)
- **Impacto real**: Marginal. Vira relevante se o site crescer e passar a receber conteúdo dinâmico.
- **Status**: **ABERTO**

---

### 🟡 LOW-03 · HSTS sem `preload`

- **Categoria OWASP**: A05 · Security Misconfiguration
- **Severidade**: Baixa — só importa antes da primeira visita HTTPS de cada cliente novo.
- **Localização**: [netlify.toml:10](netlify.toml#L10)
- **Descrição**: `Strict-Transport-Security: max-age=31536000; includeSubDomains` está OK, mas falta o token `preload` que habilita submissão à HSTS preload list do Chrome.
- **Impacto real**: Sem preload, o primeiro acesso via `http://` pode ser downgrade-attacked antes do HSTS pegar. Depois disso, o browser força HTTPS.
- **Compromisso**: Depois de preloaded, remover exige processo demorado. Só habilitar depois de ter certeza que **todos os subdomínios** também vão suportar HTTPS.
- **Status**: **ABERTO** (aguarda decisão informada)

---

### 🟡 LOW-04 · Dependência externa em Google Fonts (privacy + supply chain)

- **Categoria OWASP**: A06:2021 · Vulnerable and Outdated Components (leitura ampla)
- **Severidade**: Baixa
- **Localização**: [index.html:18](index.html#L18), [cv.html:11](cv.html#L11), [cv-terminal.html:11](cv-terminal.html#L11)
- **Descrição**: Toda visita ao site gera request pro Google (IP + User-Agent). Precedente jurídico na Alemanha (2022) considerou uso de Google Fonts externo violação de GDPR. Se o CDN do Google for comprometido, um CSS malicioso pode ser servido.
- **Impacto real**: Privacy (LGPD/GDPR); supply chain teoricamente possível.
- **Mitigação**: Baixar os `.woff2` (Inter + JetBrains Mono) via google-webfonts-helper e servir de `/assets/fonts/`. Reduz superfície e melhora performance.
- **Status**: **ABERTO**

---

### 🔵 INFO-01 · Permissions-Policy sem opt-out de tracking moderno

- **Localização**: [netlify.toml:9](netlify.toml#L9)
- **Descrição**: Falta `interest-cohort=(), browsing-topics=(), join-ad-interest-group=(), run-ad-auction=()` pra sinalizar opt-out do FLoC/Topics API do Chrome.
- **Impacto**: Privacy/branding. Não é vulnerabilidade.
- **Status**: **ABERTO**

---

### 🔵 INFO-02 · Cross-Origin isolation headers ausentes

- **Localização**: [netlify.toml](netlify.toml)
- **Descrição**: Sem `Cross-Origin-Opener-Policy: same-origin` e `Cross-Origin-Resource-Policy: same-origin`. Não obrigatórios pra site estático, mas endurecem contra XS-Leaks/Spectre.
- **Status**: **ABERTO**

---

### 🔵 INFO-03 · `robots.txt` permite indexação de tudo

- **Localização**: [robots.txt](robots.txt)
- **Descrição**: `Allow: /` sem `Disallow` explícito → o Google indexará `SECURITY_AUDIT.md`, `DEPLOY.md`, PDF, etc. (Se MEDIUM-01 for corrigido no lado do servidor, isso vira só cinto+suspensório.)
- **Status**: **ABERTO**

---

## Fase 4 — Correções

_Aguardando aprovação da priorização. Cada patch será apresentado como diff antes de aplicar._

---

## Log de decisões

| Data | Item | Ação |
|---|---|---|
| 2026-08-11 | Início da auditoria | Fase 1 concluída |
| 2026-08-11 | Análise de vulnerabilidades | Fase 2/3 concluídas; 1 HIGH, 1 MEDIUM, 4 LOW, 3 INFO |
| 2026-08-17 | HIGH-01 e MEDIUM-01 | Corrigidos. Site pronto pra deploy. LOW/INFO adiados. |
