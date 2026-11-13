# O Último Encalhe — proposta autoral 0.3

A primeira proposta interpreta a maquete fragmentada do briefing como uma popa reaproveitada, com cabine, convés elevado, leme preservado e ruptura oblíqua. Um costado arrancado, um convés baixo com mastro caído, uma proa separada e poucas peças menores conservam o parentesco estrutural da embarcação. O gelo consiste em placas mínimas sob os apoios e acessos; não é a paisagem final.

[Pesquisa, fontes e curadoria anterior ao modelo](naufragio-03-pesquisa.md). Foram examinadas as 17 imagens do briefing e executadas frentes independentes de pesquisa naval, compatibilidade Bedrock e integração ao sistema existente. O projeto combina seções interpoladas do Geometry Engine, decisões materiais do Palette Engine e conjuntos reutilizáveis do Kitbashing Engine. Não foi criado outro visualizador ou um motor de física.

## Direção escolhida e alternativas

| Implantação | Dimensões X × Y × Z com contexto | Intenção | Compromisso |
| --- | --- | --- | --- |
| Abrigo da popa, principal | 54 × 23 × 84 | Núcleo dominante, ruptura exposta a estibordo, fragmentos assimétricos e acesso em cotovelo | Favorece a narrativa da maquete; os fragmentos laterais são examinados a partir do gelo |
| Fenda transversal | 47 × 23 × 89 | Costado e proa mais próximos do eixo perdido do navio | Facilita ler a embarcação anterior, mas é mais alinhada e menos dispersa |
| Deriva lateral | 65 × 23 × 84 | Fragmentos cruzados e implantação aberta | A silhueta muda significativamente; o percurso de recuperação é mais longo |

As alternativas reutilizam a mesma família de peças e o mesmo núcleo. Não são três galeões completos. Cada implantação possui acabamentos madeira envelhecida e percurso reparado, totalizando seis estudos. A comparação exclusivamente material preserva coordenadas, estados, módulos e formas. A camada clara adicional do acabamento reparado acompanha o eixo e as passagens recuperadas.

## Programa e módulos

O padrão tem 4.849 células canônicas: 3.032 da construção e 1.817 do contexto. Há 22 identificadores de material, incluindo madeira, ferragens, lona, gelo e neve. Os números incluem blocos colocados; não calculam ferramentas, perdas, drops ou receitas. Camadas de neve e portas são contadas como células do modelo, não automaticamente como itens necessários na mesma quantidade.

| Módulo | Função |
| --- | --- |
| context | Placas de gelo compactado e acumulações de neve em zonas de borda, separadas da construção |
| keel | Quilha sobrevivente, cadaste e leme |
| frames | Cavernames transversais de abeto descascado, distinguíveis das tábuas |
| hull | Costado em bojo, cintas longitudinais e espelho de popa |
| side-fragment | Grande fragmento com cavernames e pedaço de convés expostos |
| bow-fragment | Proa incompleta, quilha, costelas e remanescente axial |
| deck | Convés quebrado, travessas conservadas e vazio visível na ruptura |
| deck-fragment | Piso baixo recuperado, mastro/vergamento caído e peças soltas |
| walkways | Escada principal, acesso superior e passarela de recuperação |
| cabin | Compartimento fechado por madeira e painéis de alçapão, com porta em estado aberto |
| quarterdeck | Teto utilizável da cabine e galerias de popa |
| rails | Amuradas e guarda-corpos interrompidos nos danos e acessos |
| masts | Mastro inferior partido, verga incompleta e pequenos remanescentes |
| rigging | Correntes ortogonais, velame rasgado e pequeno galhardete preto de lã |
| accessories | Barris acessíveis, lanternas, cabrestante e cabeço de amarração |

A cabine reserva um interior de 11 × 9 células e cinco células de altura entre o piso e o teto, antes do mobiliário. Seis barris voltam sua face utilizável para o corredor. Há espaço reservado para uma cama futura; nenhuma cama fictícia foi desenhada. O modelo completo contém dez barris e três lanternas. O barril do cabrestante faz parte de uma composição visual e não de uma simulação mecânica.

Foram declarados 41 pontos no percurso principal, 16 no acesso superior e 24 na passarela recuperada da implantação principal. As alternativas têm percursos próprios. O teste amostra um corpo de 0,6 × 1,8 bloco e admite ajuste de degrau até 0,6. Confere apoio e espaço acima do piso. Isso não reproduz toda a física, salto, colisão ou pathfinding do jogador Bedrock.

## Forma e fratura

As seções transversais interpolam a largura entre estações longitudinais; o bojo abre progressivamente a partir da quilha. Cavernames e tábuas utilizam o mesmo perfil. Lajes e escadas mantêm sua ocupação em dezesseis avos, com espessura e orientação reais. As junções compartilhadas reutilizam uma célula existente, em vez de sobrepor dois materiais.

O costado a estibordo perdeu tábuas nas cotas superiores, preservando cavernames. O convés apresenta um grande rasgo com travessas interrompidas e comprimentos diferentes. A quebra do casco, os extremos de convés, o corrimão e os mastros não são cortados por um único plano. As fibras distinguem quilha longitudinal, cavernames, vigas e toras partidas. Nenhum bloco inteiro é inclinado por uma rotação arbitrária de malha.

O mastro baixo, a verga parcial, a corrente cortada pendente e o galhardete pequeno conservam a leitura de ruína. O galhardete é feito de células de lã; não se apresenta como uma bandeira vanilla com dados de entidade inexistentes. Não há velas intactas de um grande galeão.

A revisão visual reduziu as duas escadarias a dois blocos de largura, alternou trechos antigos e reparos no acesso principal, desgastou somente bordos externos do teto e interrompeu parte da cerca superior. O teto acima do interior permaneceu inteiro. Travessas rompidas e tábuas do fragmento de costado têm comprimentos diferentes. Essas correções respondem à leitura excessivamente íntegra da cabine e à dominância da escada na ferida do casco.

## Materiais e sobrevivência

Quilha e faixas inferiores empregam carvalho escuro; cavernames expostos usam abeto descascado. Tábuas superiores expostas e conveses usam abeto, com carvalho nos reparos. O costado sob recobrimento recebe madeira mais escura. A exposição é amostrada em quatro pontos das superfícies ocupadas, examinando os intervalos de sólidos nas doze células seguintes; folhas verticais e lajes não são tratadas como cubos. As madeiras não são pulverizadas aleatoriamente: função, altura em relação ao gelo, recobrimento e percurso declarado dirigem a composição. Cada bloco registra ID de entrada, ID selecionado, regra e contexto. A decisão material é reproduzida pelo validador, incluindo após transformações no referencial de projeto.

O inventário completo é calculado a partir das células canônicas e aparece no painel Materiais, também por módulo. Barris requerem barris reais; portas, cercas, correntes e lanternas mantêm formas e estados próprios. Prioridades de custo para Survival: ferro das correntes/lanternas, lã do velame e obtenção/transporte de gelo compactado. O gelo compactado exige atenção à obtenção com Silk Touch; o estoque e a versão mobile do mundo ainda não foram verificados. Não se usam novos tijolos de gelo/neve ou calcita de Preview.

## Fidelidade da prévia e limites Bedrock

`architect/v3/bedrock-evidence.json` documenta 28 candidatos selecionados e seus domínios de estados, confrontados com o metadata oficial v1.26.60.5. O catálogo não inclui famílias Preview. A instalação Windows observada foi 1.26.6301.0; a versão mobile permanece não verificada. Não havia sessão Minecraft acessível pelo MCP. Nenhum mundo ou instalação foi modificado.

Lanternas e correntes reaproveitam as receitas de sprites recortados e UV da Casa de Bambu: não são cubos genéricos. A corrente usa dois planos cruzados e os sprites chain1/chain2. As lanternas usam corpo e pescoço de dimensões nativas e alças com alfa. O barril distribui tampo, fundo e laterais conforme seis orientações. A porta tem duas metades, dobradiça, abertura e direção; sua receita dimensional ainda exige comparação dentro do Bedrock.

Os testes de contato usam caixas envolventes conservadoras para correntes e alças. Essas caixas não são suas malhas transparentes, nem garantem sua colisão no jogo. A cerca usa a forma visual de altura de uma célula; a colisão e as atualizações de vizinhança do Bedrock precisam de ensaio separado. Lanternas recebem iluminação pontual de prévia, sem oclusão por blocos ou propagação de luz Bedrock. O estado aberto da porta não comprova sua interação no jogo.

Permanecem pendentes: comparação dos UVs e dobradiças, conexão automática de cercas, cantos de escadas, colisões, uso dos barris, iluminação real, estados depois da colocação e execução manual das etapas. As rotinas validam os dados e a geometria da prévia; `validation.game` continua `pending`.

## Inspeção no BuildsMine

Novo projeto `naufragio-03`, estudo `shipwreck`. Os campos Implantação e Madeiras escolhem as seis variantes. Contexto permite embarcação e gelo, só embarcação ou só contexto, sem remover os apoios dos dados canônicos. Módulos, cortes por altura, etapas, sequência de blocos, materiais, seleção e comparação usam os controles existentes.

Os modelos usam as rotas `/modelos/atelier/shipwreck-COMPOSICAO-ACABAMENTO.json`. Exemplos: `shipwreck-haven-weathered`, `shipwreck-rift-weathered`, `shipwreck-drift-repaired`. O formato `buildsmine.cells/1` conserva todos os estados e metadados. `/inspecao/shipwreck-haven-weathered` oferece resumo HTML e links sem WebGL. `BuildsMineInspector.snapshot()` inclui `naval` com programa e rotas; os novos controles integram a allowlist existente. As ferramentas WebMCP continuam dependentes do suporte do navegador.

## Implementação e testes

- `architect/v2/naval-geometry.mjs`: interpolação de seções, fratura e linha voxel do Geometry Engine.
- `architect/v3/shipwreck.mjs`: composição autoral dos módulos e implantações, fonte única de dados.
- `architect/v3/naval-palette.mjs`: distribuição contextual e decisão reproduzível.
- `architect/v2/kit.mjs`: conjuntos navais de cabrestante e cabeço; transformações de cercas e portas.
- `architect/v3/naval-blocks.mjs`, `scripts/curate-naval.py`: catálogo seletivo, formas e verificação de domínios oficiais.
- `src/scripts/naval-assets.js`: malhas e UVs das formas especiais; integrado ao adaptador existente.
- `architect/v3/validation.mjs`: circulação, porta pareada, armazenamento, espaço reservado e justificativas materiais.
- Estudos, CLI, manifesto, inspeção textual e roteamento acrescentam o projeto preservando os anteriores.

`node architect/v2/cli.mjs wreck` gera JSON canônico, não conteúdo instalável no jogo. Os comandos transform e validate também transportam os dados navais. A interface usa instanciamento por geometria e estados; ocultar contexto ou módulos atualiza instâncias sem gerar outra arquitetura.

Os 51 testes Node incluem preservação exata dos 202 estudos anteriores, seis configurações navais, perfis, circulação, corrupções reproduzidas, porta pareada, metadados, estados, rotação/espelho, UVs de barris em seis direções e sprites especiais. O teste de navegador cobre seis variantes, três composições em sete vistas equivalentes, interior aberto por corte, seção longitudinal, materiais, contexto ocultável, seleção de módulos, comparação, noite, mobile e hashes legados. Os registros e PNGs ficam em output/ship-03 no workspace; o registro da publicação pública é separado da prévia local.

## Próxima fase

Avaliar a direção principal no estúdio e decidir quais destroços serão incorporados ao programa da base. Depois, executar a matriz Bedrock em um ambiente de teste autorizado. Só então detalhar fundações de implantação e a paisagem polar, com gelo, neve, cavernas e caminhos. Não foram gerados arquivos mcstructure, mcpack ou mcworld.
