# Catálogo do protótipo de telhados

O catálogo do agente fixa os dados de Bedrock em **v1.26.60.5**, a mesma referência de textura da Casa de Bambu. Em 11/11/2026, a comparação com a tag oficial confirmou 15 IDs, seus nomes em português, todos os domínios de estados, 45 referências de face e nove PNGs distintos de 16 × 16. No pacote Windows instalado (1.26.6301.0), uma leitura dos arquivos de definição, idioma e atlas dos pacotes vanilla também encontrou os 15 nomes de bloco e as nove chaves de imagem. O esquema completo dos estados foi conferido na tag. [Dados de estados](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json) · [Definições por face](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json) · [Atlas](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json) · [Nomes oficiais](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/texts/pt_BR.lang).

## Paleta e procedência

O primeiro telhado é um projeto autoral orientado pelo briefing. As escolhas de material, escala, ornamento e cor são de projeto. Todos os IDs da tabela recebem o prefixo `minecraft:`. Cada chave de imagem é um caminho relativo a `textures/blocks/`, com extensão `.png`. A coluna de textura vale para todas as faces, exceto onde se indica topo e base.

| ID | Material em Sobrevivência | Forma | Textura | Aplicação prevista |
| --- | --- | --- | --- | --- |
| stripped_mangrove_log | Tora de Mangue Descascada | Tora orientável | stripped_mangrove_log_side, topo e base stripped_mangrove_log_top | Pilares e vigas |
| mangrove_planks | Tábuas de Mangue | Cubo | mangrove_planks | Travessas |
| mangrove_stairs | Escadas de Mangue | Escada | mangrove_planks | Consolos |
| bamboo_planks | Tábuas de Bambu | Cubo | bamboo_planks | Preenchimento de frontões |
| bamboo_trapdoor | Alçapão de Bambu | Alçapão | bamboo_trapdoor | Painéis vazados |
| deepslate_bricks | Tijolos de Ardosiabissal | Cubo | deepslate/deepslate_bricks | Cobertura mineral |
| deepslate_brick_stairs | Escadas de Tijolos de Ardosiabissal | Escada | deepslate/deepslate_bricks | Águas e arremates |
| deepslate_brick_slab | Laje de Tijolos de Ardosiabissal | Laje | deepslate/deepslate_bricks | Beirais |
| polished_blackstone_bricks | Tijolos de Pedra-Negra Polida | Cubo | polished_blackstone_bricks | Alternativa mineral escura |
| polished_blackstone_brick_stairs | Escadas de Tijolos de Pedra-Negra Polida | Escada | polished_blackstone_bricks | Águas da alternativa escura |
| polished_blackstone_brick_slab | Laje de Tijolos de Pedra-Negra Polida | Laje | polished_blackstone_bricks | Beirais da alternativa escura |
| waxed_oxidized_cut_copper | Cobre Lapidado Oxidado Encerado | Cubo | oxidized_cut_copper | Cumeeira ou cobertura verde |
| waxed_oxidized_cut_copper_stairs | Escada de Cobre Lapidado Oxidado Encerado | Escada | oxidized_cut_copper | Curvas em cobre |
| waxed_oxidized_cut_copper_slab | Laje de Cobre Lapidado Oxidado Encerado | Laje | oxidized_cut_copper | Acabamentos em cobre |
| waxed_cut_copper | Cobre Lapidado Encerado | Cubo | cut_copper | Arremate de cobre alaranjado |

As quantidades são de peças colocadas. Uma escada conta como uma escada e uma laje conta como uma laje. O cálculo de matérias-primas para uma receita específica depende da rota de fabricação. A fonte de verdade para o catálogo e seus domínios está em `architect/registry.mjs`.

## Estados e orientação

| Forma | Propriedades e valores permitidos |
| --- | --- |
| Cubo | Nenhuma |
| Tora | `pillar_axis` = y, x ou z. As extremidades acompanham o eixo da tora. |
| Laje | `minecraft:vertical_half` = bottom ou top. Ocupa oito dos dezesseis pixels de altura. |
| Escada | `weirdo_direction` = 0, 1, 2, 3. A metade alta aponta para leste, oeste, sul ou norte, respectivamente. `upside_down_bit` = false ou true. `minecraft:corner` = none, inner_left, inner_right, outer_left ou outer_right. |
| Alçapão | `direction` = 0, 1, 2, 3. Quando aberto ocupa a parede oeste, leste, norte ou sul da própria célula, respectivamente. `open_bit` e `upside_down_bit` são booleanos. |

Os eixos adotados são X positivo para leste e Z positivo para sul. Um espelho inverte a lateralidade dos cantos das escadas. A rotação vertical conserva a lateralidade e troca eixos horizontais dos troncos a cada quarto de volta. A documentação genérica de `direction` reúne vários blocos. Para um alçapão, a posição da folha aberta precisa ser distinguida da orientação codificada. O visualizador original do BuildsMine explicita essa convenção em `src/scripts/geometry.js`. Há uma confirmação independente no decodificador e na geometria do PocketMine, uma implementação do protocolo Bedrock. Uma confirmação dentro do jogo continua sendo uma etapa futura. [Documentação dos estados](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockstateandtraitlistings?view=minecraft-bedrock-stable) · [Decodificação](https://github.com/pmmp/PocketMine-MP/blob/stable/src/data/bedrock/block/convert/BlockStateDeserializerHelper.php) · [Geometria de alçapões](https://github.com/pmmp/PocketMine-MP/blob/stable/src/block/Trapdoor.php).

**Confiança.** IDs, estados, nomes e resolução das imagens foram conferidos em arquivos oficiais. As funções arquitetônicas são escolhas do projeto. A representação no navegador depende do carregamento das texturas, das UVs e da geometria do adaptador. Nenhuma imagem oficial é distribuída pelo registro.
