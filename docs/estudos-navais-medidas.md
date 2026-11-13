# Auditoria dimensional e adequação dos materiais navais

Esta análise mede a primeira geração reprovada, antes de modelar os novos estudos A, B e C. Valores são dados da prévia canônica, não uma medição dentro do Bedrock nem aprovação artística. O modelo anterior permanece intacto.

## Origem e método

- Modelo: `shipwreck-haven-weathered`, versão 0.3.0, composição Abrigo da popa.
- Entrada: `dist/modelos/atelier/shipwreck-haven-weathered.json`, codificação `buildsmine.cells/1`, expandida com `unpackModel`.
- SHA-256: `28a4e58487fe5337ed255ea639aa67afb1ec716fd6797d8eb92c5b0583b6de57`, igual ao manifesto de release.
- Commit registrado no build de origem: `bbbb1b60bcdc4f58ddc6b9ecf018bd85edcf7a24`.
- Script reprodutível: `node scripts/measure-naval-studies.mjs ../../output/ship-03/auditoria-dimensional.json`.

Os limites de célula usam intervalos de mínimo inclusivo e máximo exclusivo. Dimensões das tabelas seguem **X × Y × Z**, isto é, largura × altura × comprimento. O sólido de cada bloco vem de `kitVolume(catalog[id].shape, states)`, em dezesseis avos. Cada célula é única; calcula-se a união das caixas dentro dela antes de somar os volumes. Faces e volumes sobrepostos de uma mesma peça não são contados duas vezes. Projeções XZ também usam união, contando uma posição uma única vez mesmo quando há vários pavimentos sobre ela.

As caixas de correntes e alças de lanternas são os proxies de contato documentados pelo motor. Portanto os volumes abaixo representam os sólidos da prévia e esses proxies, não colisões ou volumes materiais medidos no jogo. A rotina confere casos analíticos: cubo 1, laje 0,5, escada reta 0,75 e união de caixas sobrepostas; também confere unicidade das células e o hash da entrada contra o manifesto.

Para **núcleo principal**, foram selecionados os módulos `keel`, `frames`, `hull`, `deck`, `cabin`, `quarterdeck`, `rails`, `masts` e `rigging`. Excluem-se contexto, fragmentos, passarelas e acessórios, porque estes dois últimos módulos também contêm peças dispersas. Esse recorte inclui o leme e os extremos da ruptura. Para **casco principal**, selecionam-se `keel`, `frames` e `hull`. Os **destroços** compreendem `side-fragment`, `bow-fragment` e `deck-fragment`, incluindo as pequenas toras soltas cadastradas nesse último módulo. Toda definição fica registrada no JSON de medição.

## Nove medições solicitadas

| Item | Resultado do modelo reprovado | Definição e limite da interpretação |
| --- | --- | --- |
| 1. Largura máxima da embarcação | **25 blocos** no casco e no núcleo principal | X de −16 a 9 exclusivo. A largura naval espalhada é 50; os 54 do projeto com gelo não são a boca do navio. |
| 2. Comprimento do núcleo principal | **33 blocos** | Z de −37 a −4 exclusivo, com leme e restos extremos. O módulo de costado `hull` ocupa 30 blocos; o convés principal ocupa 27. |
| 3. Altura da seção sobrevivente | **22 blocos**, ou **16 sem mastros e velame** | Núcleo: Y de 1 a 23 exclusivo. A altura 23 do projeto publicado inclui a camada de gelo em Y=0. O casco sozinho ocupa oito blocos de altura. |
| 4. Dimensões da cabine | Paredes externas **13 × 5 × 11**; interior declarado **11 × 5 × 9** | O módulo `cabin` ocupa Y=10..15 exclusivo. Piso está em Y=9 e teto em Y=15; ambos pertencem a outros módulos. Considerando piso e teto, o recinto externo vertical é sete células, Y=9..16. O interior declarado tem 99 blocos² de planta e 495 blocos³ de volume, antes do mobiliário. |
| 5. Largura e profundidade do casco | **25 de boca × 8 de profundidade vertical**, envelope longitudinal de 33 | Módulos `keel` + `frames` + `hull`. Profundidade é do fundo da quilha Y=1 ao topo dos sólidos de costado em Y=9. Até o topo do convés em Y=10 são nove blocos. Não é calado hidrostático. |
| 6. Espessura das paredes navais | Cabine de madeira: **1 bloco**; folhas de alçapão e porta: **3/16** na forma da prévia. O casco usa bandas escalonadas, detalhadas abaixo | Não existe no gerador anterior um parâmetro de espessura normal à superfície. Medir apenas o número de células da linha externa esconderia a espessura horizontal variável dos degraus do bojo. |
| 7. Distância entre estruturas e cavernames | Cinco cavernames principais em Z=−33, −28, −23, −18 e −13: **passo 5**, **vão longitudinal livre 4** | Cada cavername ocupa uma célula de espessura no eixo Z. Travessas de convés usam essas estações. A largura da própria curva varia com o bojo; os valores não são distância entre faces em toda a seção transversal. |
| 8. Área ocupada pelos destroços | **340 blocos²** de projeção real; envelope de dispersão **49 × 43 = 2.107 blocos²** | Os vazios entre fragmentos não são superfície construída. Os destroços ocupam cerca de 16,1% desse retângulo. Todo o conjunto naval, sem gelo, projeta 1.011 blocos² dentro de um envelope 50 × 80. |
| 9. Volume efetivamente preenchido | Naval sem contexto: **2.850,718262 blocos³**; núcleo principal: **1.958,042969**; com gelo/neve: **4.617,593262** | Respectivamente 3.032, 2.097 e 4.849 células. Contar cada célula como um cubo superestima os sólidos porque há lajes, escadas, cercas e folhas. Os números são aproximados a seis casas e incluem proxies declarados. |

**A hipótese 25 × 23 não representa dois eixos horizontais do núcleo.** A boca de 25 foi confirmada; 23 é a altura do projeto incluindo gelo e mastro. O corpo sobrevivente mede 25 × 22 × 33. Para comparar largura e comprimento da seção principal, a referência adequada é **25 × 33**, com profundidade de casco oito. Isso não aprova essas proporções: só impede que a investigação de escala parta de eixos confundidos.

## Área, preenchimento e unidades

| Recorte | Células | Envelope X × Y × Z | Projeção real XZ, blocos² | União de sólidos, blocos³ | Sólidos / volume do envelope |
| --- | ---: | --- | ---: | ---: | ---: |
| Tudo, com contexto | 4.849 | 54 × 23 × 84 | 1.755 | 4.617,593262 | 4,4260% |
| Contexto isolado | 1.817 | 54 × 2 × 84 | 1.755 | 1.766,875 | 19,4761% |
| Construção naval sem contexto | 3.032 | 50 × 22 × 80 | 1.011 | 2.850,718262 | 3,2395% |
| Núcleo principal definido acima | 2.097 | 25 × 22 × 33 | 584 | 1.958,042969 | 10,7881% |
| Casco principal e quilha | 1.073 | 25 × 8 × 33 | 584 | 1.037,75 | 15,7235% |
| Convés principal | 471 | 25 × 1 × 27 | 471 | 455,5 | 67,4815% |
| Paredes da cabine | 220 | 13 × 5 × 11 | 44 | 195,625 | 27,3601% |
| Destroços isolados | 742 | 49 × 9 × 43 | 340 | 712,5 | 3,7573% |

Razões de preenchimento baixas no conjunto espalhado medem principalmente vazios entre peças e interior habitável. Não demonstram, sozinhas, pobreza de detalhe ou erro de projeto. A projeção da cabine isolada também não é sua área útil: mede as paredes, sem piso ou teto. A área útil declarada é 99 blocos². O limite sólido dos destroços tem altura 8,5, porque algumas lajes ocupam só metade da última célula; o envelope de células é nove.

## Espessura do costado e resolução transversal

A seção intacta de estibordo em Z=−23,5 atravessa uma faixa de tábuas entre cavernames. Os comprimentos abaixo são cordas horizontais de material em X, não medidas normais ao costado. Amostras semifechadas não criam falsos vazios na costura entre quadrantes da mesma escada.

| Cota da célula Y | Material no corte a Y+0,25 | Material no corte a Y+0,75 | Leitura geométrica |
| --- | ---: | ---: | --- |
| 2 | 5 | 5 | Piso/bojo junto à quilha; grande degrau horizontal inferior |
| 3 | 3 | 3 | Transição inferior ainda larga |
| 4 | 1,5 | 2 | Cubo interior e escada invertida externa |
| 5 | 2 | 2 | Cinta longitudinal de seção inteira |
| 6 | 1,5 | 2 | Degrau do bojo e escada invertida |
| 7 | 1,5 | 2 | Degrau do bojo e escada invertida |
| 8 | 0,5 | 1 | Borda superior de escada invertida |

O gerador preenche a faixa entre a largura da seção anterior e a atual em cada cota. Essa faixa garante contato, mas **não separa explicitamente pele exterior, nervura interior e forro**. Nas estações marcadas como cavername, as mesmas células da faixa trocam de módulo e material; não é criada uma segunda curva de madeira avançada para dentro do casco. Essa escolha estrutural explica parte da leitura simplificada. Aumentar a escala sem reconstruir essas camadas só tornaria a faixa existente maior.

O perfil anterior tem sete cotas de bojo, Y=2..8, para uma boca de 25. Curvas mais largas ou mais altas precisam ser reamostradas a partir de superfícies e espessuras distintas. Escadas oferecem meios degraus dentro da célula, mas não acrescentam sozinhas uma nova camada anatômica. A boa escala é a que permite distinguir as funções sem transformar o casco em um sólido maciço.

## Hipóteses dimensionais para os estudos

As hipóteses abaixo descrevem a resolução do **núcleo reconstruído**, não um comando para ampliar o modelo reprovado. Comprimento, espessuras e estações dos componentes de demonstração devem ser desenhados por função; não há multiplicação automática das peças de mobiliário.

| Hipótese | Boca × comprimento sobrevivente de referência | Profundidade de casco de referência | O que deve ser possível resolver | Compromisso a medir |
| --- | --- | --- | --- | --- |
| Compacta, perto de 1× | 25 × 33 | 8 | Pele exterior e costelas distinguíveis, ruptura legível sem muitos materiais, piso transitável | Poucas cotas para bojo e inclinações; elementos de uma célula podem dominar a seção |
| Intermediária, perto de 1,5× | 38 × 50 | 12 | Espessura exterior separada do cavername, joelhos, travessas e duas/três profundidades na ruptura | Mais área a preencher; impedir que reparos e cabine cresçam junto por conveniência |
| Ampliada, perto de 2× | 50 × 66 | 16 | Mais estações e mudança de seção, fibras rompidas em vários planos, estrutura inferior de convés complexa | Custo de superfície próximo de 4× se as espessuras forem preservadas; volume perto de 8× somente se tudo, inclusive espessuras, fosse escalado, o que não é recomendado |

Os valores 38 × 35 e 50 × 46 do pedido são exemplos condicionais sobre 25 × 23. Eles continuam úteis como envelopes artísticos a estudar, mas **não são ampliações da largura e do comprimento reais medidos**. A comparação correta deve declarar quais eixos e anatomias mudaram. O alvo de 1,5× é uma hipótese inicial defensável; a escolha final depende das capturas, seções e custo dos novos estudos, não destes números.

## Curadoria de blocos antes da modelagem A B C

As três escalas usam blocos de tamanho real. Nenhuma madeira, porta, barril, escada, laje ou corrente pode ser esticada. Uma nervura de duas células de espessura precisa ser composta por várias células, com estados individuais. Os IDs e domínios abaixo foram confrontados com a curadoria seletiva existente, metadata e assets oficiais fixados em v1.26.60.5; aparência e comportamento no jogo continuam pendentes. A versão Windows observada na pesquisa é 1.26.6301.0; não se assume uma versão mobile.

| Função | Família candidata real | Forma, estados e textura por face | Decisão pré-modelagem |
| --- | --- | --- | --- |
| Quilha e estrutura primária | `dark_oak_log`, `spruce_log`, `stripped_spruce_log` | Cubos de tora, eixo `pillar_axis` x/y/z. Topos e laterais diferentes. Spruce usa log_spruce e log_spruce_top; descascada usa stripped_spruce_log e _top; dark oak usa log_big_oak e _top. | Distinguir longitudinal da quilha, transversal dos vaus e vertical dos montantes. Peças diagonais são aproximações recompostas na malha, não rotações livres de uma tora. |
| Casco exterior | `dark_oak_planks/stairs/slab`, `spruce_planks/stairs/slab` | Texturas planks_big_oak/planks_spruce. Lajes bottom/top; escadas usam direção, inversão e canto. | Escuro na base e zonas protegidas, abeto no costado exposto. Preservar a mesma forma ao variar material. Não tornar toda face rompida clara. |
| Estrutura interna | `stripped_spruce_log`, `oak_log`, tábuas de abeto | Topo de tora só aparece nas extremidades; laterais acompanham fibras. | Relevo interior separado da pele. Onde uma ruptura expõe um cavername, a direção da madeira deve continuar reconhecível. |
| Convés e reparos | `spruce_planks/slab/stairs`, `oak_planks/slab/stairs` | Cubos e meios blocos reais; planks_oak para os reparos. | Carvalho apenas em enxertos e passagem recuperada, sem faixa global arbitrária. Passos de piso têm apoio e altura verificados. |
| Ferragens e amarrações | `iron_chain`, `spruce_fence`, `barrel` | Corrente com eixo x/y/z e sprites chain1/chain2; cerca com quatro conexões booleanas; barril com facing_direction 0..5 e open_bit. | Corrente ortogonal com pontos de ancoragem; cerca não substitui toda costela. Barril real para cabrestante ou carga, com frente utilizável quando funcional. |
| Painéis e extremidades | `spruce_trapdoor`, `dark_oak_trapdoor`, `trapdoor` | Folha 3/16, direction/open_bit/upside_down_bit. `trapdoor` é o ID real do alçapão de carvalho. | Usar folha como tampo, aba ou reforço em sua própria célula, com dobradiça coerente. Não serve para ocultar qualquer borda mal resolvida. |
| Luz e contexto frio | `lantern`, `packed_ice`, `snow_layer` | Lanterna com hanging e sprite nativo; neve height 0..7, covered_bit; gelo compactado em cubos inteiros. | Pequeno contexto ocultável e luz funcional. Não usar shaders ou neve para esconder silhueta. Lanternas e correntes mantêm proxies declarados de contato. |

### Adequação por componente e escala

| Estudo | Compacta | Intermediária | Ampliada | Critério comum antes de aprovar |
| --- | --- | --- | --- | --- |
| **A — Casco íntegro de seção** | Pele de uma célula com escadas/lajes e cavername interior distinto de uma célula. Reduzir adornos para julgar a curva. | Reamostrar bojo com mais cotas. Reservar duas profundidades para pele e nervura, com joelhos e vaus distinguíveis. Peças primárias de 1–2 células quando justificadas. | Mais estações longitudinais e nervuras compostas de duas células em pontos selecionados. Espessura da pele continua específica do projeto, não automaticamente duplicada. | Perfil longitudinal e transversal, casca oca, espessura declarada e contato; fibras corretamente orientadas. Material não pode ser a única diferença entre cavername e casco. |
| **B — Ruptura estrutural** | Dois planos legíveis: pele interrompida e travessa exposta. Poucos reforços de alçapão. | Três profundidades úteis: tábuas exteriores, costelas e viga/forro interior. Dentes de ruptura em alturas e comprimentos diferentes, seguindo fibras e função. | Fragmentos parcialmente ligados e nervuras quebradas em várias estações, preservando identificação da anatomia original. Partes largas são recompostas, não deformadas. | A ferida não é ruído, nem um plano de corte uniforme. Cada ponta tem função, direção e apoio/intenção. Testar com materiais neutros e depois com a paleta contextual. |
| **C — Convés danificado** | Contorno derivado do casco, vaus transversais e tábuas longitudinais; um toco de mastro ou encaixe reconhecível. | Expor vigas inferiores, encaixes e uma faixa de tábuas recuperadas em outro nível; carvalho usado nos reparos localizados. | Estrutura inferior completa e deformações recompostas com vários elementos reais, sem engrossar igualmente toda a prancha. Mobiliário continua na escala do jogador. | Mesmo sem barris e lanternas, o fragmento deve ser naval, não um retângulo de píer. Inspecionar por baixo, por cima e em corte, com piso apoiado. |

O Palette Engine anterior usa `wet = b.y <= 4`, uma cota mundial fixa. Para novos estudos em escalas distintas, uma faixa de umidade/envelhecimento deve referir-se à linha de contato e à anatomia local do componente, registradas nos parâmetros. Alterar a escala e manter o limiar mundial não constitui uma comparação controlada de desgaste. `fracture` existe nos metadados do modelo anterior, mas não dirige atualmente a escolha do ID material; portanto a cor da madeira rompida ainda precisa de uma regra explícita, sem pulverização aleatória.

## Recursos recentes de frio e limites de disponibilidade

O simples `calcite`, `packed_ice`, `blue_ice`, `snow` e `snow_layer` são escolhas estáveis da base adotada. Packed Ice Bricks e Snow Bricks foram introduzidos nas Preview 26.70.21 e 26.70.22. Calcite Stairs/Slab/Wall, Polished Calcite e famílias de tijolos/pilares aparecem na Preview 26.70.23. Brittle Ice permanece recurso Preview nas fontes consultadas. Nenhum deles é necessário aos estudos navais.

`ice_crystal` e `icicle` exigem uma distinção adicional: já aparecem na release 26.60 sob **Experimental Game Drops Features / Drop 4 of 2026**. Existirem no binário e no índice de IDs não os torna blocos estáveis do Survival comum. Todos esses candidatos recentes ficam fora da implementação estável dos estudos. Não foram inventados IDs, receitas ou texturas para famílias Preview.

Fontes oficiais consultadas na pesquisa, em 11/11/2026:

- [Mojang Bedrock Samples v1.26.60.5 — metadata](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json).
- [Texturas e referências de bloco da mesma tag](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json).
- [Listagem oficial Bedrock](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/vanillalistingsreference/blocks).
- [Bedrock 26.60, de 27/10/2026](https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog).
- [Preview 26.70.21](https://www.minecraft.net/en-us/article/minecraft-preview-26-70-21).
- [Preview 26.70.22](https://www.minecraft.net/en-us/article/minecraft-preview-26-70-22).
- [Preview 26.70.23, de 03/11/2026](https://feedback.minecraft.net/hc/en-us/articles/50103892132365-Minecraft-Beta-Preview-26-70-23).
- [Preview 26.70.24, de 10/11/2026](https://feedback.minecraft.net/hc/en-us/articles/50285693907213-Minecraft-Beta-Preview-26-70-24).

## Decisão que estes dados permitem

Há evidência de uma boca compacta de 25 e apenas oito níveis de profundidade no casco anterior. Isso sustenta **testar** maior resolução, mas não prova que o modelo foi reprovado somente pela escala. A falta de camadas anatômicas separadas, a cabine retangular e a distribuição dos fragmentos são escolhas de modelagem e composição que sobreviveriam a uma ampliação literal. A recomendação prévia é ensaiar 1×, aproximadamente 1,5× e 2× com a anatomia reconstruída, medindo superfície/volume/contato e observando vistas equivalentes. A escala intermediária só deve ser escolhida se produzir detalhe estrutural útil e mantiver custo e habitabilidade aceitáveis.

Esta nota não aprova um novo naufrágio completo nem uma nova publicação. Os dados canônicos anteriores, estados e formas ficaram preservados. A validação de atualização de vizinhança, colisão do jogador, gravidade, interação e colocação no Minecraft Bedrock continua separada da análise documental e algorítmica.
