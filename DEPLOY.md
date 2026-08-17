# Publicação do portfólio

Guia rápido pra colocar o site no ar com **Netlify + domínio próprio do registro.br**.
Tempo estimado: ~30 minutos (incluindo propagação de DNS).

---

## 1. Comprar o domínio no registro.br

1. Entre em [https://registro.br](https://registro.br) e procure um domínio livre.
   Sugestões coerentes:
   - `walterbarreto.com.br`
   - `walterbarreto.dev.br`
   - `walter.dev.br`
2. Faça o cadastro como pessoa física (CPF), gere o boleto/Pix e pague.
3. Após confirmação do pagamento, o domínio fica ativo em alguns minutos.

> O edital pede **domínio próprio** — qualquer extensão registrada serve (`.com.br`, `.dev.br`, `.app.br`...).

---

## 2. Subir o site no Netlify

### Opção A — Drag & drop (mais rápido)

1. Crie conta gratuita em [https://app.netlify.com/signup](https://app.netlify.com/signup).
2. Acesse [https://app.netlify.com/drop](https://app.netlify.com/drop).
3. Arraste **a pasta inteira** `portfolio/` (a que contém `index.html`) para a área de upload.
4. O Netlify gera uma URL provisória do tipo `https://nome-aleatorio.netlify.app`.

### Opção B — Via GitHub (mais profissional, atualiza sozinho)

1. Crie um repositório no GitHub e suba os arquivos.
2. No Netlify: **Add new site → Import from Git → GitHub → escolha o repo**.
3. Build command vazio. Publish directory: `.`
4. A cada `git push` o site é republicado.

---

## 3. Conectar o domínio do registro.br ao Netlify

### 3.1 — No Netlify

1. Vá em **Domain management → Add a custom domain**.
2. Digite o domínio (`walterbarreto.com.br` por exemplo).
3. O Netlify vai mostrar os **nameservers** dele. Algo como:

   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```

   Copie esses 4 nomes.

### 3.2 — No registro.br

1. Acesse [https://registro.br](https://registro.br) → **Painel** → seu domínio.
2. Vá em **DNS** → **Configurar DNS** → escolha **Usar outros servidores DNS**.
3. Cole os 4 nameservers do Netlify, um por linha.
4. Salve.

### 3.3 — Esperar a propagação

- O registro.br costuma propagar em **15 min a 4 horas**.
- Confira com:

  ```bash
  dig walterbarreto.com.br NS +short
  ```

- Quando os nameservers do Netlify aparecerem, o site já está acessível pelo domínio.

### 3.4 — HTTPS automático

O Netlify provisiona certificado SSL via Let's Encrypt sozinho assim que o DNS propaga.
Você vai ver o cadeado em **Domain management → HTTPS** virar verde em poucos minutos.

---

## 4. Conferir antes de entregar

- [ ] Site abre em `https://seudominio.com.br` (não só na URL `.netlify.app`).
- [ ] Cadeado HTTPS ativo.
- [ ] Funciona no celular (responsivo).
- [ ] Os três cases estão visíveis com `contexto / desafio / entrega / resultado`.
- [ ] LinkedIn, e-mail e telefone clicáveis.
- [ ] Coloque a **URL final do domínio próprio** na comprovação do edital.

---

## 5. Atualizar o conteúdo depois

Sempre que quiser alterar texto, edite o `index.html` e:
- **Opção A**: reabra [https://app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta de novo (em "Deploys" do site existente).
- **Opção B**: faça `git push` se conectou via GitHub.
