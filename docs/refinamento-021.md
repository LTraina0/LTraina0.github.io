# Refinamento 0.2.1 e inspeção por agentes

Esta revisão acrescenta um benchmark de fachada de 25 × 17 células em planta. A versão A tem 2.188 blocos; B e C têm 2.344. As coberturas, painéis e componentes 0.2 permanecem no Ateliê. O seletor Fachada integrada abre as variantes novas, e Comparação permite escolher A, B ou C à esquerda com a mesma câmera e luz.

## Auditoria da versão 0.2

| Prioridade | Causa observada no código e nas capturas 0.2 | Impacto | Correção e alcance |
| --- | --- | --- | --- |
| Alta | Elevação `lift` multiplicada apenas pela proximidade simultânea dos cantos | Beiral longo com leitura quase linear | Novo perfil `swept` combina a curva principal com uma elevação transversal que decai na quarta potência da distância à borda. O benchmark usa esse perfil. Os presets 0.2 mantêm seu perfil original para comparação. |
| Alta | Motor de paletas distribuía materiais pela posição inteira e por ruído | Muda o acabamento sem considerar proteção ou função | Novo estágio contextual mede normais expostas, abrigo até seis células, altura, profundidade e ritmo dos vãos. Atribui regras registradas em cada bloco. |
| Alta | Peças utilitárias dependem de referência dimensional Java | Forma plausível na web, equivalência Bedrock pendente | Auditoria oficial de IDs, estados e sprites com registro explícito de ausência de teste no jogo. Capitéis e remates com bigorna mantêm classificação experimental. |
| Média | Frontões de poucas fiadas e relevos esparsos | Profundidade pouco legível na perspectiva geral | Fachada mais larga, plano de fundo recuado, moldura e nervuras adicionais ligadas ao fundo. Vistas laterais e cortes expõem a seção. |
| Média | Consolo isolado sem pano de parede ou vãos | Difícil avaliar escala e qualidade do encontro | Os mesmos braços do Geometry Engine se apoiam em pilares, capitéis e travessas no benchmark. B e C usam três níveis compostos. |
| Média | Kitbashing centrado no remate e no capitel simples | Expressividade restrita a objetos verticais | Três peças reutilizáveis em células reais, abertura escalonada, capitel com braços cruzados e cornija com três projeções. |
| Média | Cumeeira como faixa de material e encontro superior uniforme | Hierarquia dependia quase só da cor | Reservamos cobre aos eixos e remates, separamos borda e campo da cobertura e preservamos os estados de escadas e lajes. A escada quantizada e a cumeeira continuam compostas por células vanilla. |
| Média | Diagnóstico disperso em objetos internos do visualizador | Automação depende da implementação de cada construção | API pública com cópias dos dados, paginação e controles com opções verificadas. Eventos de estado e manifesto de hashes permitem regressão entre build e produção. |

A inspeção das capturas 0.2 de frontões, consolos, tipos de cobertura e gradientes fundamentou essa priorização. A qualificação estética exige revisão do usuário nas mesmas vistas usadas para comparar A, B e C. O teste de contato mede a superfície de prévia cadastrada.

## Diferenças entre as fachadas

| Aspecto | A · Tradicional | B · Ornamental | C · Experimental |
| --- | --- | --- | --- |
| Forma | Dois níveis de consolos, verga reta, beiral contido | Três níveis, abertura escalonada, capitel de bigorna e cornija projetada | Mesma ocupação e estados de B para isolar o acabamento |
| Preenchimento | Rodapé mineral e campos claros protegidos | Mesmo sistema com acentos axiais em cobre | Rodapé azul, recuos ameixa e campos de cerejeira |
| Cobertura | Ardósia com margens de pedra-negra | Curva mais pronunciada e remates | Cobre envelhecido com pátina nas margens e sob recobrimentos |
| Ganho | Hierarquia mais sóbria e menor quantidade | Abertura e encontros mais expressivos em profundidade | Contraste de temperatura e textura concentrado por função |
| Limite | Menos detalhe na seção da verga | Maior altura e custo de construção, peças utilitárias experimentais | Pátina é composição de blocos encerados, sem simulação de envelhecimento |

A distribuição **Régua vertical · comparação** mantém as células e aplica faixas de cor ao pano. É um controle ilustrativo para comparar à distribuição arquitetônica. A composição contextual mantém a estrutura em madeira, diferencia o desgaste do rodapé, o abrigo dos recuos e os acentos no eixo. Cada célula registra a função e a justificativa de material em `appearance`. A madeira recebe `pillar_axis`, escadas recebem direção, canto e inversão, e alçapões preservam sua espessura e transparência.

## Fontes e fidelidade

A auditoria contém 92 IDs e 69 sprites, com faces, hashes, dimensões e alfa. Todos os estados utilizados pertencem ao domínio oficial consultado. O recorte da prévia restringe alguns domínios, como as direções de funil. A versão de dados é v1.26.60.5; a instalação lida é 1.26.6301.0. Não houve sessão ativa para teste de aparência, colisão, gravidade ou comportamento. A instalação do jogo e os mundos ficaram fora das alterações. [Auditoria Bedrock](bedrock-021.md) · [Evidência por bloco](../architect/v2/bedrock-evidence.json)

Os alçapões em folhas verticais preservam a geometria vanilla. A montagem no jogo exige orientar a dobradiça sobre apoio temporário onde o vão impede colocação direta e confirmar a atualização de vizinhos. A continuidade de face na prévia verifica a ligação geométrica do conjunto. Essa verificação não equivale a uma sequência de cliques de montagem em Sobrevivência.

## API de inspeção e DevTools

`window.BuildsMineInspector` fornece:

- `snapshot()` devolve projeto, variante, parâmetros, limites, módulos, componentes, validação, câmera, seleção, quantidades e diagnóstico do renderizador.
- `blocks({offset,limit,module,id})` pagina as células com ID, estados e metadados. O limite é 256 células por chamada.
- `controls()` lista os seletores e opções disponíveis na interface.
- `execute(name,args)` chama as mesmas operações registradas no WebMCP. Ações de visualização alteram somente a sessão da página. Pedir mudança do projeto retorna a URL de navegação para o cliente abrir.

As respostas são cópias. A API não entrega referências do renderer ou da cena. Os objetos internos previamente existentes continuam disponíveis ao código do próprio aplicativo.

```javascript
BuildsMineInspector.snapshot()
BuildsMineInspector.blocks({module: 'capital', limit: 12})
await BuildsMineInspector.execute('buildsmine_view', {id: 'lab-edition', value: 'C'})
await BuildsMineInspector.execute('buildsmine_view', {id: 'view', value: 'front'})
await BuildsMineInspector.execute('buildsmine_select', {x: 9, y: 8, z: 5})
```

Os eventos `buildsmine:ready` e `buildsmine:statechange` são emitidos no document. O segundo contém projeto e revisão. Os atributos `data-buildsmine-ready` e `data-buildsmine-revision` no elemento HTML são observáveis. A marca de performance `buildsmine-ready` identifica a conclusão do carregamento. Os controles mantêm IDs estáveis, labels e valores nativos de select. Os canvas recebem rótulo e foco, e os avisos de carregamento e seleção mantêm regiões acessíveis.

O DevTools pode inspecionar recursos, console, performance e instâncias pelo fluxo normal do navegador. `snapshot().rendering` informa draw calls, triângulos, geometrias, texturas e falhas de carregamento. Falhas JavaScript e promises ficam em um buffer de até 32 mensagens. A coleta ocorre sob demanda e a paginação limita o volume de dados. Eventos de interface não enviam telemetria.

## WebMCP disponível e diferenças de API

O draft de 10 de novembro usa `document.modelContext`. A implementação detecta essa API e, alternativamente, `navigator.modelContext` encontrado no Chromium de teste. As cinco operações são `buildsmine_inspect`, `buildsmine_controls`, `buildsmine_blocks`, `buildsmine_view` e `buildsmine_select`. As três primeiras são consultas. As demais atuam em controles ou seleção da prévia. Há validação de argumentos, opções e limites também em execução. O descarte da página aborta o registro. [Draft WebMCP](https://webmachinelearning.github.io/webmcp/) · [Prévia do Chrome](https://developer.chrome.com/blog/webmcp-epp)

O Chromium de teste, com `--enable-blink-features=WebMCP`, permitiu descobrir e executar as ferramentas nativas. Sua variante em navigator exige JSON serializado no segundo argumento de `executeTool`. O teste usa esse formato. O Chrome conectado via DevTools não expôs WebMCP, e a API JavaScript permaneceu acessível. A variante document é detectada e registrada quando existir, mas sua execução nativa não esteve disponível neste ambiente. Nenhum polyfill é apresentado como implementação nativa.

O registro existe enquanto a página está aberta. O suporte não cria servidor MCP HTTP e não permite publicar, editar arquivos, executar comandos ou operar contas. As ferramentas recebem somente dados do visualizador. A navegação de projeto é preparada como uma URL da mesma origem. A experiência convencional usa os mesmos handlers.

## Publicação e verificações

O build publica `/modelos/release.json`, com versão 0.2.1, SHA completo do commit de origem e SHA-256 de cada um dos 194 pacotes do Ateliê. A rotina de publicação cria o commit, compila esse commit e envia seu arquivo de distribuição ao Sites. O teste público confere o SHA do commit com o build local e baixa os 194 pacotes para comparar os hashes.

Comandos de verificação, a partir da pasta do site:

```powershell
node --test 'tests/*.test.mjs'
npm run build
node tests/inspection-browser.mjs
node tests/architect-lab-browser.mjs
node tests/roof-browser.mjs
```

Os testes de navegador usam `SITE_URL`, `QA_DIR`, `PLAYWRIGHT_MODULE` e `CHROMIUM_PATH` quando necessários. A regressão do acervo usa o script existente do workspace, preservado. Relatórios locais, capturas de A/B/C, seis vistas, componentes e viewport móvel ficam em `output/architect-021`. A validação publicada gera evidência em sua subpasta `publicado`.

O próximo passo de fidelidade é uma cena Bedrock de teste, com a versão e condições registradas, para comparar apoio e orientação das bigornas, seções das molduras, folhas das janelas e cantos das escadas após atualizações de vizinhos. A ampliação para edifícios maiores deve usar esse resultado.

