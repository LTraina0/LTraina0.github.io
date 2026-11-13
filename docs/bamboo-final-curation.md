# Casa de Bambu final · referência e curadoria

Referência primária: cópia verificada do mundo **Mundo De testes global**, salvo com Bedrock **1.26.63.1**, extraída em 12/11/2026. Os três prints enviados pelo usuário são referências visuais e de orientação. O segundo traz a frente marcada e a haste de bambu atrás; o terceiro fixa a ponte maior na lateral livre à esquerda, correspondente a oeste (-X), oposta à ponte curta leste. A escala é uma célula inteira por bloco, com eixo X leste, Y altura e Z sul.

## Visível, inferido e confirmado

- **Visível nos prints:** volume central compacto, torre superior, cobertura escalonada com beirais, pórticos em duas direções, estrutura de aspecto bambu, piso/apoios marrons e lanternas suspensas. A frente está marcada pelo usuário, e o bambu alto fica nos fundos.
- **Confirmado no arquivo:** centro X=-4, Z=-10; frente +Z; bambu X=-4, Z=-16. Casa com 570 células, ponte frontal com 41, ponte lateral com 41 e haste com 15. Recorte de X=-9..7, Y=-61..-46 e Z=-16..1, total 667 células. IDs, estados, eixos e detalhes ocultos vêm do salvamento; não foram adivinhados pela aparência.
- **Decisão de recorte:** conservar arquitetura acima da base Y=-61 e a haste; excluir terreno geral, água, outras experiências e o armazenamento subterrâneo. O acervo anterior também excluía o subterrâneo. Nenhuma célula foi alterada no mundo original.
- **Confirmado no modelo survival preservado:** ponte maior com 36 posições longitudinais, largura de três células; grupo antigo Z=23..58. A lembrança do usuário de 35/36 foi resolvida pelo dado.
- **Projeto inferido/autoral:** a ponte maior receberá seções reais da ponte frontal final, repetidas para manter as 36 posições, com pórticos em distâncias 10/20/30/40 do centro. Uma soleira adicional garante a transição com a casa em uma fachada que não tinha ponte.
- **Orientação final confirmada pelo usuário:** ponte maior na lateral livre oeste (-X), ponte curta frontal +Z, ponte curta lateral +X, bambu intacto nos fundos -Z. O arranjo corresponde ao terceiro print com setas; não é uma escolha automática do gerador.

## Regiões ocultas e assimetria

As células invisíveis nos prints foram preservadas do arquivo. Não se impôs simetria: variações de mosaico, orientação de alçapões, andaimes internos, portões e luminárias continuam exatamente como salvas. A frente principal não depende de uma estimativa de simetria. A haste dos fundos prova a correspondência espacial +Z/-Z no próprio modelo.

O centro indicado é o andaime do piso em **(-4,-61,-10)**. A base da haste está em **(-4,-60,-16)**: compartilham X=-4, e a haste fica seis blocos ao norte do centro. Nenhuma posição da haste foi alterada. A casa de 570 células possui 556 células com contraparte ocupada em cada um dos espelhos X e Z; 514 e 516, respectivamente, possuem também o mesmo ID. Isso confirma o ritmo simétrico predominante, preservando diferenças reais do salvamento. Não se apresenta a construção como perfeitamente idêntica nas quatro faces.

## Paleta

Disponibilidade atual confirmada pelas próprias células salvas em 1.26.63.1. Domínios de estados e texturas consultados no cache oficial **v1.26.60.5**. Os 24 IDs e todos os valores colocados pertencem a esse esquema. As diferenças entre a versão do mundo e a referência de assets são registradas; não se declara equivalência gráfica entre versões.

O arquivo [bamboo-final-materials.json](bamboo-final-materials.json) contém cada domínio de estados, variante encontrada e resolução das seis faces. O alias de atlas `chain` corresponde ao ID salvo `minecraft:iron_chain`. Tora e anfibrilho reorientam topo/base conforme `pillar_axis`; escadas, lajes, alçapões e portões preservam seus estados. A definição de atlas da planta contém sprites especializados, não seis faces de um cubo.

| Material | ID Bedrock | Forma | Texturas por face | Confiança |
| --- | --- | --- | --- | --- |
| Bambu | `minecraft:bamboo` | vegetação articulada | up: textures/blocks/bamboo_leaf; down: textures/blocks/bamboo_sapling; north: textures/blocks/bamboo_stem; south: textures/blocks/bamboo_small_leaf; east: textures/blocks/bamboo_singleleaf; west: textures/blocks/bamboo_stem | IDs/estados confirmados no mundo; atlas oficial |
| Bloco de Bambu | `minecraft:bamboo_block` | tora orientável | up: textures/blocks/bamboo_block_top; down: textures/blocks/bamboo_block_top; north: textures/blocks/bamboo_block; south: textures/blocks/bamboo_block; east: textures/blocks/bamboo_block; west: textures/blocks/bamboo_block | IDs/estados confirmados no mundo; atlas oficial |
| Laje Dupla de Bambu | `minecraft:bamboo_double_slab` | laje dupla | todas: textures/blocks/bamboo_planks | IDs/estados confirmados no mundo; atlas oficial |
| Cerca de Bambu | `minecraft:bamboo_fence` | cerca | todas: textures/blocks/bamboo_fence | IDs/estados confirmados no mundo; atlas oficial |
| Portão de bambu | `minecraft:bamboo_fence_gate` | portão | todas: textures/blocks/bamboo_fence_gate | IDs/estados confirmados no mundo; atlas oficial |
| Mosaico de Bambu | `minecraft:bamboo_mosaic` | cubo | todas: textures/blocks/bamboo_mosaic | IDs/estados confirmados no mundo; atlas oficial |
| Laje de Mosaico de Bambu | `minecraft:bamboo_mosaic_slab` | laje | todas: textures/blocks/bamboo_mosaic | IDs/estados confirmados no mundo; atlas oficial |
| Tábuas de Bambu | `minecraft:bamboo_planks` | cubo | todas: textures/blocks/bamboo_planks | IDs/estados confirmados no mundo; atlas oficial |
| Laje de Bambu | `minecraft:bamboo_slab` | laje | todas: textures/blocks/bamboo_planks | IDs/estados confirmados no mundo; atlas oficial |
| Escadas de Bambu | `minecraft:bamboo_stairs` | escada | todas: textures/blocks/bamboo_planks | IDs/estados confirmados no mundo; atlas oficial |
| Alçapão de Bambu | `minecraft:bamboo_trapdoor` | alçapão | todas: textures/blocks/bamboo_trapdoor | IDs/estados confirmados no mundo; atlas oficial |
| Tábuas de Bétula | `minecraft:birch_planks` | cubo | todas: textures/blocks/planks_birch | IDs/estados confirmados no mundo; atlas oficial |
| Laje de Bétula | `minecraft:birch_slab` | laje | todas: textures/blocks/planks_birch | IDs/estados confirmados no mundo; atlas oficial |
| Corrente de Ferro | `minecraft:iron_chain` | corrente | up: textures/blocks/chain1; down: textures/blocks/chain1; north: textures/blocks/chain2; south: textures/blocks/chain2; east: textures/blocks/chain2; west: textures/blocks/chain2 | IDs/estados confirmados no mundo; atlas oficial |
| Lampião | `minecraft:lantern` | lanterna | todas: textures/blocks/lantern | IDs/estados confirmados no mundo; atlas oficial |
| Laje Dupla de Tijolos de Lama | `minecraft:mud_brick_double_slab` | laje dupla | todas: textures/blocks/mud_bricks | IDs/estados confirmados no mundo; atlas oficial |
| Laje de Tijolos de Barro | `minecraft:mud_brick_slab` | laje | todas: textures/blocks/mud_bricks | IDs/estados confirmados no mundo; atlas oficial |
| Escada de Tijolos de Barro | `minecraft:mud_brick_stairs` | escada | todas: textures/blocks/mud_bricks | IDs/estados confirmados no mundo; atlas oficial |
| Parede de Tijolos de Barro | `minecraft:mud_brick_wall` | parede conectável | todas: textures/blocks/mud_bricks | IDs/estados confirmados no mundo; atlas oficial |
| Tijolos de Barro | `minecraft:mud_bricks` | cubo | todas: textures/blocks/mud_bricks | IDs/estados confirmados no mundo; atlas oficial |
| Anfibrilho Ocre | `minecraft:ochre_froglight` | cubo | up: textures/blocks/ochre_froglight_top; down: textures/blocks/ochre_froglight_top; north: textures/blocks/ochre_froglight_side; south: textures/blocks/ochre_froglight_side; east: textures/blocks/ochre_froglight_side; west: textures/blocks/ochre_froglight_side | IDs/estados confirmados no mundo; atlas oficial |
| Andaime | `minecraft:scaffolding` | andaime | up: textures/blocks/scaffolding_top; down: textures/blocks/scaffolding_bottom; north: textures/blocks/scaffolding_side; south: textures/blocks/scaffolding_side; east: textures/blocks/scaffolding_side; west: textures/blocks/scaffolding_side | IDs/estados confirmados no mundo; atlas oficial |
| Bloco de Bambu Descascado | `minecraft:stripped_bamboo_block` | tora orientável | up: textures/blocks/stripped_bamboo_block_top; down: textures/blocks/stripped_bamboo_block_top; north: textures/blocks/stripped_bamboo_block; south: textures/blocks/stripped_bamboo_block; east: textures/blocks/stripped_bamboo_block; west: textures/blocks/stripped_bamboo_block | IDs/estados confirmados no mundo; atlas oficial |
| Tronco de Bétula Descascado | `minecraft:stripped_birch_log` | tora orientável | up: textures/blocks/stripped_birch_log_top; down: textures/blocks/stripped_birch_log_top; north: textures/blocks/stripped_birch_log; south: textures/blocks/stripped_birch_log; east: textures/blocks/stripped_birch_log; west: textures/blocks/stripped_birch_log | IDs/estados confirmados no mundo; atlas oficial |

## Fontes e limites de representação

[IDs e domínios oficiais](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json), [definições de faces](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json), [atlas](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json). Assets oficiais permanecem no cache privado ou são carregados de sua fonte pelo visualizador. O repositório contém metadados e células do usuário, sem distribuir os assets oficiais nem a LevelDB.

**Forma visual:** a prévia web é uma representação por partes dos blocos. O portão e a planta recebem geometria manual e devem ser classificados como aproximações do visualizador; o bambu vegetal usa haste fina e sprites de folhas. **Contato:** soleira e continuidade longitudinal do piso são verificadas por coordenadas. **Colisão:** não houve ensaio no motor Bedrock. **Emissão:** os IDs luminosos são exatos, mas a propagação de luz é aproximada na web. **Comportamento:** estados salvos não provam atualização de vizinhos, crescimento ou interação no jogo.

## Procedência e reprodução

O leitor `output/casa-bambu-final-2026-11-12/read-source.py`, no workspace privado, respeita CURRENT/MANIFEST, considera apenas SSTable ativa e WAL pertinente, resolve chaves pelo maior número de sequência e confere CRC32C. Passaram 17 verificações (13 de logs, quatro de blocos SSTable). Arquivos SSTable antigos não ativos foram ignorados. Os 12 arquivos da cópia coincidiram por SHA-256 com a fonte, antes da extração. A LevelDB original não foi aberta para escrita.

A fonte canônica da casa está em `architect/data/bamboo-final-source.json`, e o gerador determinístico é `architect/bamboo-final.mjs`. A base anterior de 772 células permanece em `public/model-survival-2026-11-10.json`. O gerador recusa colisões e transforma os estados direcionais junto das posições. Não usa motor de coberturas novo: todos os telhados da casa e das duas pontes são cópias exatas das células do mundo.

Validação estática: `node --test tests/bamboo-final.test.mjs`. Os testes cobrem preservação de 667 células, IDs/estados/versão, andaime central, haste relativa à casa, comprimento 36, piso contínuo, soleira, ocupação única e rotação dos estados. Modelo final aprovado em planta: **919 células**, sendo 667 copiadas exatamente, 251 da extensão e uma soleira adicional de encaixe. O gerador recusa outros lados e qualquer deslocamento do bambu.

Comparação visual, seis vistas, cortes, timeline, navegação e validação no jogo são camadas distintas. Este documento confirma o arranjo pelo diagrama e a estrutura pelos dados/testes. Os resultados da inspeção visual do site são registrados no relatório de entrega correspondente. Não houve teste no jogo nem verificação de equivalência ao renderizador Bedrock.
