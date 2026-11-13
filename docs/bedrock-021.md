# Curadoria Bedrock do benchmark 0.2.1

## Evidência produzida

A revisão de 11/11/2026 conferiu o repertório renderizável de 92 IDs contra a tag oficial Bedrock `v1.26.60.5`. Cada ID existe e todas as chaves e valores de estado suportados pelo catálogo pertencem ao esquema dessa tag. O arquivo de evidências registra, por ID, o domínio oficial, o subconjunto suportado, a forma, os nomes e hashes das texturas por face, dimensões dos PNGs e intervalo alfa. Foram encontrados 69 PNGs distintos. A transparência anotada é a dos pixels da imagem. A oclusão, o suporte para colocação e as caixas de colisão precisam de critérios adicionais. [Evidência por bloco](../architect/v2/bedrock-evidence.json) · [Metadados Bedrock usados](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json)

O pacote Windows instalado foi identificado por leitura de metadados como `Microsoft.MinecraftUWP 1.26.6301.0`. A chamada de leitura `listMinecraftSessions` retornou uma lista vazia e nenhum processo Minecraft estava aberto durante esta revisão. O conector disponível serve sessões Bedrock Dedicated Server. A ausência de uma sessão conectada impede capturas pareadas e medições no jogo nesta execução. O registro marca `inGameChecked=false` em todas as entradas. A instalação e os mundos permaneceram sem alterações.

## Níveis de confirmação

| Campo | Evidência e confiança | Limite da confirmação |
| --- | --- | --- |
| Identificador e estado | Alta para a tag v1.26.60.5. A verificação compara a entrada por ID e os valores enumerados oficiais. | A mesma entrada pode ter restrições de posicionamento e estados derivados de vizinhos. |
| Textura | Alta para os arquivos identificados. PNGs oficiais, tamanho, SHA-256 e canal alfa registrados. | UV de formas não cúbicas e animação exigem comparação de faces no jogo. |
| Cubo, tora e meia laje | Forma canônica representada na grade. A tora preserva eixo e faces de topo. | A imagem do site confirma sua implementação. A equivalência de luz, colisão e renderização Bedrock está pendente. |
| Escada e alçapão | Geometria por meios ou dezesseis avos e estados Bedrock explícitos. | Cantos de escada e conexões precisam de atualização de vizinhos. A dobradiça precisa ser confrontada em cena pareada. |
| Muro | Poste e braços em seções distintas, com estados Bedrock por face. | O jogo recalcula conexões. A biblioteca não demonstra todos os resultados de colocação. |
| Bigorna, funil, caldeirão e haste | Estados e sprites Bedrock confirmados. Dimensões de malha provenientes de referência Java declarada na 0.2. | Correspondência de silhueta, UV, colisão e comportamento Bedrock pendente. |

Os assets vanilla consultados expõem texturas, atlas e metadados, mas a pesquisa não encontrou uma malha Bedrock JSON para aferir as quatro formas utilitárias. Essa lacuna mantém as novas montagens que dependem delas como componentes experimentais de prévia. [Curadoria e dimensões da biblioteca 0.2](kit-v2.md)

## Repertório e colocação

Os nomes abaixo usam o prefixo `minecraft:`. Os registros individuais completos, inclusive nomes pt-BR, estão no arquivo de evidências.

| Família | IDs utilizados ou disponíveis ao benchmark | Forma, orientação, texturas e cuidados |
| --- | --- | --- |
| Mangue | `mangrove_planks`, `mangrove_stairs`, `mangrove_slab`, `stripped_mangrove_log` | Tábuas e derivados usam `mangrove_planks`. A tora usa `stripped_mangrove_log_side` nas laterais e `stripped_mangrove_log_top` nos extremos do eixo. `pillar_axis` admite x, y, z. Escadas e lajes precisam das orientações descritas abaixo. |
| Bambu | `bamboo_planks`, `bamboo_trapdoor` | Tábuas em cubo. Alçapão de espessura real em sua célula, com recortes alfa preservados. Estados `direction`, `open_bit`, `upside_down_bit`. Registrar apoio de instalação e manter as folhas em células distintas da parede. Abertura por jogador ou redstone altera sua posição. |
| Ardósia | `deepslate_bricks`, `deepslate_brick_stairs`, `deepslate_brick_slab` | Mesma textura `deepslate/deepslate_bricks` nas faces. Derivados preservam forma própria e estados. Apropriados a base e cobertura sem exigir geometria externa. |
| Pedra-negra | `polished_blackstone_bricks`, `polished_blackstone_brick_stairs`, `polished_blackstone_brick_slab`, `polished_blackstone_brick_wall` | Textura `polished_blackstone_bricks`. O muro declara poste e braços independentes. Conexões podem mudar junto a cubos ou outros muros. |
| Cobre | `waxed_cut_copper`, `waxed_weathered_cut_copper`, `waxed_oxidized_cut_copper` e seus derivados `_stairs` e `_slab` | Texturas `cut_copper`, `weathered_cut_copper`, `oxidized_cut_copper`. As variantes enceradas fixam o estágio cromático escolhido. Uma distribuição contextual por exposição descreve a composição autoral. Ela não calcula o processo temporal de oxidação do jogo. |
| Bigorna | `anvil` | `minecraft:cardinal_direction` admite south, west, north, east. Corpo `anvil_base`, mesa `anvil_top_damaged_0`. O protótipo usa peça intacta sobre cubo ou tora. O apoio precisa existir antes da colocação e continuar presente. Queda e uso podem alterar a montagem. |
| Funil | `hopper` | `facing_direction`, `toggle_bit`. Sprites `hopper_top`, `hopper_outside`, `hopper_inside`. A biblioteca suporta baixo e quatro direções laterais. O domínio oficial inclui também o número 1, que está fora do subconjunto geométrico adotado. Coleta, inventário e travamento por redstone pertencem ao jogo. |
| Caldeirão | `cauldron` | `cauldron_liquid` water/lava/powder_snow e `fill_level` 0 a 6. Sprites side/top/bottom/inner próprios. A prévia representa exclusivamente vazio. A boca vazia não oferece um plano de material contínuo para uma peça central. Chuva e uso podem alterar seu estado. |
| Haste | `end_rod` | `facing_direction` 0 a 5. Textura `end_rod`, UV com ilhas de colar e haste. Emissão prevista 14. As partículas e a propagação luminosa estão pendentes de conferência no jogo. |
| Corpo luminoso | `sea_lantern` | Cubo, sem estados no esquema alvo, textura `sea_lantern`. PNG animado com cinco quadros. O atlas usa o primeiro e aproxima autoemissão. A luz espacial do Bedrock exige ensaio próprio. |

As definições de faces do pacote e seu atlas resolvem as chaves para PNGs. A chave visual legada `seaLantern` convive com o identificador de bloco `minecraft:sea_lantern`. [Definições de face](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json) · [Atlas](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json)

## Estados direcionais decisivos

- Escadas usam `weirdo_direction` 0, 1, 2, 3 e `upside_down_bit`. Na convenção do motor, o lado alto corresponde a leste, oeste, sul, norte. A nova chave `minecraft:corner` admite none, inner_left, inner_right, outer_left e outer_right. O changelog Bedrock 26.50 documenta sua exposição e atualização por escadas vizinhas. Em mundos com versão base anterior, a atualização pode seguir o comportamento antigo. Cada canto do benchmark precisa ter vizinhos coerentes com seu estado. [Changelog Bedrock 26.50](https://feedback.minecraft.net/hc/en-us/articles/48826825649933-Minecraft-Bedrock-Edition-26-50-Changelog-Wilderness-Bound)
- Lajes usam `minecraft:vertical_half` bottom/top. As duas metades ocupam a mesma célula apenas quando se trata de um bloco duplo real. A composição desta revisão usa uma entrada por célula.
- Muros usam `wall_post_bit` e `wall_connection_type_north/east/south/west`, cada qual none/short/tall. Rotação e espelho devem permutar as quatro faces. O número de conexões gravado não elimina a necessidade de conferir a vizinhança final.
- O nome genérico `direction` não basta para transportar uma orientação de uma forma para outra. O catálogo de cada bloco e a montagem de teste definem sua interpretação. [Listagem oficial de estados e traits](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockstateandtraitlistings?view=minecraft-bedrock-stable)

## Critério para promover um componente a validado no jogo

Preparar, quando autorizado, uma cópia de teste na versão Bedrock registrada. Colocar os componentes nas quatro rotações e em espelho, respeitando a ordem de apoios. Conferir as seis faces e o contorno por cima e por baixo. Registrar os estados após a atualização dos vizinhos e após recarregar a área. Capturar a mesma peça com câmera e iluminação controladas e confrontar com a prévia. Testar separadamente a colisão, abertura de alçapões, queda de bigornas, alteração do caldeirão e interação com funis. Anotar versão, pack, estados observados, imagens e divergências por ID antes de alterar `inGameChecked`.

A regra de base contínua sob a bigorna segue o comportamento documentado de queda. O funil mantém funções de coleta e transferência que influenciam o custo e o uso de uma fachada em Sobrevivência. Usá-los como ornamento exige expor essas consequências na ficha da peça. [Bigorna e queda](https://www.minecraft.net/en-us/article/taking-inventory--anvil) · [Funil e transferência](https://www.minecraft.net/en-us/article/hopper)
