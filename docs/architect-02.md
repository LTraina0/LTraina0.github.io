# Minecraft Architectural Agent · Evolução 0.2

O Ateliê de arquitetura do BuildsMine oferece 160 combinações de cobertura, 20 estudos de gradiente e oito montagens de componentes. O seletor principal dá acesso ao Ateliê e à cobertura 0.1. A comparação com câmeras vinculadas permite fixar uma variante, mudar uma decisão de projeto e inspecionar as duas à mesma escala.

## Do pedido ao modelo

1. **Interpretar a referência.** Registrar silhueta, profundidade, distribuição de cores e evidência sobre materiais. O agente consulta o índice Bedrock e decide quais peças já têm estados e forma validados para a prévia. [Auditoria da 0.1 e leitura das onze referências](architect-02-referencias.md)
2. **Projetar.** O Geometry Engine amostra superfícies na grade, compõe os planos, fecha as empenas, coloca vigas e consolos e reserva pontos de encaixe. O modelo carrega as posições e estados de cada bloco, módulo, etapa e componente. [Algoritmos, parâmetros, tipologias e erros de discretização](geometry-v2.md)
3. **Escolher o material.** O Palette Engine mede as faces, recomenda combinações por função arquitetônica e distribui materiais sob restrições de forma e estado. O ensaio de painel mantém as dimensões fixas para permitir a comparação do padrão. [Catálogo, métricas, distribuições e pesquisa](palette-v2.md)
4. **Compor.** O Kitbashing Engine monta colunatas, luminárias, acrotérios e pináculos usando blocos com geometria própria, pontos de encaixe e regras de apoio. O telhado ornamentado recebe dois pináculos nos encaixes da cumeeira. [Peças, fontes dimensionais e regras por forma](kit-v2.md)
5. **Validar e revisar.** A composição verifica ocupação única, limites, estados, contagens, contato positivo e conectividade por etapa. O Build do Astro chama os motores e empacota as células em JSON. O navegador recupera as células e deriva instâncias, inspeções, filtros e materiais da mesma construção. [Composição](../architect/v2/laboratory.mjs) · [Transporte](../architect/v2/transport.mjs) · [Estudos do site](../architect/v2/studies.mjs)

## Uso pelo agente

A partir da pasta do site, o Node executa o motor sem servidor ou sessão de Minecraft. Exemplos em PowerShell:

```powershell
'{"query":"bigorna","scope":"renderable"}' | node architect/v2/cli.mjs discover -
'{"family":"irimoya","finish":"tidal","ornament":"carved"}' | node architect/v2/cli.mjs roof - > estudo.json
node architect/v2/cli.mjs validate '@estudo.json'
'{"seed":"mangrove_planks","role":"ornament","family":"ember"}' | node architect/v2/cli.mjs recommend -
'{"from":"deepslate_bricks","to":"calcite"}' | node architect/v2/cli.mjs gradient -
```

Os comandos adicionais são `kit`, `panel`, `recolor`, `group`, `resolution` e `transform`. A CLI também aceita parâmetros de dimensões e curva além das combinações expostas no site. [Interface e formatos de entrada](../architect/v2/cli.mjs)

## Como avaliar

- Abra o Ateliê com `?build=atelier-02&compare=baseline`. Compare o recuo do frontão em vista lateral e a ligação dos braços dos consolos pela vista inferior. O exemplo inicial passa de 1.487 para 1.571 blocos. Inspecione o que os 84 blocos acrescentam à peça.
- Em **Coberturas**, fixe um estudo e altere a tipologia entre duas águas, quatro águas, irimoya e sobreposta. Mantenha a paleta para avaliar a silhueta. Em seguida mude apenas o acabamento e inspecione os IDs de escadas e lajes.
- Em **Gradientes**, fixe uma distribuição linear e troque para agrupamentos ou mosaico. Compare cor, frequência de transição e leitura à distância. No painel Brasa foram contadas 102 a 313 transições entre 598 pares vizinhos nas distribuições comparadas. Em **Materiais**, use **Explorar combinações** para consultar alternativas por bloco e papel.
- Em **Componentes**, aproxime a câmera e selecione a bigorna no capitel da colunata. Na luminária, veja por cima os aros e vazios. A vista inferior e o corte por altura também estão disponíveis. O quadro de materiais reflete as peças do estudo principal que passam pelo filtro.

## Cobertura e limites

O índice de descoberta fixa 1.466 IDs Bedrock da amostra v1.26.60.5. O visualizador do Ateliê cobre 92 IDs, dos quais 86 têm descritores cromáticos por face. Os demais IDs do índice são pesquisáveis para orientar nova curadoria. A forma da bigorna, do funil, do caldeirão e da haste usa referência dimensional Java identificada no caderno técnico. A verificação de contato usa as superfícies da prévia. Colisão, atualização de vizinhos, emissão e aparência no renderizador Bedrock exigem ensaios próprios. Os sprites oficiais ficam fora do pacote publicado. A fidelidade visual depende das texturas usadas pela prévia.

O Creator Tools MCP estava acessível para consultas e não informou uma sessão ativa do jogo. Bedrock Editor é o caminho para uma revisão futura em mundo de teste. Axiom e WorldEdit serviram para investigar seleção, repetição e transformações. ObjToSchematic orientou a distinção entre amostragem de superfície e seleção de material. A integração atual não depende de serviços desses projetos, nem requer conversão de modelos Java. [Minecraft Creator Tools](https://github.com/Mojang/minecraft-creator-tools) · [Bedrock Editor](https://learn.microsoft.com/en-us/minecraft/creator/documents/editoroverview) · [Axiom](https://axiom.moulberry.com/) · [WorldEdit](https://worldedit.enginehub.org/en/latest/) · [ObjToSchematic](https://objtoschematic.com/) · [Block Palettes](https://www.blockpalettes.com/palettes)

## Evidência e próximos passos

Os testes de Node abrangem o motor 0.1, os três motores novos, transformações de estados, entradas corrompidas e remontagem sem perda dos 188 estudos. O teste do navegador compara blocos e instâncias com o modelo canônico, examina as seis vistas ortográficas e a perspectiva, seleção nos dois painéis, iluminação, filtros, câmeras vinculadas e viewport móvel. Os relatórios e capturas da execução local estão em `output/architect-02` na raiz do workspace. O relatório de regressão dos projetos anteriores está em `legacy/regression.json` nessa pasta.

1. Fazer comparações pareadas com o Bedrock em condições e versão registradas, incluindo o apoio sob bigornas e o perfil lateral dos capitéis. Incorporar as divergências medidas ao catálogo e aos testes.
2. Introduzir faces direcionais de terracota vitrificada e confrontar o motivo contínuo sob rotação e espelhamento. Ampliar o catálogo por famílias completas com uma peça de teste por estado.
3. Acrescentar encontros de telhados e módulos de fachada em escala intermediária. Reutilizar os encaixes e verificar continuidade por etapa antes de compor edifícios maiores.
4. Medir latência, memória, carregamento e seleção em modelos de 50 mil e 100 mil blocos. Avaliar particionamento espacial com base nessas medições. A suíte desta versão cobre o acervo atual e os módulos demonstrados.

