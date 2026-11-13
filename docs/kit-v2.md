# Biblioteca de kitbashing 0.2

A referência 1 do Pinterest mostra um ritmo de pilares escuros, fustes estreitos, articulações salientes e uma travessa contínua. O recorte permite reconhecer o ritmo, a profundidade relativa e a alternância de seções. Identificar cada bloco, pack e face oculta seria uma inferência. Na colunata autoral, o agente escolhe conscientemente bigornas, muros e escadas. A referência 10 acrescenta uma questão prática: uma sequência cromática pode existir em cubos, mas perder continuidade ao pedir uma grade, uma dobradiça ou uma seção estreita. O gerador preserva a família de forma da peça que exerce essa função.

A versão 0.1 descrevia cinco formas nativas, com um construtor dedicado ao telhado. O nome de uma peça e uma cor de material não definiam uma biblioteca de componentes, pontos de conexão ou restrições físicas para objetos utilitários. As unidades abaixo são reutilizáveis em outros projetos pelo núcleo, independentemente da câmera do estúdio.

## Componentes autorais

| ID | Dimensões padrão X × Y × Z | Células | Construção e variações |
| --- | --- | ---: | --- |
| `colonnade` | 11 × 8 × 3 | 58 | Duas aberturas. O rodapé contínuo amarra três apoios, o muro produz o fuste e uma bigorna sobre um bloco inteiro produz o capitel. A verga liga os capitéis por consolos de escadas invertidas. O material da moldura varia entre pedra-negra e mangue. O corpo escuro do metal dá continuidade à articulação. |
| `lantern` | 3 × 6 × 3 | 18 | O funil desemboca sobre o apoio central e alarga sua seção até o corpo da luminária. Quatro alçapões de bambu abraçam a lanterna do mar em células distintas. A cúpula tem escadas invertidas em balanço nas quatro faces. |
| `crest` | 7 × 4 × 3 | 18 | Duas rampas de escadas convergem para um caldeirão. A coroa apoia-se na borda e recebe a haste do End. A concavidade do caldeirão continua inspecionável ao isolar o módulo do fuste. |
| `finial` | 1 × 3 × 1 | 3 | Um cubo na origem sustenta uma bigorna, cuja mesa recebe uma haste. O pináculo cabe num encaixe de cumeeira com uma célula de seção. A variação altera o pedestal. |

`kitComponents` descreve categoria, função, dimensões de referência, restrições, orientações, paletas e pontos de conexão. `placeKit(id, options)` retorna as células já posicionadas, os módulos e etapas, o inventário, os limites inclusivos e os pontos de conexão já transformados. As faces seguem +X leste, +Z sul. Primeiro atua o espelho local de X/Z, depois os quartos de volta e por fim a translação. Em `colonnade`, `span` aceita 4 a 8 blocos e `bays` 1 a 4 vãos. O gerador reconstrói os apoios em coordenadas inteiras. Os demais componentes têm seções fixas.

```js
import {placeKit} from '../architect/v2/kit.mjs';
const colunas = placeKit('colonnade', {
  variation:'timber', span:5, bays:3, turns:1, mirrorX:true, origin:[0,0,0]
});
const topo = placeKit('finial', {origin:[0,18,9]});
```

## Curadoria Bedrock

A versão alvo dos IDs, chaves de textura e estados é v1.26.60.5. Os seis nomes também foram localizados nos pacotes vanilla do Bedrock Windows instalado 1.26.6301.0, incluindo a chave visual legada `seaLantern`. Verificaram-se os 12 arquivos PNG de textura utilizados pelas novas peças. O atlas carrega a fonte oficial no navegador. [Estados por ID](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json) · [Definições das faces](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json) · [Atlas](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json) · [Valores de orientação no Bedrock](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockstateandtraitlistings?view=minecraft-bedrock-stable)

Os nomes seguintes correspondem a PNGs sob `textures/blocks/`. As medidas estão em dezesseis avos de célula.

| ID com prefixo minecraft | Silhueta, orientação e texturas | Restrição do protótipo |
| --- | --- | --- |
| `anvil` | Base 12 × 4 × 12; colar, garganta e mesa 10 × 6 × 16. Estado `minecraft:cardinal_direction`. Corpo `anvil_base`; só o topo da mesa usa `anvil_top_damaged_0`. | Bigorna intacta. Cada peça tem um cubo ou tora imediatamente abaixo para garantir apoio durante a montagem. A queda e a interface de reparo pertencem ao jogo. |
| `cauldron` | Pés nos quatro cantos, paredes de 2 e fundo interno a Y=4. `cauldron_bottom`, `cauldron_side`, `cauldron_top` e `cauldron_inner` nas respectivas superfícies. | A demonstração usa `cauldron_liquid=water`, `fill_level=0`. O catálogo conhece os domínios do jogo. Níveis preenchidos são rejeitados pela geometria deste estudo. Chuva e interações podem mudar o estado no jogo. |
| `hopper` | Aro de 2, fundo interno a Y=11, corpo de 8 × 6 × 8 e bocal de seção 4 × 4. `hopper_top` no aro, `hopper_inside` no fundo, `hopper_outside` na carcaça. | O bocal aceita baixo e quatro direções horizontais. O estudo mantém o funil vazio. A coleta, transferência, inventário e bloqueio por redstone exigem o motor do jogo. [Descrição da Mojang](https://www.minecraft.net/en-us/article/hopper) |
| `end_rod` | Colar de 4 × 1 × 4 e haste de 2 × 15 × 2. Orientável em seis direções. O mapeamento usa as duas ilhas de UV do sprite `end_rod`. | Corpo luminoso no Bedrock. A propagação de luz e partículas ainda precisam de validação em jogo. |
| `polished_blackstone_brick_wall` | Poste central de 8 × 16 × 8. Cada braço tem largura 6, altura 14 ou 16, com decisão independente por face. Mesma textura `polished_blackstone_bricks` em todas as faces. | O fuste isolado usa poste ligado e quatro braços ausentes. Conexões dependem de vizinhança no jogo. A biblioteca transforma os quatro estados ao girar e espelhar. |
| `sea_lantern` | Cubo de 16 × 16 × 16. Todas as faces usam `sea_lantern`. | O atlas recorta o primeiro quadro do PNG 16 × 80. O sprite tem autoemissão aproximada na prévia; a propagação espacial e a animação continuam pendentes de comparação no jogo. [Descrição da Mojang](https://www.minecraft.net/en-us/article/block-week-sea-lantern) |

A edição Bedrock disponibiliza IDs, estados e texturas, mas o pacote vanilla consultado não expôs as malhas internas dessas peças em JSON. Para medir seções, consultei localmente os modelos oficiais Java 26.3 de bigorna, caldeirão, funil e haste. O recurso foi usado como referência dimensional. Comparei os 12 sprites RGBA integralmente com os correspondentes Bedrock da tag alvo. Os pixels e dimensões coincidiram nos 12 pares. Essa comparação verifica a fonte de textura; a correspondência exata de UVs, silhuetas e faces na edição Bedrock ainda depende de cenas pareadas no jogo. A implementação guarda dimensões e estados, sem distribuir os modelos ou as imagens oficiais.

## Validação e limites

O validador verifica coordenadas inteiras e únicas, domínios de estado, existência dos módulos, apoio da bigorna e dobradiças. A continuidade exige contato de área positiva entre superfícies ocupadas. Um teste coloca a base estreita da haste sobre a boca vazia de um caldeirão: as células são vizinhas, mas as faces não se tocam e a composição é rejeitada. Os mesmos sólidos em dezesseis avos permitem testar mudanças de orientação. Eles descrevem o contato material da prévia. As caixas de colisão do jogo, o movimento de entidades, gravidade, fluxo de itens, água, luz e atualização de vizinhos são verificações posteriores.

Cinco testes em `tests/kit-v2.test.mjs` exercitam quatro componentes, duas paletas, quatro rotações e duas posições de espelho X (64 composições), vãos reconstruídos, ocupação dos aros, UVs da haste e regressões de montagens inválidas. Quatro testes do renderizador 0.1 passaram após a extensão de formas. Na comparação visual, inspecione o fuste na vista frontal, o recuo dos consolos na lateral e os vazios do caldeirão e do funil na superior. A versão 0.2 usa a aparência texturizada e iluminação de prévia do estúdio. A caixa de seleção de um bloco representa a célula para inspeção.

Para evoluir, priorize uma revisão Bedrock dos três encontros decisivos: mesa da bigorna com haste, aro do funil com corpo luminoso e orientação da dobradiça. Em seguida, novas peças poderão declarar apoios próprios e gerar estudos com a mesma transformação de estado. Uma variação de escala requer recompor módulos em células distintas.
