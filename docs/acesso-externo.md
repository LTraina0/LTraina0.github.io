# Acesso externo e inspeção textual · 2026-11-11

Os três endereços pedidos retornaram HTTP 200 em GETs sem cookies e sem execução de JavaScript. O navegador Chrome via CDP também recebeu 200 nos três e no manifesto de modelos. O serviço web de navegação do ChatGPT retornou erro interno sem código HTTP para os mesmos endereços e para o manifesto JSON. A origem interna dessa falha permanece indeterminada. Os resultados não demonstram indisponibilidade geral do site nem comprovam bloqueio da Cloudflare contra o serviço.

## Medições antes da alteração

| Recurso | HTTP direto | Chrome/CDP |
| --- | --- | --- |
| / | 200 | 200 |
| /?build=fachada-021&compare=facade-A-contextual | 200 | 200 |
| /?build=atelier-02 | 200 | 200 |
| /modelos/release.json | 200 | 200 |
| JSON da fachada B | 200 | carregado pela prévia |
| /model.json | 200 | carregado pela prévia |
| /portal/versions/2.4.0.json | 200 | carregado pela prévia |
| JS e CSS referidos pelo HTML | 200 | sem erro de carregamento observado |
| /robots.txt | 404 | 404 |

A ausência de robots.txt não demonstra uma regra de bloqueio. Nenhuma política de indexação foi adicionada.

O DNS resolveu A 104.18.23.186 e 104.18.22.186, além de dois endereços IPv6. A conexão TLS 1.3 foi autorizada pelo cliente. O certificado para *.lucastraina.chatgpt.site foi emitido por Google Trust Services WE1 e é válido de 3 de outubro de 2026 a 1 de janeiro de 2027. A raiz e as queries não redirecionaram. O endereço /portal/viewer.html redirecionou para /portal/viewer. Esse comportamento já era tratado na regressão pública.

As respostas medidas informaram Server cloudflare, CF-Cache-Status HIT e Cache-Control public, max-age=0, must-revalidate. O marcador cf-mitigated esteve ausente. Não se reproduziu 403, 429 ou desafio impeditivo nessas requisições. O servidor enviou cookie Cloudflare, mas os GETs receberam conteúdo completo antes de qualquer reutilização de cookie. Isso descreve os clientes e origens testados. Regras WAF, reputação de IPs e políticas do serviço de navegação não foram consultadas no painel da Cloudflare.

Uma primeira tentativa HTTP sob o sandbox retornou DNS negado. A mesma medição com rede autorizada resolveu DNS e recebeu HTTP 200. Essa falha do ambiente local não foi usada como evidência de falha de DNS pública.

## Melhoria implementada

A aplicação é uma exportação estática. O HTML inicial da raiz é compartilhado pelas queries, e a seleção de construção ocorre no JavaScript. Um cliente textual não obtinha os dados do modelo apenas lendo esse HTML.

A área /inspecao/ oferece páginas estáticas por caminho para a Casa de Bambu, três Portais Escarlate, telhado 0.1 e fachadas A/B/C. Cada página contém nome, contagem, materiais, estados presentes, módulos, parâmetros, limites de validação e amostra de células. Esses dados são derivados dos modelos existentes durante o build.

O catálogo /inspecao/catalogo.json lista também os 194 estudos e suas URLs de dados. /inspecao/diagnostico.json descreve as capacidades públicas e as APIs. É uma descrição estática do build, sem alegação de monitoramento da saúde do servidor. /inspecao/dados/facade-B.json é um exemplo de resumo estruturado.

A raiz passou a declarar links de descoberta e um acesso textual para JavaScript desabilitado. Os modelos e a interface 3D foram preservados. Nenhuma configuração de Cloudflare, autenticação ou acesso administrativo foi alterada.

## Como inspecionar

1. Cliente textual ou HTTP pode começar por /inspecao/, depois seguir o resumo e o modelo completo. As páginas por caminho identificam o projeto sem depender de query ou JavaScript.
2. Cliente com navegador/CDP pode abrir o estúdio e aguardar BuildsMineInspector.snapshot().ready. A inspeção e os eventos existentes continuam disponíveis.
3. WebMCP depende da API do navegador e da página carregada. O catálogo estático documenta as cinco operações disponíveis quando há suporte. O Chrome conectado não expôs essa API. O Chromium com WebMCP habilitado foi usado nos testes nativos.
4. Caso o serviço de navegação do ChatGPT continue recusando o domínio, a alternativa é um cliente HTTP ou navegador/CDP autorizado com acesso ao domínio, ou fornecer os JSONs públicos como arquivos ao chat. As páginas estáticas dependem da mesma hospedagem e não garantem superar uma restrição do serviço.

Os relatórios HTTP, validação pública e capturas ficam em output/access-audit no workspace. A investigação não acessou logs internos do serviço web do ChatGPT. Cache miss ou erro interno desse serviço não foi convertido em um código HTTP atribuído ao BuildsMine.

