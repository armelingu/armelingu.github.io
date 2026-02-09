# dev-profile

Portfolio pessoal de Gustavo Armelin (armelingu) — Desenvolvedor Backend Python.

## Stack

- HTML5, CSS3, JavaScript (vanilla)
- Sem frameworks, sem dependencias externas
- Google Fonts (Inter, JetBrains Mono)
- Formspree para formulario de contato

## Funcionalidades

- Navegacao por secoes (SPA-like) sem reload
- Internacionalizacao PT/EN com persistencia via localStorage
- SEO configurado (meta tags, Open Graph, Twitter Cards, JSON-LD)
- Formulario de contato funcional com animacao pos-envio
- Gradiente animado no background (CSS puro)
- Responsivo

## Estrutura

```
portfolio/
  template/
    index.html        # pagina principal
  static/
    style.css         # estilos
    script.js         # logica de navegacao, i18n, formulario
```

## Como rodar localmente

Abra `template/index.html` no navegador. Ou sirva com qualquer server:

```bash
python -m http.server 8080
```

Acesse `http://localhost:8080/template/index.html`.

## Autor

Gustavo Armelin — [github.com/armelingu](https://github.com/armelingu)
