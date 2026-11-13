# O Último Encalhe — pesquisa e direção 0.3

Pesquisa em 11/11/2026. Briefing: https://chatgpt.com/space/page_754129f82b408191bef978363fc96eb2. As 17 imagens anexadas foram examinadas. A maquete fragmentada é a referência principal: um núcleo elevado de popa/abrigo, três escalas de fragmentos, vazios e ligações improvisadas. A autoria da maquete não foi identificada. Não se infere ID, shader, pack ou compatibilidade Bedrock de sua aparência.

## Síntese naval

- Vasa Museum, método de construção: https://faq.vasamuseet.se/category/45/article/24515?lang=en . Quilha, tábuas e armações são sistemas relacionados; seus perfis precisam coincidir. Não se reproduz literalmente a sequência histórica.
- Mary Rose Trust, glossário: https://maryrose.org/glossary/ . Vigas transversais, cintas longitudinais, castelo de popa, cabrestante, vergas e cordame possuem funções distintas. O projeto conserva essa hierarquia.
- Australian National Maritime Museum, Endeavour: https://www.sea.museum/en/maritime-archaeology/evidence-identifying-endeavour . Posições de armações, mastros, quilha e divisórias permitem relacionar fragmentos ao navio original.
- NOAA, Shipwreck Beach: https://sanctuaries.noaa.gov/maritime/expeditions/lanai/location.html . Registra concentrações de grandes peças e reaproveitamento de madeira de naufrágio em abrigos. A distribuição no gelo será ficção compositiva.
- Vasa, mastreação: https://www.vasamuseet.se/besok/audioguide/audioguide-english/textversion/14.-the-sailing-ship . Mastros compostos e incompletos comunicam a embarcação sem três velas perfeitas.
- Queen Anne’s Revenge Project: https://www.qaronline.org/ . O navio já existia como La Concorde. Não há necessidade de inventar uma tipologia exclusiva de casco pirata.
- Minecraft, Building Blocks Shipwreck, Duncan Geere, 07/06/2024: https://www.minecraft.net/en-us/article/shipwreck . Precedente vanilla de seções ausentes e armazenamento; não é confirmação de estados ou geometrias do nosso modelo.

## Repertório visual complementar

ShadeWraith, Kezzy, 08/02/2014: https://www.planetminecraft.com/project/shadewraith/ . O autor descreve o esqueleto de um navio fantasma; declara Java 1.7.4+ e Dokucraft Dark. Aproveita-se a legibilidade estrutural, não os assets, arquivos ou shaders. Pirates of the Caribbean ships, RoyStitch, 10/09/2018: https://www.planetminecraft.com/project/pirates-of-the-caribbean-ships/ e perfil https://www.planetminecraft.com/member/roystitch/ . Repertório cinematográfico secundário. Algumas requisições diretas devolveram 403; autoria e dados foram conferidos em conteúdo indexado dessas páginas. Não foram baixados mapas ou schematics.

As imagens 02–08 orientam volumes navais, plataformas, fibras e velame; 13–14 orientam encaixes e pequenos acessórios. As imagens 09–12 e 15–17 servem apenas à futura paisagem. A imagem de canhões não autoriza deformar ou inclinar blocos inteiros. A busca visual adicional de maquetes e ruínas não substitui a referência-mestra.

## Alternativas de composição

1. **Abrigo da popa — direção principal.** Popa elevada preservada, ruptura oblíqua, grande fragmento de costado deslocado a bombordo, convés aberto e proa pequena afastada. Percurso improvisado assimétrico; maior fidelidade à hierarquia da maquete.
2. **Fenda transversal.** Fragmentos mais alinhados, ruptura central mais larga e convés oposto em eixo. Boa leitura do casco anterior, mas risco de parecer navio inteiro dividido ao meio.
3. **Deriva lateral.** Fragmentos espalhados em arco, um painel de casco atravessado e mastreação deslocada. Silhueta mais aberta; exige percursos mais longos e prejudica a concentração do abrigo.

Serão comparadas como configurações de implantação, sem três projetos monumentais independentes. A cabine deverá permanecer subordinada ao costado, com circulação real em células e altura livre. Não há inclinação arbitrária de malhas: toras e ferragens usam seus eixos reais e curvas voxel.

## Curadoria de materiais anterior ao modelo

| Família | IDs Bedrock escolhidos | Faces, formas e estados | Função e confiança |
| --- | --- | --- | --- |
| Estrutura | spruce_log, dark_oak_log, stripped_spruce_log | pillar_axis x/y/z; lateral e topo oficiais distintos | Quilha, cavernames, vigas e mastros; esquema oficial confirmado, jogo pendente |
| Tábuas | spruce_planks, dark_oak_planks, oak_planks | planks_spruce, planks_big_oak, planks_oak; cubos | Costado, convés e reparos; distribuição por função |
| Formas parciais | Escadas/lajes correspondentes e spruce/dark_oak trapdoor | weirdo_direction, upside_down_bit, minecraft:corner; vertical_half; direction/open_bit/upside_down_bit | Transições do casco, bordas e molduras; geometria canônica e estado documental, vizinhos no jogo pendentes |
| Acessórios | barrel, lantern, iron_chain, spruce_fence, spruce_door | Barril: facing_direction/open_bit e tampo/barrel_side separados; lanterna hanging; corrente pillar_axis com dois sprites recortados; cerca conexões quatro faces; porta cardinal/open/hinge/upper | Armazenamento, iluminação, amarração, guarda-corpos, acesso; curadoria oficial seletiva, sem cubos genéricos para formas especiais |
| Velame | white_wool, light_gray_wool | Cubos reais de lã, sem deformação | Pequenos panos rasgados, sem grandes velas intactas |
| Gelo e neve | packed_ice, blue_ice, snow, snow_layer | ice_packed, blue_ice, snow; height e covered_bit na camada | Contexto mínimo separado e ocultável; sem novas famílias Preview |

Os IDs desta tabela recebem o prefixo minecraft:. A lista exata, domínios de estados e texturas por face será registrada em architect/v3. A referência oficial fixada é https://github.com/Mojang/bedrock-samples/tree/v1.26.60.5 . Cache privado de imagens oficiais não será publicado em lote. Lanternas e correntes reutilizam a receita de sprites e UV da Casa de Bambu, preservando pixels e transparência. Os sprites usados pelo visualizador vêm da origem oficial.

## Disponibilidade Bedrock

Leitura do pacote Windows: Microsoft.MinecraftUWP 1.26.6301.0; nenhum pacote Preview foi encontrado nessa enumeração. A versão mobile não foi verificada. O MCP retornou zero sessões ativas. Nenhum mundo ou instalação foi alterado.

| Candidato recente | Estado encontrado | Decisão |
| --- | --- | --- |
| Packed Ice Bricks e variantes | Preview 26.70.21 e correções posteriores | Excluir; packed_ice simples é alternativa estável |
| Snow Bricks e variantes | Preview 26.70.22 | Excluir; snow e snow_layer |
| Polished Calcite e famílias de calcita | Preview 26.70.23 | Excluir; não deduzir IDs ou receitas |
| Brittle Ice | Preview 26.70.21–24 | Excluir |
| Ice Crystal e Icicle | Experimentos Drop 4 presentes na release 26.60, com mudanças Preview | Excluir do Survival estável sem experimentos; presença no índice não prova disponibilidade comum |

Fontes oficiais: https://feedback.minecraft.net/hc/en-us/articles/49852828563853-Minecraft-Bedrock-Edition-26-60-Changelog ; https://www.minecraft.net/en-us/article/minecraft-preview-26-70-21 ; https://www.minecraft.net/en-us/article/minecraft-preview-26-70-22 ; https://feedback.minecraft.net/hc/en-us/articles/50103892132365-Minecraft-Beta-Preview-26-70-23 ; https://feedback.minecraft.net/hc/en-us/articles/50285693907213-Minecraft-Beta-Preview-26-70-24 . Não foram confirmados IDs, texturas ou receitas das famílias novas e eles não serão inventados.

https://www.minecraft.net/en-us/article/block-week-ice sustenta o uso de gelo compactado perto de luz quente, sem confundi-lo com gelo comum. https://www.minecraft.net/en-us/article/creeping-winter-here confirma o repertório Dungeons; seus assets e comportamentos não são transferidos a Bedrock. Contraste frio/quente é uma decisão artística.

## Regras de fratura e avaliação

Quilha estreita, bojo e borda seguem seções comuns. Cavernames transversais e cintas longitudinais conservam a fibra depois da ruptura. Costado, convés, corrimão e mastros se rompem em posições relacionadas, com extremidades de comprimentos diferentes. Destroços têm contato ou apoio visível; os fragmentos preservam parentesco com o casco. Não há ruído aleatório uniforme.

Conferir proporções e silhueta em seis vistas e perspectiva, rotas de jogador, interior, espessura do casco, contatos de formas parciais, estados, faces/UVs, módulos, inventário e preservação dos 202 estudos anteriores. A prévia não comprova colisão, vizinhança, colocação, luz do jogo ou funcionamento dos barris/portas no Bedrock. Essas verificações continuarão declaradas pendentes.
