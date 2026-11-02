# Ativa Store — protótipo da vitrine digital

Protótipo navegável para validar com a proprietária da Ativa Store (@ativaa.store) antes de construir o sistema definitivo.

- **Site** (`index.html`): vitrine na Direção A "Arranque", com catálogo, filtro por categoria e por cor, troca de foto ao tocar na cor, página da peça, looks, coleções e localização.
- **Painel** (`painel/`): como a empreendedora vai gerenciar a vitrine pelo computador ou celular: cadastrar peças com fotos da galeria, salvar rascunho, ver prévia, publicar, atualizar disponibilidade, organizar categorias, looks, coleções, página inicial e dados da loja.
- **Direções criativas** (`direcoes.html`): as duas propostas visuais e a recomendação.

## O que é real e o que é demonstração

- Fotos, nomes das peças e descrições vêm das publicações do Instagram da loja (out/2026), usados com autorização da proprietária.
- Tamanhos (P, M, G) são de exemplo. A disponibilidade aparece como "Consultar disponibilidade" em todas as peças. O único preço exibido (R$ 49,90) é o que a loja publicou no post.
- O botão do WhatsApp **não envia mensagem**: mostra o texto que seria enviado à loja.
- O painel salva **só neste navegador** (localStorage). O login é de demonstração. No sistema definitivo, os dados ficam em banco de dados, as fotos em armazenamento próprio e o acesso exige e-mail e senha.
- "Restaurar dados de exemplo", em Configurações, volta tudo ao estado inicial.

## Rodar localmente

Qualquer servidor estático na pasta, por exemplo:

```bash
python -m http.server 8000
```

Depois abra http://localhost:8000.

## Estrutura

```
index.html        site público
painel/           painel da loja
direcoes.html     direções criativas
css/              estilos do site e do painel
js/data.js        dados iniciais (peças do Instagram)
js/store.js       armazenamento e publicação (rascunho → publicado)
js/site.js        site público
js/painel.js      painel
img/              fotos otimizadas para web
```
