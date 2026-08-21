# armelingu.

Portfólio estático do [Gustavo Armelin](https://armelingu.github.io): backend, integração de sistemas e ERP.

HTML, CSS e JS puro. Publicado em [armelingu.github.io](https://armelingu.github.io) via GitHub Pages.

## Rodar local

Abra `index.html` no navegador, ou sirva a pasta:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Estrutura

```
index.html          home
style.css           design system
script.js           nav, reveal, contador
artigos/            posts
og.png              cartão de compartilhamento
Curriculo_Gustavo_Armelin.pdf
```

## Adicionar um artigo

1. Crie `artigos/slug.html` copiando um post existente (header, hero, corpo, footer).
2. Inclua um card em `#artigos` no `index.html`, no topo da lista.
3. Data no dia em que o texto for ao ar. Sem em-dash no texto.

## Workflow

Branch por mudança, um commit por assunto, PR para `main`. O Pages atualiza depois do merge.
