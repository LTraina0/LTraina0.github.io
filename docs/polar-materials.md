# Curadoria de materiais da ambientação polar

A composição segue as capturas da Parte II de Creeping Winter. São visíveis paredes cinza escuras sob neve, bancadas azuladas de gelo, caminhos de madeira e pequenos focos quentes. A leitura desses materiais é referência de composição. As imagens não determinam IDs, resource pack ou shader.

A seleção foi confrontada com `mojang-blocks.json`, `blocks.json` e `terrain_texture.json` oficiais do tag Bedrock `v1.26.60.5`. Em 11/11/2026, os dez sprites básicos retornaram HTTP 200 e assinatura PNG válida. As famílias abaixo são vanilla estáveis estabelecidas. A presença de outros recursos no metadata da mesma versão não autoriza empregar famílias experimentais.

| Função | IDs Bedrock | Forma, estado e faces |
|---|---|---|
| Rocha exposta | `minecraft:stone`, `minecraft:andesite`, `minecraft:cobblestone`, `minecraft:cobbled_deepslate` | Cubos integrais sem estados. Textura única por família nas seis faces. Andesito usa `stone_andesite.png`; ardósia fragmentada usa `deepslate/cobbled_deepslate.png`. |
| Bancadas e degraus | `minecraft:andesite_stairs`, `minecraft:andesite_slab` | Escadas com `minecraft:corner`, `upside_down_bit`, `weirdo_direction`; lajes com `minecraft:vertical_half`. Textura de andesito em todas as faces. |
| Ruína escura | `minecraft:stone_bricks`, `minecraft:stone_brick_stairs`, `minecraft:stone_brick_slab` | Catálogo existente. `stonebrick.png`; cubo, escadas e meia célula conforme estados nativos. |
| Veio mineral | `minecraft:calcite` | Cubo sem estados. `calcite.png` em todas as faces. Reservar para pontos geológicos, evitando estrias brancas regulares. |
| Massa glacial | `minecraft:packed_ice`, `minecraft:blue_ice` | Cubos sem estados. `ice_packed.png` e `blue_ice.png`; aparência opaca do sprite oficial. |
| Canal congelado | `minecraft:ice` | Cubo sem estados. `ice.png` com alfa do PNG e material translúcido do visualizador. |
| Acúmulo de neve | `minecraft:snow`, `minecraft:snow_layer` | Neve integral e camada de 2 a 16/16, respectivamente. Camada com `height` de 0 a 7 e `covered_bit` booleano. `snow.png` nas faces. |

As formas escolhidas preservam células e dimensões vanilla. Pontas e massas de gelo devem ser compostas por cubos reais em posições distintas. A deposição de neve requer suporte e espaço desocupado, mantendo a geometria naval de origem.

O canal desta composição é gelo. Derretimento, recongelamento, fluido, propagação de luz e navegação dentro do Bedrock ainda exigem ensaio no jogo. A transparência exibida usa o sprite oficial, enquanto a iluminação da prévia pertence ao BuildsMine.

A matriz detalhada de IDs, estados, faces e verificações está em `architect/v3/bedrock-evidence.json`. A procedência do navio aprovado permanece independente das células ambientais.

[Catálogo de blocos Mojang](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json) · [Mapeamento visual oficial](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json) · [Atlas de texturas](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json)
