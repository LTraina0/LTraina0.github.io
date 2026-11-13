# Reconstrução naval · caderno de resolução

## Leitura anterior à modelagem

Na maquete do Space, o piso à frente da porta acaba em tábuas de comprimentos diferentes. O costado solto à esquerda revela a armação através de grandes vazios. À direita, um trecho do convés tombou e ainda conserva vigas sob o tabuado. As bases azuis individuais pertencem à apresentação da miniatura. Na versão 0.3, as placas de gelo seguem a projeção de cada destroço e a passarela em cotovelo organiza o espaço como um cais. A cabine retangular e a escadaria ocupam o centro da imagem. O gerador conserva a quilha e calcula o bojo, mas intercala o cavername e as tábuas na mesma casca. Aumentar o conjunto conservaria essas relações.

Concepção para os ensaios: uma embarcação de madeira com quilha longitudinal, seções que se abrem na barriga e se recolhem junto à borda, vaus apoiados em curvas e tábuas longitudinais. Um esforço lateral abre o costado, os vaus se rompem em pontos diferentes e uma faixa de convés com braçola de escotilha e parte da borda cai obliquamente. A estrutura menos danificada da popa poderá receber o abrigo entre conveses, conservando o espelho inclinado e o prolongamento dos costados. A causa do acidente é uma hipótese autoral.

## Materiais selecionados antes dos ensaios

Usar o catálogo já documentado em [evidência de estados](../architect/v3/bedrock-evidence.json) e [curadoria anterior](naufragio-03-pesquisa.md). O glossário do [Mary Rose Trust](https://maryrose.org/glossary/) distingue quilha, cavernames, cintas, vaus e curvas de união.

| Uso | ID Bedrock (prefixo minecraft:) | Face e estado relevante | Confiança |
| --- | --- | --- | --- |
| Quilha e cinta | dark_oak_log | Topos transversais ao eixo pillar_axis; casca nas laterais | Documental |
| Armações e vaus | stripped_spruce_log, spruce_log | Eixos x/y/z conforme a peça; topo exposto na quebra | Documental |
| Costado e tábuas | spruce_planks, dark_oak_planks, oak_planks | Madeira clara concentrada em reparos; carvalho escuro em fiadas protegidas | Escolha autoral, IDs documentados |
| Joelhos, bordas e splinters | spruce_stairs, dark_oak_stairs, spruce_slab, dark_oak_slab, oak_slab | Direção e inversão da escada, meia altura da laje | Esquema conferido; conexão no jogo pendente |
| Ponto de amarração | dark_oak_log, spruce_log | Cabeço com braços de veio transversal em células distintas | Composição do kit existente |

O gelo, a cabine e o velame ficam fora dos corpos de prova. Uma área vazia entre tábuas e vaus precisa continuar legível com os acessórios ocultos. As três resoluções amostram os mesmos perfis e linhas de fratura. Só o ensaio em Bedrock poderá confirmar a colocação e a vizinhança dos blocos.
