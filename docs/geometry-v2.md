# Geometria arquitetônica 0.2

## Auditoria antes da implementação

A versão 0.1 usa uma função de elevação com três cursos de quadril fixos, seis pilares no tamanho padrão e uma curva quadrática transversal. Ela já transforma coordenadas e estados de escadas, toras e alçapões, valida contato de faces e separa a montagem em seis módulos. Esses comportamentos são a base de regressão. [Motor original](../architect/roof.mjs) · [Validação original](../architect/validate.mjs)

**Limitações confirmadas no código.** A superfície tem apenas uma tipologia e a cumeeira acompanha sempre Z. O avanço do beiral, a espessura, os montantes dos painéis e os dois níveis de consolos são fixos. O frontão tem um plano de preenchimento e alçapões pontuais ao exterior. Duas paletas substituem telha, laje, escada e cumeeira por tabela.

**Hipóteses verificáveis.** O afastamento entre um plano de preenchimento e as travessas de fachada pode produzir sombras e vazios reconhecíveis nas vistas oblíquas. Separar os braços transversais dos assentos longitudinais pode tornar legível como o consolo chega à cobertura. A malha de meios blocos pode aproximar a curva com erro vertical menor que a malha de inteiros. A inspeção de imagens e os testes quantitativos têm funções distintas.

**Oportunidades.** Parametrizar seções e encontros, comparar uma cobertura integral a um anel com lanternim, permitir um ensaio sem ornamentação e expor pontos de encaixe sobre peças inteiras da cumeeira.

## Referências estruturais

No Japão, o exemplo *futatesakigumi* documentado pelo JAANUS descreve dois avanços e a mudança de direção entre um braço que sai do plano da parede e outro paralelo a ela. O repertório de *kumimono* também contém configurações próprias de períodos e edificações específicos. O motor abstrai o princípio de braços, assentos e travessas em direções alternadas. [JAANUS, Futatesakigumi](https://aisf.or.jp/~jaanus/deta/f/futatesakigumi.htm)

Para os conjuntos chineses *dougong*, a documentação de pesquisa do Museu do Palácio distingue seções, posições de canto e variantes históricas. A geometria abaixo é um estudo modular autoral, sem atribuição de autenticidade a um sistema histórico. [Museu do Palácio, estudo de conjuntos de canto](https://www.dpm.org.cn/Uploads/File/2018/06/05/u5b16518592d06.pdf)

As imagens de colunatas e paletas do Pinterest fundamentam estudos de repetição, leitura da silhueta, relação entre peça estreita e capitel largo e diferença entre cor e forma. A imagem fornecida não determina dimensões nem IDs Bedrock. O protótipo de telhados usa a paleta e as formas de referência registradas no catálogo 0.1. [Catálogo de materiais](./architect-materials.md)

## Seções e componentes implementados

| Família | Construção geométrica | Seção padrão |
| --- | --- | --- |
| Duas águas | Extrusão de dois perfis transversais na direção da cumeeira. Os painéis das empenas recuam sob os beirais de topo. | Cumeeira com 29 células |
| Quatro águas | Envelope inferior das rampas lateral e longitudinal. Os quadris se encontram numa cumeeira curta ou em um único remate para a planta quadrada. | Cumeeira com 9 células |
| Irimoya | As duas rampas longitudinais terminam numa linha de quebra. O fechamento na transição usa um painel de bambu, estrutura saliente e uma empena abaixo das duas águas superiores. | Cumeeira com 21 células |
| Sobreposta | Uma saia de quatro águas deixa uma abertura retangular. Um tambor com montantes, travessas e vazios sustenta outra cobertura com dois blocos de sobreposição horizontal. | Dois níveis fisicamente distintos |

O perfil transversal combina a reta e uma parábola em função da distância ao beiral. A elevação dos cantos varia simultaneamente com X e Z e se desvanece em direção aos eixos. A contribuição longitudinal é localizada nas extremidades. Em cada coluna, a superfície contínua é amostrada na malha de meios blocos. O gerador usa a derivada estimada pelos vizinhos para orientar o patamar alto. Cursos nivelados têm lajes ou cubos. Cantos de escada nas águas convergentes recebem o estado correspondente. A espessura e a menor elevação adjacente determinam o preenchimento na face inferior.

Os braços radiais dos consolos avançam por níveis. Cada extremidade sustenta uma travessa tangencial com três peças de apoio. Os eixos das toras acompanham cada mudança de direção. As terminações esculpidas usam escadas invertidas. Cada frente usa um plano de fundo, uma moldura mais externa, um montante central apoiado na viga e, no acabamento esculpido, peças diagonais e alçapões projetados. Nos encontros com os apoios, a madeira do consolo ocupa o lugar do montante e o preenchimento termina junto a ela.

O motor retorna células canônicas, módulos usados, inventário, limites e um ou dois pontos de encaixe sobre a cumeeira. A posição de cada encaixe indica a primeira célula livre sobre um bloco inteiro de cobre. O autor chama `generateGeometry(options)` em `architect/v2/geometry.mjs` e passa o modelo a `validateGeometry(model)` antes da composição. O mesmo modelo pode receber a paleta e as peças inseridas pelo adaptador.

| Parâmetro | Intervalo e significado |
| --- | --- |
| width / length | Dimensões ímpares. Largura entre 17 e 41. Comprimento entre a largura e 65. |
| rise / pitch | Escolha a subida em blocos (mínimo 2, máximo 1,35 × meio-vão) ou inclinação média de 0,30 a 1,35. |
| curve / lift | Mistura de reta e parábola de 0 a 1. Elevação de canto de 0 a 3 blocos. |
| thickness / overhang | Um a três cursos de base sob o acabamento. O eixo dos pilares recua de dois a cinco blocos em relação à borda. |
| supports / stations | De dois a cinco pórticos. O padrão distribui estações em pares simétricos. Por API, estações Z inteiras em ordem crescente podem substituir a distribuição. |
| bracketLayers / bracketDepth / bracketWidth | Um a três níveis. Avanço entre um bloco e o comprimento do beiral. Meia largura da travessa de um ou dois blocos. |
| gableFraction / ornament | Proporção de 0,35 a 0,80 para o frontão irimoya. O acabamento alterna entre simples e esculpido. |

Estações vizinhas precisam comportar as duas travessas adjacentes. A empena irimoya requer espaço vertical para dois cursos entre a borda inferior da abertura e o intradorso. Combinações inviáveis são recusadas com indicação do parâmetro. Escalas menores reduzem a resolução visível da curvatura mesmo quando todos os encaixes passam.

## Benchmark de resolução e regressão

Erro médio absoluto em blocos entre a altura analítica e a altura quantizada no plano da malha, antes do remate da cumeeira. Parâmetros padrão, dimensão 21 × 29, subida de sete blocos, curva 0,55 e elevação de dois blocos.

| Tipologia | Amostras | Malha inteira | Malha de meios blocos |
| --- | ---: | ---: | ---: |
| Duas águas | 609 | 0,189 | 0,099 |
| Quatro águas | 609 | 0,216 | 0,112 |
| Irimoya | 609 | 0,201 | 0,107 |
| Sobreposta | 745 | 0,217 | 0,111 |

O teste usa também largura 33 e subida proporcional ao vão. Esta métrica mede arredondamento de elevação. A superfície de uma escada varia dentro da célula, e a leitura de uma silhueta precisa de inspeção visual separada.

Seis testes automatizados cobrem as 32 combinações de comparação, contato real das formas cadastradas em cada etapa, cobertura de cada célula da superfície, extensão e continuidade de cumeeiras, profundidade dos frontões, simetria de estados, transformação, encaixes, rejeição de parâmetros e corrupção deliberada. O contato é o obtido pelas máscaras de face das formas da prévia. Equilíbrio estrutural histórico, carga e atualizações de vizinhança no jogo ficam fora dessa medição.

