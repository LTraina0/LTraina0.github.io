# Palette Engine 0.2 · catálogo, gradientes e acabamento

O motor usa dados numéricos locais. O catálogo curado contém 86 IDs entre os 1.466 nomes da lista oficial consultada. As superfícies utilizam 58 PNGs distintos. Cada entrada preserva nome pt-BR, forma, família, ID completo, domínios de estado, textura superior, lateral e inferior e emissão prevista. Os valores de emissão foram anotados para o repertório desta revisão. O único emissor nele é a pedra luminosa, nível 15. [Catálogo completo por bloco e por imagem](../architect/v2/palette-data.json)

## Diagnóstico da 0.1

**Confirmado em código.** O catálogo anterior continha 15 IDs. No telhado, o seletor aplicava duas combinações predeterminadas. Não havia medição por face, contexto de recomendação, amostragem de textura ou distribuição espacial de material. As geometrias e os estados direcionais já distinguiam escadas, lajes, toras e alçapões.

**Hipótese avaliada.** Intercalar materiais adjacentes de uma rampa de luminosidade deve preservar seus extremos e modificar o contraste percebido a curta distância. O painel Brasa testa a primeira parte por contagem de contatos e diferença de luminosidade. A avaliação estética e a leitura à distância dependem de câmera, textura e iluminação.

**Oportunidade.** Separar o ID selecionado da geometria permitiu aplicar outra paleta preservando os estados de cada célula. Para a cobertura, a seleção de acabamentos inclui famílias com o trio real bloco, laje e escada. As escolhas de cerâmica, madeira e cobre mudam de acordo com o papel da peça.

## Curadoria das referências recebidas

| Imagens | Observado | Decisão de pesquisa e incerteza |
| --- | --- | --- |
| 1 e 10 | Peças escuras alternam larguras nos pilares. No outro estudo, a passagem do roxo ao bege reaparece em peças com formas diferentes. | Comparar silhueta separadamente da cor e restringir substituições à mesma forma. ID, colisão e encaixes ocultos dependem de fonte Bedrock. |
| 2 · ObjToSchematic | Uma silhueta lisa de sapo aparece ao lado da versão discretizada em materiais verdes e escuros. | Usar a silhueta e os grupos de cor como problemas distintos. A captura não determina parâmetros do conversor ou estados. |
| 3, 8 e 9 | Sequências de blocos formam rampas. Há trechos de matiz semelhante com texturas de contraste diferente. | Manter uma régua ordenada no topo de cada painel e calcular propriedades de claros, escuros e grão. Na imagem 3, a assinatura visível é @vesperameowbuilds. |
| 4, 5 e 6 | Faixas de duas dimensões misturam cor lisa, superfícies estriadas e marcas ornamentais. | Comparar cinco estratégias sobre os mesmos materiais. As orientações e os recursos visuais que produziram os exemplos permanecem indeterminados. |
| 7 | A diagonal passa por amarelo, laranja e vermelho e inclui manchas e motivos muito claros. | O estudo Brasa adiciona textura de veio de ouro entre argila e arenito. A direção diagonal identifica como a leitura muda entre parede e régua. |
| 11 | Motivos multicoloridos se repetem com orientações que afetam a leitura de cada agrupamento. | O padrão de losangos deste motor altera a distribuição de células. A rotação de UV de terracota vitrificada requer implementação própria antes de admitir esses blocos no catálogo renderizável. |

O usuário indicou o Pinterest como origem de dez imagens. Os demais autores, versões do jogo, dimensões, shaders e pacotes de recursos não foram inferidos. A etapa utiliza as referências como estudos de forma, cor e padrão.

## Ferramentas consultadas

- **Block Palettes.** A página geral devolveu HTTP 403 na abertura direta. Resultados indexados do próprio site exibiam filtro por bloco, sextetos e paletas semelhantes. Duas fichas exemplificavam o emprego de mangue junto a cobre ou junto a materiais claros como arenito e tronco descascado. São exemplos individuais, sem base para afirmar popularidade estatística. [Catálogo](https://www.blockpalettes.com/palettes) · [Paleta 25.116](https://www.blockpalettes.com/palette/25116) · [Paleta 80.088](https://www.blockpalettes.com/palette/80088)
- **Palettinator.** A descrição indexada do site informa descoberta por bloco e estilo, fixação de um material para gerar vizinhos e gradiente entre dois extremos. A página inicial não expôs HTML legível no leitor nesta sessão. A documentação pública inspirou o ponto de entrada por material inicial e a separação entre faixa linear e estudo de parede. [Catálogo](https://palettinator.com/) · [Guia de paredes em gradiente](https://palettinator.com/articles/minecraft-block-gradient-guide)
- **MCBI.** O projeto descreve catálogo Java, cálculo de combinações a partir de blocos publicados juntos, comparação de cores e média OKLab de pixels visíveis. O Palette Engine mede suas próprias imagens Bedrock e registra também extremos tonais e diferenças entre pixels vizinhos. As regras do serviço restringem varreduras automatizadas. [Sobre o MCBI](https://mcbi.ai/about) · [Método de cor](https://mcbi.ai/about/colors) · [Condições de uso](https://mcbi.ai/terms)
- **ObjToSchematic.** A wiki distingue malha, voxel e bloco, discute amostragem de área da textura, modificadores e limitação da paleta. Essa separação permite avaliar forma e acabamento de maneira independente. Nesta entrega, as coordenadas vêm do gerador paramétrico e a escolha de material decorre da região arquitetônica. [Quick Start](https://objtoschematic.com/wiki) · [Fluxos do editor](https://objtoschematic.com/wiki/editor_workflows)

A pesquisa foi documental. Nenhum desses serviços é dependência de execução. Não foram incorporados bancos comunitários, APIs externas ou modelos Java.

## Catálogo e medição

A fonte é a tag Mojang Bedrock Samples **v1.26.60.5**. A procedência do ID, domínio de estado, nome localizado e relação bloco → face → sprite é de alta confiança na tag. Classificações arquitetônicas e de família são decisões deste projeto. O script rejeita esquemas desconhecidos, faces laterais assimétricas sem adaptador e variantes de sprite não mapeadas. Os arquivos de imagem ficam em cache privado em `.local/architect-palette/`. O artefato versionado contém atributos derivados, hashes e caminhos de origem. [IDs e estados](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/metadata/vanilladata_modules/mojang-blocks.json) · [Relações por face](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/blocks.json) · [Atlas Bedrock](https://github.com/Mojang/bedrock-samples/blob/v1.26.60.5/resource_pack/textures/terrain_texture.json) · [Extrator reproduzível](../scripts/measure-palette.py)

O extrator usa a primeira imagem quadrada de cada sprite e considera visíveis os pixels com alfa ≥ 128. Calcula em OKLab a média e as médias dos quartos mais claros e mais escuros. A fração visível conserva o sinal de transparência. A distância perceptual média entre vizinhos horizontais e verticais caracteriza a intensidade e a direção do grão. `exposedFeatures` identifica topo e laterais após a orientação de uma tora. Os valores descrevem a textura difusa. Brilho metálico de renderização física, normal maps, tintas de bioma e comportamento de luz no jogo requerem outros dados. [Código do motor](../architect/v2/palette.mjs)

| Uso | Formas elegíveis | Composição |
| --- | --- | --- |
| Águas e cobertura | Cubo, laje, escada | Altura local por região e amostragem determinística. Três famílias completas de peças por acabamento. |
| Pilares e vigas | Tora, madeira, escada, laje | Direção da fibra, espessura e estados acompanham a forma de origem. |
| Frontões e paredes | Cubo, tora, alçapão | Preenchimento no miolo claro da rampa, estrutura de madeira e painéis compatíveis. |
| Cumeeira e ornamentos | Cubo, escada, laje | Acabamento coerente e acento ritmado em peças inteiras. |
| Fundação | Cubo | Base escura sólida. Objetos funcionais de geometria especial mantêm seu ID. |

## Capacidades reutilizáveis

- `recommend(seedId, {role, family, harmony, face, limit})` compara a face real do bloco inicial com superfícies elegíveis. Usa distância em OKLab, contrastes de claro/escuro, grão direcional, funções disponíveis e material de referência. Há estratégias contextual, análoga, complementar, monocromática e contrastante. Superfícies quase neutras não recebem matiz estável. A seleção diversifica famílias e evita sugestões duplicadas com a mesma textura. A justificativa informa função, diferença de luminosidade e contraste interno. O valor numérico ordena os candidatos segundo o algoritmo.
- `composeGradient(from, to, {stops, face, candidates})` seleciona progressões entre dois cubos com programação dinâmica. A ordem nasce da projeção no segmento entre os dois extremos no espaço de cor, contraste e grão. O custo é a soma de desvios nas posições intermediárias. A faixa pode ter menos de 16 paradas quando faltam candidatos distintos no intervalo solicitado. As propriedades medidas também permitem chamar `groupMaterials(ids, {face, threshold})`, que agrupa apenas blocos suficientemente próximos de todos os membros do grupo.
- `generatePaletteStudy({family, pattern, seed})` produz um modelo canônico de 464 células com base, painel de 29 × 11 e régua superior. Aceita também `from`, `to` e `stops` para um gradiente calculado. As famílias **Mineral**, **Brasa**, **Maré** e **Florada** comparam uma rampa mineral neutra, uma sequência quente, uma combinação fria com cobre patinado e um estudo pastel com ametista e madeira de cerejeira.
- `applyPalette(model, {family, pattern, seed})` preserva a ocupação e os estados e recalcula o inventário. O modelo original pode ser reutilizado em outra comparação. As superfícies de cobertura usam coordenadas simétricas. O preenchimento usa uma faixa mais restrita e o ornamento usa acentos pontuais. O mesmo algoritmo espacial atua dentro de limites específicos de cada papel.
- `paletteMetrics(blocks, normal)` informa proporção do material dominante, alcance global de luminosidade, número de limites entre IDs e diferença de luminosidade média entre vizinhos de uma superfície escolhida. Esses números tornam comparáveis amostras produzidas com as mesmas dimensões.

### Experimento de repetição local

O painel Brasa tem 319 células no módulo de transição e 598 pares horizontais e verticais. As cinco distribuições mantiveram o primeiro e último material. A semente foi 42. Os dados abaixo foram calculados sobre a face sul. Os números não incluem o pedestal ou a faixa de amostras.

| Distribuição | Limites entre materiais | Média local de ΔL |
| --- | ---: | ---: |
| Linear | 102 | 0,019 |
| Degraus espaciais | 108 | 0,020 |
| Densidade ordenada, matriz 4 × 4 | 313 | 0,061 |
| Agrupamentos locais, células de 3 × 2 | 148 | 0,026 |
| Mosaico de losangos, período 6 | 109 | 0,020 |

A distribuição por densidade triplica aproximadamente os encontros entre materiais neste painel. Essa diferença permite escolher um acabamento de leitura mais quieta para uma grande superfície ou uma trama mais ativa para uma faixa curta. A textura individual, a câmera e o tema dia/noite também alteram a percepção.

### Reprodução

```sh
python scripts/measure-palette.py
node --test tests/palette-v2.test.mjs
node --input-type=module -e "import {recommend,composeGradient} from './architect/v2/palette.mjs'; console.log(recommend('mangrove_planks',{role:'ornament',family:'tidal',limit:3})); console.log(composeGradient('deepslate_bricks','calcite'))"
```

A regeneração do catálogo usa Python e Pillow e consulta o cache privado antes de acessar a tag oficial. A execução normal usa apenas os arquivos do repositório. Os seis testes cobrem os domínios legados, origem das faces, texto justificativo de recomendação, 20 combinações família × distribuição, os extremos de faixas calculadas e preservação de ocupação, estados e contagem. [Testes](../tests/palette-v2.test.mjs)

### Limites e próxima ampliação

Cada forma nova precisa de tradução correta de estados e faces na transformação e no renderizador. A terracota vitrificada, texturas afetadas por bioma e blocos que usam um sprite distinto em cada face lateral exigem ampliação específica do catálogo. O índice oficial contém mais de mil IDs além do recorte atual. Uma nova família deve começar por conferir seus estados e texturas, medir as superfícies, validar variantes direcionais em vistas ortográficas e testar ao menos uma composição em que seu uso mude a decisão arquitetônica.

