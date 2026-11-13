# Refinamento 0.2.2

O benchmark térreo usa cotas compartilhadas e fechamento superior com montantes e treliças. O conjunto mantém o acesso central e as muretas ornamentais frontais. As variantes A, B e C da 0.2.1 ficam congeladas por SHA-256. Os 194 estudos anteriores são comparados à publicação 13 em tests/fixtures/release-021.json.

## Causas e correções

| Achado da auditoria | Causa na 0.2.1 | Regra 0.2.2 |
| --- | --- | --- |
| Vazio entre parede e telhado | Parede até Y=9 e cobertura deslocada por seis células, com cota-base dependente de camadas | As cotas do piso, topo de parede, travessa, capitel e cobertura são declaradas em datums. O fechamento superior segue a primeira superfície de cobertura ou frontão em cada coluna. |
| Faixa aberta sob o frontão | O sill usava top+1 e deixava meio bloco acima da laje inferior | Uma fiada de encontro liga o frontão à superfície ocupada da cobertura. O validador verifica contato de área positiva com os dois componentes e detecta o defeito original. |
| Consolos muito altos e repetitivos | Espaçamento vertical fixo de duas células por camada | Camadas compactas com avanços graduais. Os braços radiais, travessas tangenciais, apoios, retornos de canto e terminações recebem função própria. |
| Gargalo visual das bigornas | Um pescoço estreito de metal entre massas de madeira | Capitel de madeira com ombros em escada e lajes como padrão. Bigorna permanece selecionável e experimental. |
| Fundo confundido com a entrada | Moldura próxima à parede e fechamento posterior alinhado à projeção frontal | Moldura avança uma célula. O pano posterior recua duas e as paredes laterais acompanham. O volume central tem verificação geométrica de espaço livre. |
| Faixas materiais excessivamente uniformes | Distância ao eixo e abrigo binário predominavam | Seleção por função, orientação, profundidade, exposição geométrica amostrada, altura, repetição, apoios, cumeeira, cantos e grão da textura da face. |
| Justificativas incompletas | Rótulo não descrevia todos os caminhos da decisão | Cada bloco registra inputId, selected, ruleId, rule, score e os valores contextuais. O validador refaz a decisão a partir desse registro e confronta os metadados. |

## Cotas e encontros

Para o padrão de três camadas e uma célula de espessura, o piso termina em Y=2, a parede em Y=10, a travessa em Y=11 e a cota de referência da cobertura é Y=16. A fórmula de composição é roofDatum = wallTop + layers + thickness + 2. A posição do fechamento superior é calculada a partir da seção efetiva de cada coluna, com 50 seções verificadas. Doze encontros explícitos da fiada do frontão são conferidos na variante padrão.

Variar layers entre 1 e 3, thickness entre 1 e 2 e rise nos valores ensaiados 6, 8 e 9 recalcula o fechamento. A validação cobre 36 combinações de camadas, espessura, altura e consolo. A composição inválida é rejeitada antes de produzir o pacote de visualização.

A abertura central tem um volume livre declarado de X=-2..3, Y=2..5 e Z=-4..7, com máximos exclusivos. São cinco células de largura e três de altura. Esse volume é uma regra de projeto da prévia e requer validação de colisão no jogo. As treliças superiores são aberturas transparentes intencionais. A inspeção de fechamento verifica a folha geométrica dos alçapões e permite seus recortes de textura declarados como janela.

## Alternativas visuais

| Estudo de referência | Consolo | Capitel | Materiais | Blocos |
| --- | --- | --- | --- | ---: |
| B 0.2.1 | Três camadas originais | Bigorna | Estrutural original | 2.344 |
| R1 0.2.2 | Escalonado compacto | Madeira | Mineral | 2.592 |
| R2 0.2.2 | Leque com maior projeção tangencial | Madeira | Mineral | 2.608 |
| R3 0.2.2 | Escalonado compacto | Bigorna experimental | Mineral | 2.578 |
| R4 0.2.2 | Escalonado compacto | Madeira | Cobre e pátina | 2.592 |

As oito combinações de dois consolos, dois capitéis e dois acabamentos estão disponíveis no estúdio. R1 e R4 preservam todas as posições, estados, módulos e formas. A troca de paleta altera os IDs e seus metadados de acabamento.

R1 mede 25 × 26 × 17 células. B 0.2.1 media 25 × 31 × 17. Os consolos passam de 144 células no benchmark anterior para 76 no escalonado ou 92 no leque. O ganho visual deve ser avaliado nos encontros e nas proporções. O aumento do total de blocos inclui o fechamento superior, que possui 257 células no padrão.

## Validação geométrica e funcional

O validador composto mantém estados, inventários, limites, unicidade das coordenadas e conectividade por etapa. A extensão arquitetônica acrescenta superfícies de fechamento, ligações do frontão, compatibilidade entre módulos, volumes de circulação e limites das formas por célula. A unicidade das células e a verificação de que seus sólidos permanecem dentro delas impedem interseções volumétricas entre blocos cadastrados. As caixas sobrepostas de uma mesma peça formam a união visual desse bloco.

As faces são verificadas em dezesseis avos. As transformações transportam estados, planos de fechamento, cotas locais, juntas e volumes de circulação. A base de eixos de projeto acompanha rotações e espelhos. Isso permite inspecionar os encontros também sem depender exclusivamente da lista de juntas emitida pelo gerador.

As regressões reproduzem a abertura de meio bloco na 0.2.1, o envelope ausente, a retirada da fiada, uma laje indevida, o painel interrompido, um módulo incompatível, o acesso obstruído e uma justificativa adulterada. Os casos defeituosos são rejeitados. As 42 verificações unitárias incluem as suítes anteriores e os testes novos. O detector também distingue abrigo sob laje de uma folha vertical na mesma célula, usando sua forma parcial.

## Materiais

A exposição aproximada usa quatro amostras sobre a superfície real de cada bloco e raios verticais de até doze células. O cálculo distingue escadas, lajes e folhas. A orientação usa os eixos locais da fachada. Recuo, altura, ritmo modular, distância dos apoios, bordas e cumeeiras participam das decisões. Os descritores de textura derivam das faces curadas existentes.

A função architecturalMaterialDecision é compartilhada pela aplicação de paletas e pela conferência de metadados. A regra selecionada e o score podem ser reproduzidos. O contexto permanece no referencial de projeto declarado quando o modelo é transformado. A exposição geométrica e os limiares de composição são aproximações de projeto. Não reproduzem a iluminação, a chuva, o bioma ou o envelhecimento dinâmico do Minecraft.

## Arquivos e funções

- architect/v2/geometry.mjs amplia generateGeometry com datum, bracketStyle e sealGables opcionais. Os padrões da 0.2.1 mantêm o resultado original.
- architect/v21/components.mjs amplia composeComponent com capitel de madeira opcional.
- architect/v21/contextual-palette.mjs acrescenta applyArchitecturalPalette, architecturalMaterialDecision e assertMaterialMetadata. A distribuição antiga permanece usada pelas variantes congeladas.
- architect/v22/facade.mjs contém generateRefinedFacade, o compositor do benchmark que utiliza os três motores existentes.
- architect/architectural-validation.mjs contém auditArchitecture, assertArchitecture, coversFace e transformArchitecture.
- architect/v2/laboratory.mjs, studies.mjs e cli.mjs integram os estudos e a validação ao fluxo normal.
- O adaptador BuildsMine expõe os novos seletores, comparação com B 0.2.1, cotas e contratos de inspeção. Camadas, materiais, etapas, seleção, WebMCP e acervo continuam nos mesmos componentes.
- tests/refinement-022.test.mjs e tests/refinement-browser.mjs registram regressões e comparações visuais. tests/fixtures/release-021.json fixa os hashes dos estudos anteriores.

## Uso

A partir da pasta do site, em PowerShell:

```powershell
'{"bracketStyle":"balanced","capital":"timber","palette":"mineral","layers":3,"thickness":1,"rise":8}' | node architect/v2/cli.mjs refine -
'{"bracketStyle":"fan","capital":"anvil","palette":"patina"}' | node architect/v2/cli.mjs refine -
node --test 'tests/*.test.mjs'
npm run build
node tests/refinement-browser.mjs
```

Os testes de navegador aceitam SITE_URL e QA_DIR. Quando AUDIT_CAPTURE_FILE aponta para o registro da auditoria anterior, as matrizes de câmera e luzes são comparadas a ele. As capturas têm 1250 × 760 pixels, escala comum, modo diurno e perfil sRGB. O quadro geral usa os limites da variante B 0.2.1 para os dois modelos.

Há sete vistas para B e R1/R2/R3/R4, detalhes comuns dos encontros, cortes horizontais Y=12 e Y=17 e uma seção X=1. A seção X=1 revela o encontro ao lado do montante central. Os rótulos da vista acompanham a câmera efetiva. Os relatórios e imagens ficam em output/architect-022 no workspace.

## Bedrock e pendências

O MCP retornou nenhuma sessão ativa. A instalação relida é 1.26.6301.0 e a base documental continua v1.26.60.5. As novas variantes permanecem com validation.game=pending. A bigorna e os remates funcionais da opção experimental dependem da conferência de malha, UVs, gravidade, vizinhos e colisão. O capitel de madeira usa as formas canônicas mais bem caracterizadas, com teste no jogo ainda pendente. [Matriz de ensaios](bedrock-022.md)

Os testes da prévia não validam a sequência manual de colocação no jogo. Algumas folhas podem exigir apoio temporário. Cantos de escadas e conexões de muros podem ser atualizados por vizinhos. A exportação e os mundos existentes ficam fora desta revisão.

A evolução seguinte depende da avaliação dos encontros e da matriz Bedrock. Os casos de regressão e as variantes congeladas servem de referência para novas correções dos mesmos componentes.

