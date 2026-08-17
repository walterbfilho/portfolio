# walter@portfolio

Portfólio profissional de Walter Barreto — Desenvolvedor Salesforce.

## Estrutura

```
portfolio/
├── index.html          # site (single page)
├── assets/
│   ├── styles.css      # estética terminal/dev
│   ├── main.js         # smooth scroll + tab ativo
│   └── favicon.svg
├── netlify.toml        # headers de segurança e cache
├── DEPLOY.md           # passo a passo registro.br + Netlify
└── README.md
```

## Rodar localmente

Qualquer um destes serve:

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .
```

Abrir [http://localhost:8000](http://localhost:8000).

## Publicar

Veja [DEPLOY.md](DEPLOY.md) — guia completo de domínio próprio (registro.br) + Netlify.
