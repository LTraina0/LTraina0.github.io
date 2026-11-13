# Evolução 0.2 · auditoria e leitura das onze referências

## Linha de base

O commit 42ccb52 do BuildsMine gera uma família com transição de quadril para empena a três fiadas da borda. A inclinação e a elevação dos cantos variam. A profundidade dos beirais, as duas camadas de consolos, a posição de seus braços e o preenchimento dos frontões têm regras fixas. A cumeeira admite duas combinações de materiais. O catálogo reconhece cubo, tora, escada, laje e alçapão. A geração valida contato por face, estados, simetria e ocupação. Os dez testes da base passaram antes da integração.

**Hipóteses a testar.** Um mesmo perfil pode perder a curvatura ao ser discretizado em poucos blocos. Uma silhueta bem resolvida em perspectiva pode esconder um frontão plano. Duas texturas com médias de cor próximas podem produzir uma faixa muito irregular à distância. A geometria visível de um objeto funcional pode deixar de coincidir com a superfície de apoio necessária no jogo.

**Oportunidades.** Medir a altura das fiadas e inspecionar projeções ortográficas. Construir vãos, molduras e apoios em profundidade. Comparar materiais pela estrutura tonal de suas faces. Reservar detalhes contrastantes às regiões em que a arquitetura pede destaque. Preservar origem, pontos de encaixe e orientação das peças para reutilização.

## Caderno de referências

A origem Pinterest é informação fornecida pelo usuário para as imagens 1 e 3–11. A segunda imagem é a captura do ObjToSchematic. A autoria individual e os packs não foram determinados. Os identificadores desta primeira coluna seguem a ordem dos anexos.

| Imagem | Observação visual | Hipótese ou decisão de projeto |
| --- | --- | --- |
| 1 · colunata | O vão alto alterna com pilares estreitos, capitéis de perfil recortado e uma faixa escura contínua no topo. | Testar um objeto funcional como capitel. O contorno permite propor bigorna ou receptáculo, mas a captura não determina qual objeto foi usado. |
| 2 · sapo | A divisão vertical compara a superfície contínua com uma ocupação em células. Os olhos, o focinho e as manchas mantêm áreas de cor distinguíveis. | Separar preservação da silhueta e correspondência de textura. A resolução muda o tamanho mínimo de um detalhe reconhecível. |
| 3 · quatro sequências | Cada faixa percorre valores próximos e intercala faces com marcações grandes e faces visualmente lisas. | Descrever contraste intratextura além da tonalidade média. |
| 4 · coral e ameixa | As fronteiras avançam em degraus e as fibras verticais introduzem direção. | Manter regiões coesas, orientar madeira em função da peça. |
| 5 · magenta e azul | Há um motivo de contraste forte na faixa intermediária entre campos de granularidade menor. | Conter o motivo num intervalo controlado e comparar repetição a média distância. |
| 6 · minerais claros | O dominante muda pouco em matiz e muito em densidade de arestas. Motivos concêntricos repetem-se em determinadas linhas. | Testar um gradiente mineral que também varie em granulação. |
| 7 · diagonal quente | A progressão diagonal atravessa amarelos e laranjas até vermelho escuro, com concentrações de alto contraste. | Controlar axis espacial e densidade de acentos. Brilho aparente na imagem não comprova emissão no jogo. |
| 8 · três réguas | Uma sequência muda de temperatura, outra muda sobretudo de luminosidade e a terceira usa oposição escuro/vermelho. | Comparar três critérios separadamente com a mesma iluminação. |
| 9 · repertório por cor | As famílias têm extensões diferentes e incluem faces lisas, naturais e geométricas. | Deixar blocos de categorias diferentes competir na recomendação, respeitando a forma necessária. |
| 10 · peças alinhadas | Em várias linhas, cores relacionadas ocupam volumes muito diferentes, de peças largas a grades e lâminas. | Avaliar materiais à área efetivamente visível em uma peça estreita. Forma e cor são restrições distintas. |
| 11 · mosaicos | A repetição de faces orientadas produz motivos maiores que um bloco. | Preservar estados direcionais e distinguir mosaico por arranjo de células de rotação de uma textura dentro de sua célula. |

Os exemplos inspiram operações de composição e experimentos. A lista de IDs, domínios, faces e restrições realmente usados está nos catálogos técnicos de cada motor. As fotografias e os pins permanecem fora dos assets publicados.

