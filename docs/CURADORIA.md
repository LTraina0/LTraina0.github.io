# Curadoria da extração — antes da integração

Fonte autoritativa para posições, IDs e estados: arquivo `Casa de bambu e tres pontes - sem subterraneo e apoios.mcstructure`, SHA-256 `cfe06902c84a68fb263aef2dbec9cfc6ed40536de737d0d9c3a3f5456c3217fd`. Leitura direta: 17 × 14 × 59, 772 blocos, 80 combinações da paleta. `paleta-extraida.json` registra todos os estados e contagens. A versão 1.26.63.1 é relatada pela extração; a presença dos IDs na própria estrutura prova que foram armazenados nela, não prova a disponibilidade em outras versões. Água e mecanismo de sino não são simulados.

| Família e IDs Bedrock | Textura / faces pretendidas | Forma e estados relevantes | Confiança |
|---|---|---|---|
| `minecraft:bamboo_block`, `minecraft:stripped_bamboo_block` | laterais fibrosas e topo transversal; artes próprias aproximadas | cubo; `pillar_axis` | ID/estado alto; aparência aproximada |
| `minecraft:bamboo_planks`, `minecraft:bamboo_slab`, `minecraft:bamboo_double_slab`, `minecraft:bamboo_stairs` | tábuas de bambu; artes próprias aproximadas | cubo, laje simples/dupla, escada; metade, direção e canto | ID/estado alto; geometria depende de validação visual |
| `minecraft:bamboo_mosaic`, `minecraft:bamboo_mosaic_slab` | mosaico; arte própria aproximada | cubo/laje; metade | ID/estado alto; aparência aproximada |
| `minecraft:birch_planks`, `minecraft:birch_slab`, `minecraft:birch_double_slab` | tábuas de bétula; arte própria aproximada | cubo e lajes; metade | ID/estado alto; aparência aproximada |
| `minecraft:mud_bricks`, `minecraft:mud_brick_slab`, `minecraft:mud_brick_stairs`, `minecraft:mud_brick_wall` | tijolo de barro; arte própria aproximada | cubo/laje/escada/muro; metade, direção, canto, conexões e poste | ID/estado alto; geometria depende de validação |
| `minecraft:bamboo_fence`, `minecraft:bamboo_trapdoor` | bambu; arte própria aproximada com recortes da alçapão sujeitos a conferência | cerca conectada; alçapão com orientação, metade e abertura | ID/estado alto; conexões inferidas de vizinhança, não comprovadas |
| `minecraft:lantern`, `minecraft:iron_chain`, `minecraft:torch`, `minecraft:shroomlight` | metal, luz e corrente; artes próprias aproximadas | lanterna pendurada, corrente, tocha, cubo luminoso | ID/estado alto; detalhes a validar |
| `minecraft:scaffolding`, `minecraft:bell` | bambu e metal; artes próprias aproximadas | armação vazada; sino e suporte com orientação e fixação | ID/estado alto; detalhes a validar |

Os nomes, estados e quantidades provêm da estrutura, e não de identificação visual. Consultar [lista de blocos](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/vanillalistingsreference/blocks?view=minecraft-bedrock-stable) e [estados vanilla](https://learn.microsoft.com/en-us/minecraft/creator/reference/content/blockreference/examples/blockstateandtraitlistings?view=minecraft-bedrock-stable). Os samples [têm direitos reservados e são sujeitos ao EULA](https://github.com/Mojang/bedrock-samples/blob/main/LICENSE.md); nenhum arquivo proprietário é incluído nesta preparação. Imagens de referência temporárias solicitadas não foram encontradas no caminho indicado durante esta verificação.

## Implementação e diferenças conhecidas

- As escadas usam as partes em dezesseis avos e os estados de canto/direção da estrutura; lajes usam a metade registrada; cercas e muros usam as conexões registradas. Alçapões são uma aproximação de grade vazada com abertura e direção; seu desenho não é uma cópia da textura oficial.
- Correntes são representadas por elos compostos de pequenas caixas; lanternas por corpo luminoso e armação; o sino pendurado por volumes simplificados; andaimes por quatro postes e ripas. Tochas de parede recebem deslocamento e inclinação conforme a direção; as dimensões finas são aproximadas. Os detalhes finos e as texturas não foram comparados com o renderizador Bedrock.
- Pilares de bambu distinguem topo e lateral e respeitam o eixo; as demais superfícies usam padrões próprios por família. UVs das peças parciais são recortadas por face na escala de 16 pixels por bloco; os padrões são próprios e não correspondem aos pixels vanilla. Não há simulação do sino nem do comportamento de blocos.
- A fonte exata da referência visual não estava disponível: as imagens temporárias indicadas já não existiam. A validação de dados não prova fidelidade visual ou validação dentro do jogo. O texto que relata a importação confirmada pelo usuário diz respeito ao `.mcstructure`.
