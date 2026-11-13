# BuildsMine — integração das três versões do Portal Escarlate

Modelos autorais preservados, não uma nova interpretação das referências. Casa de Bambu permanece intacta. A integração reutiliza a malha, UVs, inspeção, circuito, temporizadores, pistões e modos de serviço do visualizador Portal Escarlate. A interface externa permanece a da Casa de Bambu. A execução no navegador é a simulação interativa existente; não é um novo teste de física dentro do Bedrock.

## Proveniência

- 1.0.3 · Fachada original: 4550 células; dimensão [65, 27, 17]; SHA-256 `df7f5d4992ec62e458b902302a859804e71f8c54d54ae973f90c59520dcf5582`.
- 2.3.0 · Fachada · botões e circuito subterrâneo: 6792 células; dimensão [89, 29, 25]; SHA-256 `398e108b2fca2985bae41c926cdfa3b004bda70c6d81db7f75c7fe0d45fbad7b`.
- 2.4.0 · Pátio completo · fachada 2.3.0: 15897 células; dimensão [89, 29, 73]; SHA-256 `31ed6cf6e23c130a3869cca53e26ba6fb2472d8affe4b09b907cbe3f30655a5a`.

Motor de origem: `sites/portal-escarlate/dist/preview.js`, SHA-256 `895281935790b3e482b1807502fc601e875b499fff5949f99f4951e389f075ed`. Adaptações na cópia: caminhos locais, enquadramento sem os painéis legados, vista inferior e API de integração. Lógica de redstone preservada.

## Materiais, formas e estados

Fonte do catálogo e imagens externas: Mojang/bedrock-samples v1.26.50.4, conforme o catálogo original. Imagens oficiais não são incluídas na publicação. Formas nativas em 1/16: cubos, eixos dos troncos, lajes, escadas/cantos, alçapões, grades com alfa, correntes, lanternas e componentes de redstone.

| ID Bedrock | Nome | Faces oficiais | Confiança |
| --- | --- | --- | --- |
| `minecraft:stripped_mangrove_log` | Tronco de mangue descascado | down: `textures/blocks/stripped_mangrove_log_top`; side: `textures/blocks/stripped_mangrove_log_side`; up: `textures/blocks/stripped_mangrove_log_top` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_planks` | Tábuas de mangue | side: `textures/blocks/mangrove_planks`; up: `textures/blocks/mangrove_planks`; down: `textures/blocks/mangrove_planks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_stairs` | Escadas de mangue | side: `textures/blocks/mangrove_planks`; up: `textures/blocks/mangrove_planks`; down: `textures/blocks/mangrove_planks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_slab` | Lajes de mangue | side: `textures/blocks/mangrove_planks`; up: `textures/blocks/mangrove_planks`; down: `textures/blocks/mangrove_planks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_trapdoor` | Alçapão de mangue | side: `textures/blocks/mangrove_trapdoor`; up: `textures/blocks/mangrove_trapdoor`; down: `textures/blocks/mangrove_trapdoor` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:red_nether_brick` | Tijolos vermelhos do Nether | side: `textures/blocks/red_nether_brick`; up: `textures/blocks/red_nether_brick`; down: `textures/blocks/red_nether_brick` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:red_nether_brick_stairs` | Escadas de tijolos vermelhos do Nether | side: `textures/blocks/red_nether_brick`; up: `textures/blocks/red_nether_brick`; down: `textures/blocks/red_nether_brick` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:red_nether_brick_slab` | Lajes de tijolos vermelhos do Nether | side: `textures/blocks/red_nether_brick`; up: `textures/blocks/red_nether_brick`; down: `textures/blocks/red_nether_brick` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:deepslate_bricks` | Tijolos de ardósia | side: `textures/blocks/deepslate/deepslate_bricks`; up: `textures/blocks/deepslate/deepslate_bricks`; down: `textures/blocks/deepslate/deepslate_bricks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:deepslate_brick_stairs` | Escadas de tijolos de ardósia | side: `textures/blocks/deepslate/deepslate_bricks`; up: `textures/blocks/deepslate/deepslate_bricks`; down: `textures/blocks/deepslate/deepslate_bricks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:deepslate_brick_slab` | Lajes de tijolos de ardósia | side: `textures/blocks/deepslate/deepslate_bricks`; up: `textures/blocks/deepslate/deepslate_bricks`; down: `textures/blocks/deepslate/deepslate_bricks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:polished_deepslate` | Ardósia polida | side: `textures/blocks/deepslate/polished_deepslate`; up: `textures/blocks/deepslate/polished_deepslate`; down: `textures/blocks/deepslate/polished_deepslate` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:polished_deepslate_slab` | Lajes de ardósia polida | side: `textures/blocks/deepslate/polished_deepslate`; up: `textures/blocks/deepslate/polished_deepslate`; down: `textures/blocks/deepslate/polished_deepslate` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:waxed_chiseled_copper` | Cobre talhado encerado | side: `textures/blocks/chiseled_copper`; up: `textures/blocks/chiseled_copper`; down: `textures/blocks/chiseled_copper` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:waxed_oxidized_copper_grate` | Grade de cobre oxidado encerada | side: `textures/blocks/oxidized_copper_grate`; up: `textures/blocks/oxidized_copper_grate`; down: `textures/blocks/oxidized_copper_grate` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:waxed_copper_trapdoor` | Alçapão de cobre encerado | side: `textures/blocks/copper_trapdoor`; up: `textures/blocks/copper_trapdoor`; down: `textures/blocks/copper_trapdoor` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:waxed_copper_chain` | Corrente de cobre encerada | side: `textures/blocks/copper_chain1`; cross: `textures/blocks/copper_chain2` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:spruce_trapdoor` | Alçapão de pinheiro | side: `textures/blocks/spruce_trapdoor`; up: `textures/blocks/spruce_trapdoor`; down: `textures/blocks/spruce_trapdoor` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:cobblestone` | Pedregulho | side: `textures/blocks/cobblestone`; up: `textures/blocks/cobblestone`; down: `textures/blocks/cobblestone` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mossy_cobblestone` | Pedregulho com musgo | side: `textures/blocks/cobblestone_mossy`; up: `textures/blocks/cobblestone_mossy`; down: `textures/blocks/cobblestone_mossy` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:stone_bricks` | Tijolos de pedra | side: `textures/blocks/stonebrick`; up: `textures/blocks/stonebrick`; down: `textures/blocks/stonebrick` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:lantern` | Lanterna | side: `textures/blocks/lantern`; up: `textures/blocks/lantern`; down: `textures/blocks/lantern` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:shroomlight` | Cogubrilho | side: `textures/blocks/shroomlight`; up: `textures/blocks/shroomlight`; down: `textures/blocks/shroomlight` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_door` | Porta de mangue | side: `textures/blocks/mangrove_door_top`; lower: `textures/blocks/mangrove_door_bottom` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:sticky_piston` | Pistão aderente | side: `textures/blocks/piston_side`; up: `textures/blocks/piston_top_sticky`; down: `textures/blocks/piston_bottom`; inner: `textures/blocks/piston_inner` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:sticky_piston_arm_collision` | Cabeça do pistão aderente | side: `textures/blocks/piston_side`; up: `textures/blocks/piston_top_sticky`; down: `textures/blocks/piston_inner` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:redstone_wire` | Pó de redstone | up: `textures/blocks/redstone_dust_cross`; side: `textures/blocks/redstone_dust_line` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:lever` | Alavanca | side: `textures/blocks/lever`; base: `textures/blocks/cobblestone` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:redstone_torch` | Tocha de redstone | side: `textures/blocks/redstone_torch_on` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:unlit_redstone_torch` | Tocha de redstone | side: `textures/blocks/redstone_torch_off` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:powered_repeater` | Repetidor de redstone | up: `textures/blocks/repeater_on`; side: `textures/blocks/stone_slab_top`; torch: `textures/blocks/redstone_torch_on` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:unpowered_repeater` | Repetidor de redstone | up: `textures/blocks/repeater_off`; side: `textures/blocks/stone_slab_top`; torch: `textures/blocks/redstone_torch_off` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:mangrove_button` | Botão de mangue | side: `textures/blocks/mangrove_planks` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:unpowered_comparator` | Comparador de redstone | up: `textures/blocks/comparator_off`; side: `textures/blocks/stone_slab_top`; torch: `textures/blocks/redstone_torch_off` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |
| `minecraft:powered_comparator` | Comparador de redstone | up: `textures/blocks/comparator_on`; side: `textures/blocks/stone_slab_top`; torch: `textures/blocks/redstone_torch_on` | ID/estado conforme catálogo original; material escolhido pelo projeto autoral |

## Integração e validação

- Marca BuildsMine no cabeçalho, título e metadados do Site; mesmo projeto e audiência privada. Seletor de construção compartilha os controles de vistas, grade, materiais, camadas e montagem. O tema acompanha a troca.
- A Casa de Bambu mantém seu modelo, motor e iluminação aprovados: 772 células conferidas com `verificar-modelo.py`; o bundle do seu visualizador permanece com o mesmo conteúdo compilado.
- Modelos dos portais têm 4.550 / 6.792 / 15.897 posições únicas; cópias byte a byte idênticas às fontes. O trecho completo de mecanismos, pulsos, temporizadores, pistões e serviço permanece idêntico ao motor de origem.
- Build aprovado. Chromium 1440×1000: três modelos, sete vistas, grade, dez blocos, corte Y, etapas acumulativas, parte isolada, inventário/Escape e noite. Nas versões 2.3.0/2.4.0: botões externos, internos e renovação de temporizador; folhas e sinais de redstone; fechamento automático; piso, circuito, dois níveis e corte; inspeção integrada e clique real no botão 3D. Emulação móvel 390×844 com suporte a toque: acionamento por toque, controles acessíveis, sem overflow, troca para Bambu e tema preservado. Sem erros de console/página.
- A versão 1.0.3 é a fachada original, sem o mecanismo das versões posteriores. A integração preserva essa diferença. Não foram acrescentados circuitos inventados nem alterados mundos Minecraft.
- As miniaturas e a apresentação 3D dos portais vêm do seu motor original, com a mesma simulação de movimento; a interface de controles externa usa o desenho atual de inventário. Nenhum asset oficial de textura foi copiado para o pacote do site.
