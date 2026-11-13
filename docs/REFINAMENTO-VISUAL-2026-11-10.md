# Refinamento visual — 10/11/2026

Esta revisão substitui as descrições de renderização anteriores; posições, IDs e estados continuam definidos pela estrutura extraída. As imagens do usuário comprovam o aspecto do visualizador, sem comprovar a aparência exata no Bedrock.

## Diagnóstico e escolhas

- Escadas do inventário herdavam o primeiro estado colocado (inclusive canto externo e invertido). O ícone passa a usar escada reta normal; a malha colocada continua preservando seu estado real. Lajes do inventário usam metade inferior; pilares, eixo Y. Confiança alta: defeito reproduzível pelo código e estados da estrutura.
- A grade de passo 1 estava centrada em X 8,5 / Z 29,5, deslocando suas linhas meio bloco. Centro corrigido para X 8 / Z 29: todas as linhas agora coincidem com bordas inteiras de células.
- Os ícones recebiam iluminação intensa e ACES, alterando cores. Passam a 96×96, sem antialias ou tone mapping, com sombreamento por face (topo 1, lados 0,8/0,6, base 0,5) e ampliação pixelada. Sprites oficiais continuam usados para lanterna, corrente e sino.
- A luz local usava apenas seis lanternas, sem oclusão. A revisão usa todas as fontes visíveis (lanterna, tocha e luz de fungo) em campo estático de meio bloco, com decaimento e bloqueio por cubos e partes ocupadas de lajes/escadas. Cortes e etapas recalculam fontes e ocupação. Materiais com recortes alfa transmitem luz nesta aproximação. Não é o algoritmo de luz, ambient occlusion ou volumetria atmosférica do Bedrock.
- A luz direcional continua com mapa de sombras. Uma oclusão ambiente aproximada escurece junções ocupadas na mesma malha de meio bloco; a máscara emissiva da tocha exclui o cabo de madeira. Dia/noite usam iluminação e fundos graduais distintos; os pixels de textura não recebem o antigo tone mapping. Nenhum feixe volumétrico é inventado.
- O contorno passa a seguir a geometria da peça. Clique/toque fixa a inspeção; Escape e botão de limpar desfazem. Vazados continuam fora da seleção. Esta revisão trata a interação de inspeção, sem simular abertura de alçapão, crafting ou som do sino.
- Bordas em relevo, slots, controles e cores do inventário estendem-se à página, com desenho CSS próprio.

## Materiais conferidos

| Família / IDs Bedrock | Textura por face | Forma e fonte | Confiança / limite |
| --- | --- | --- | --- |
| `minecraft:mud_bricks`, `mud_brick_stairs`, `mud_brick_slab`, `mud_brick_wall` | `blocks/mud_bricks.png`, todas as faces; recorte UV 16 px/bloco | Cubo, escada com direção/inversão/canto, laje com metade, muro conectado. Estrutura + Mojang samples v1.26.60.5. | Alta no ID/arquivo; equivalência de renderização não verificada dentro do jogo. Não se substitui barro por terracota. |
| Bambu, bétula e mosaico | `bamboo_planks`, `planks_birch`, `bamboo_mosaic`; pilares com `bamboo_block[_top]` e `stripped_bamboo_block[_top]` | Estados extraídos e UVs recortadas por face. Fonte oficial na mesma tag. | Alta no mapeamento; iluminação web aproximada. |
| Alçapão, corrente, andaime | `bamboo_trapdoor.png`, `chain1/2.png`, `scaffolding_{side,top,bottom}.tga` | Recorte alfa, orientação e dimensões parciais. | Transparência testável; detalhes de malha não comparados no jogo. |
| Lanterna, tocha, luz de fungo | `lantern.png`, `torch_on.png`, `shroomlight.png` | Fontes de luz consideradas em cada etapa; emissão da lanterna restringida aos pixels quentes da imagem. | Emissão e propagação são aproximações visuais. |

Fonte externa: https://github.com/Mojang/bedrock-samples/tree/v1.26.60.5/resource_pack/textures . Nenhum asset oficial foi copiado para o pacote publicado. A instalação local foi consultada em leitura: versão 1.26.6301.0; não foram encontradas imagens avulsas de barro em seus resource packs, portanto não se afirma igualdade de hash com a versão instalada. A estrutura foi extraída de 1.26.63.1; a tag pública adotada é 1.26.60.5.

As páginas Trading/Bloco/Item indicadas pelo usuário permanecem referências; a ferramenta web recusou a leitura nesta revisão. Não foram usadas para inventar regras ou materiais.

## Validação

- `python verificar-modelo.py`: arquivo, hash, dimensões, 772 posições, IDs e estados correspondem à estrutura original.
- `node tests/block-light.test.mjs`: quatro verificações de bloqueio por parede, propagação em área livre, remoção da parede e remoção da fonte.
- Chromium 1440×900 e emulação móvel 390×844: 26 verificações gerais passaram (80 estados com geometria/UVs finitas; 23 ícones/texturas sem falha; contagens das quatro partes; sete vistas; cortes/progressão; transparência no picking; inventário/Escape; toque; responsividade; repouso sem render contínuo; console sem erros).
- Oito verificações específicas passaram: escada de inventário reta/normal com volume 0,75; grade em bordas inteiras; 21 fontes (11 lanternas, 5 tochas, 5 luzes de fungo); seleção fixada, persistência ao mover ponteiro, contorno por peça e Escape; alternância dia/noite reversível.
- Capturas de dia, noite, grade e inventário inspecionadas visualmente. Quadro completo observado: 23 chamadas, 11.660 triângulos (inclui o fundo); atualização de corte de 400 blocos em ~39 ms nesta sessão. Não é medição de FPS ou desempenho no dispositivo do usuário.
- `npm run build`: passou; permanece o aviso de bundle acima de 500 kB (~140 kB gzip), majoritariamente Three.js.

Nenhum mundo ou resource pack instalado foi alterado. Não houve comparação dentro do renderer Bedrock nem teste em celular físico. Sons, mecanismos e abertura dos alçapões não foram implementados nesta revisão.

## Correção de luminosidade após retorno do usuário

O usuário considerou os dois modos escuros. Calibração ajustada sem trocar imagens, geometrias ou estados: preenchimento hemisférico diurno de 0,75 para 2,1 com chão mais neutro/claro; luz direcional de 1,1 para 1,9. Noite: preenchimento de 0,55 para 1,35, luz direcional de 0,35 para 0,55 e base de cor por vértice mais clara. A contribuição quente local permanece com oclusão. O escurecimento máximo nas junções caiu de 34% para 22%.

Comparação Chromium 1440×900, mesmo enquadramento completo, render isolado do modelo sem fundo/piso: luminância média dos pixels visíveis (escala 0–255) de 78,30 para 126,55 no dia e de 51,78 para 86,93 na noite. Percentil 10 subiu de 43,04 para 78,66 e de 27,90 para 54,32, respectivamente. Isso verifica a elevação de brilho e leitura das regiões escuras nessa captura; não mede a percepção no monitor do usuário. Build e verificação da estrutura original passaram. Nenhuma alteração de interface, ícones ou regras de propagação foi necessária.

## Ambientação e aproximação noturna

Refinamento solicitado para os dois modos, mantendo a claridade recuperada. A intervenção é no ambiente do visualizador: fundo gradual com horizonte suave, estrelas discretas à noite, luz lateral fria de preenchimento e halo pequeno em torno das lanternas. O halo respeita o depth test, os cortes e as etapas; não substitui a propagação com oclusão nem representa um novo bloco. Sem alteração de IDs, estados, geometrias colocadas ou imagens de materiais. As capturas finais serão feitas diretamente do WebGL, sem retoque, incluindo aproximação de lanternas e barro.

Validação da ambientação: build aprovado; as 26 verificações gerais de desktop/emulação móvel, as quatro de propagação e a conferência das 772 células originais passaram. Os seis halos do recorte Casa correspondem às seis lanternas visíveis; ao zerar a montagem, instâncias e efeito ficam ocultos. Depth test habilitado e nenhum erro de shader/página/console observado. Quadro completo: 24 chamadas e 11.682 triângulos; repouso permanece sem render contínuo. Capturas reais de dia, noite e detalhe das lanternas preservadas em `output/ambientacao-casa-bambu-2026-11-10/`. É ambientação do visualizador, sem nova comparação dentro do Bedrock.

## Noite fria com lanternas em destaque

Retorno: a noite ainda parecia dia com fundo escuro. Ajuste somente noturno: preenchimento e recorte em azul, adaptação de saturação de 28% aplicada no shader antes da cor por vértice, e queda da contribuição quente mais rápida (0,65 por bloco, antes 0,8). Aumentou-se a contribuição quente próxima à fonte e a emissão/halo da lanterna, preservando o bloqueio de luz pelos sólidos e a visibilidade por etapas. Texturas e ícones originais permanecem intactos. A iluminação é uma aproximação visual, não uma reprodução certificada do Bedrock.

Conferência no mesmo enquadramento 1440×1000: luminância média (0–255) em três recortes estáveis passou de 95,4 para 98,4 no beiral, 113,0 para 126,1 na parede e 76,1 para 79,8 no barro; o azul ganhou presença e o dourado deixou de dominar as superfícies distantes. A captura diurna foi 100% idêntica, pixel a pixel. Build aprovado, ausência de erros de shader/página/console na aproximação e halos correspondentes às lanternas visíveis; ao zerar a montagem, halos ocultos. As 26 verificações gerais de desktop/emulação móvel passaram novamente.

## Equilíbrio entre cor dos materiais e sombras frias

Usuário confirmou que o contraste das lanternas ficou bom, mas o bambu perdeu o dourado. Adaptação noturna reduzida de 28% para 12%; iluminação principal mais neutra, mantendo preenchimento e recorte frios. O componente azul da cor por vértice agora cresce nas regiões afastadas da luz local e diminui perto dela. A queda curta, emissão e halo das lanternas foram preservados.

Conferência no mesmo enquadramento: RGB médio do beiral mudou de (89,7; 101,2; 96,3) para (96,6; 101,2; 69,5), recuperando amarelo sem elevar o verde; barro de (84,4; 77,7; 87,4) para (93,8; 77,6; 68,0), recuperando marrom. Captura diurna continua 100% idêntica. Build e teste da aproximação passaram, com texturas carregadas, zero erros de shader/página/console, seis halos para seis lanternas no recorte e nenhum halo quando a montagem é zerada. Sem alteração de geometria, IDs, estados ou arquivos de textura.
