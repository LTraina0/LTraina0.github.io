# Popa da Andorinha

A maquete do briefing mantém parte da armação presa a uma superfície arrancada. A referência de popa iluminada acrescenta profundidade ao espelho com janelas entre frisos e apoios salientes. No ensaio da Andorinha, a junta atravessa duas fiadas de estibordo e a caverna 10. A galeria recua lateralmente à medida que contorna o espelho. A forma e a posição da ruptura são escolhas autorais. [Maquete e repertório naval](https://chatgpt.com/space/page_754129f82b408191bef978363fc96eb2)

## Geometria de origem

+Z aponta à ré e +X a estibordo. A curva de estações existente fornece o fundo em V, o bojo e a volta para dentro perto do convés. O estreitamento longitudinal e o espelho inclinado fecham o trecho à ré. A sequência de construção acrescenta forro, escoas, vaus, curvas de ligação, braçola da escotilha e cabeços de amarração do Kitbashing. As janelas abertas deixam ver o recesso entre a soleira e os frisos do espelho. Na estação 10, o vau e a pele chegam à mesma caverna por lados diferentes.

O modelo íntegro e as decisões da paleta nascem uma vez. Cada célula possui um membro de origem e pertence ao corpo fixo ou ao painel. Os fins de fiada têm comprimentos distintos. O corte inclui parte da borda do convés, uma perna de cavername, o joelho e a ponta do vau. A ruptura retira esse conjunto. O deslocamento usa os mesmos blocos com meia-volta sobre Y, seguida de translação (42, −3, 4). Para remontar, X e Z são refletidos pela mesma meia-volta e Y sobe três blocos.

## Materiais aplicados

| Família Bedrock | Faces e estados utilizados | Local de leitura |
|---|---|---|
| minecraft:dark_oak_log, minecraft:spruce_log, minecraft:stripped_spruce_log, minecraft:oak_log | Topos perpendiculares a pillar_axis. Casca ou madeira descascada nas demais faces | Quilha, cinta, cavername, espelho e extremidades do vau |
| minecraft:spruce_planks, minecraft:dark_oak_planks | Textura vanilla de tábuas, sem estado rotacional | Pele sombreada, forro e cobertura do porão |
| minecraft:spruce_stairs, minecraft:dark_oak_stairs, minecraft:oak_stairs | weirdo_direction, upside_down_bit, minecraft:corner | Encontro do bojo com a fiada seguinte, joelhos e mísulas |
| minecraft:spruce_slab, minecraft:oak_slab | minecraft:vertical_half | Borda do convés, peitoris e frisos que avançam diante do espelho |
| minecraft:trapdoor | Folha vazada de carvalho com direction, open_bit e upside_down_bit | Venezianas recolhidas no recesso das janelas |

O catálogo e a paleta documentam a versão vanilla v1.26.60.5, as texturas por face e os estados. A paleta considera proteção e exposição na posição original e acompanha o bloco afastado. A pele de tábuas mantém a textura vanilla fixa. O testemunho orientado se lê nas toras. [Catálogo naval](../architect/v3/naval-blocks.mjs) · [Fontes Bedrock](../architect/v3/bedrock-evidence.json)

## Inspeção e remontagem

Os modelos públicos usam buildsmine.cells/1. Cada grupo de quatro inteiros em cells indica x, y, z e o índice na dictionary. A peça e o membro estão em piece e component. header.stern guarda a identidade canônica, as transformações e os pares de coordenadas originais em joints[].contacts. No estúdio, cada célula decodificada também expõe origin e sourceCell. Nas juntas de corte, o primeiro endereço é do corpo fixo e o segundo é do painel. As juntas selecionáveis incluem contatos retidos no interior de cada peça. O conjunto de todos os contatos físicos entre as duas peças é enumerado. As juntas preservadas que aparecem no seletor são exemplos anatômicos, e a auditoria verifica a totalidade dos contatos preservados.

A auditoria percorre faces com área efetiva em comum, verifica a conectividade, remonta o painel e compara o hash do conteúdo recuperado. A amostra do vau passa de (9,11,10) a (33,8,-6). A imagem da referência, os ângulos equivalentes, os JSONs e o relatório numérico estão em /popa-painel/. Os ensaios cobrem o visualizador e os dados. Colocação, atualização de blocos por vizinhança e comportamento dentro do Bedrock permanecem pendentes.

