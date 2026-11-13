# Minecraft Architectural Agent · telhado oriental 0.1.0

A variante clássica ocupa 21 × 17 × 29 blocos (X, Y, Z). O projeto usa seis pilares, frontões nas duas extremidades da cumeeira e quatro águas no beiral inferior. É uma composição autoral a partir do briefing. Nenhuma imagem de uma construção foi fornecida para identificação ou comparação nesta missão.

## Operação

No BuildsMine, escolha **Telhado oriental · Laboratório**. Combine três inclinações, três elevações de canto e dois acabamentos. Os controles de parte e montagem funcionam em conjunto. A lista de materiais acompanha exatamente os blocos visíveis. O clique num bloco revela sua posição local, etapa, ID e estados. Para um modelo completo, restaure **Todas as partes** e **Construção inteira**.

Na raiz do workspace, o perfil de projeto do Codex fica em `.codex/agents/minecraft-architect.toml`. Nome para solicitar em uma tarefa: `minecraft_architect`. Um briefing de revisão pode pedir “Use minecraft_architect para comparar o frontão com esta referência e propor uma segunda versão”. A leitura de referências utiliza o Codex e a curadoria orientada pelo perfil. O motor determinístico existente nesta etapa cobre telhados. O despacho do perfil numa nova conversa e o ciclo com uma referência real ainda precisam ser exercitados.

Na pasta do estúdio, com Node 22, o CLI funciona sem WebGL, site, Minecraft ou MCP:

```powershell
node architect/cli.mjs roof --width 21 --length 29 --pitch 0.75 --lift 1 --palette slate > telhado.json
node architect/cli.mjs validate telhado.json
node --test tests/*.test.mjs
npm run build
```

Para transformar a construção, use `--rotate 90`, `--mirror-x` e/ou `--mirror-z` em `roof`. A largura ímpar aceita 17–41 células, o comprimento ímpar vai da largura até 65, a inclinação aceita 0,5–1 e a elevação dos cantos aceita 0–2 blocos. O parâmetro de inclinação mede a subida total por meio-vão, e a inclinação local aumenta na direção do cume. O formato numérico do CLI usa ponto decimal. Na web, as 18 combinações foram pré-calculadas com o vão padrão.

## Arquitetura e contrato

- **Geração.** `architect/roof.mjs` amostra uma curva convexa de inclinação em meios blocos, combina as águas de extremidade com o frontão e eleva os cantos. Nos patamares, usa peças inteiras ou lajes. Nas transições, orienta o patamar alto da escada conforme a inclinação local. As vigas transversais e os montantes centrais sustentam os frontões durante a montagem.
- **Modelo.** Cada célula de `blocks` registra X, Y, Z, ID Bedrock, estados e módulo. `modules` define o nome e a etapa, `joints` declara os encaixes esperados, `bounds` usa limites inclusivos e `materials` resume as quantidades. Parâmetros, versão do catálogo e transformações acompanham o modelo. O eixo +X aponta para leste e +Z para sul. A origem está no centro horizontal, à altura da base dos pilares.
- **Catálogo e transformações.** `architect/registry.mjs` fixa as formas e domínios válidos. `architect/model.mjs` transforma posição, eixo de tora, direção da escada, quiralidade de canto e face de dobradiça. A primeira etapa utiliza 15 IDs cadastrados. [Catálogo, texturas por face e fontes](./architect-materials.md)
- **Verificação.** `architect/validate.mjs` verifica cobertura, continuidade de cursos, juntas, módulos, estados, simetria, contagens, apoio, material e orientação. A conectividade de cada etapa exige contato de faces até um pilar já construído. `architect/contact.mjs` considera o volume ocupado por lajes, escadas e alçapões em vez de aceitar toda célula vizinha como apoio.
- **Adaptador.** O endpoint estático do Astro chama o gerador e o validador antes de serializar cada JSON. O navegador carrega apenas a variante selecionada. As peças do catálogo são instanciadas por estado e consultam o mesmo atlas. Filtros recompactam as matrizes, e cada índice de instância aponta para a célula original. As trocas de câmera e a inspeção reutilizam as malhas. O site solicita as imagens do repositório oficial da Mojang; em caso de falha, sinaliza as texturas afetadas.

## Resultados da revisão

| Variante inspecionada | Dimensões X × Y × Z | Células | Materiais | Chamadas de desenho em perspectiva |
| --- | --- | ---: | ---: | ---: |
| Suave, reta, ardósia | 21 × 15 × 29 | 1.475 | 11 | 26 |
| Clássica, curva, ardósia | 21 × 17 × 29 | 1.487 | 11 | 22 |
| Íngreme, elevada, pedra-negra | 21 × 20 × 29 | 1.596 | 11 | 22 |

Dez testes Node passaram, incluindo a suíte de iluminação existente. As verificações abrangem as 18 variantes, corrupção deliberada, ida e volta das transformações e os volumes de 40 combinações de escada, 16 de alçapão, três eixos de tora e duas metades de laje. O build gerou os 18 JSONs. Vite emitiu um aviso de tamanho no chunk compartilhado de Three.js.

Em Chromium, o teste comparou diretamente três modelos recebidos com a saída integral do núcleo. Conferiu posições, geometria por estado e quantidade das instâncias, sete vistas, zoom, rotação, enquadramento, seis módulos, inventário, seleção no canvas, dia/noite e os três modos de montagem. Os nove arquivos de textura carregaram. Também conferiu o layout a 390 × 844. A regressão existente da Casa e dos três Portais passou em 88 verificações, incluindo portões, temporizadores, cortes, inspeção e navegação. Resultados e capturas estão em `output/architect-roof/` na raiz do workspace.

## Escala e limites

Em uma cena sintética com repetições do telhado clássico, a 1280 × 800, Chromium headless e ANGLE/Direct3D 11 em Intel Arc, a cena completa de 10 mil células fez 22 chamadas e enviou 160.962 triângulos. O preparo de grupos levou 9,0 ms e o filtro de corte levou 2,6 ms. Com 100 mil células foram 22 chamadas, 1.623.138 triângulos, 37,8 ms de preparo e 12,2 ms de corte. Cada valor de tempo é uma amostra de CPU em uma sessão aquecida. O experimento não mediu FPS, transferência de uma construção diversa, tempo até primeira imagem, memória máxima ou desempenho num telefone físico. A repetição favorece instanciamento. Registre essas condições antes de comparar cenas mais complexas.

O catálogo e a inspeção geométrica cobrem os estados utilizados neste protótipo. A aparência com shaders, as atualizações de vizinhança, a iluminação e a reprodução no jogo ainda requerem teste Bedrock. Exportação, extensões do Editor e novos motores são etapas posteriores. O próximo componente proposto após a revisão visual é um arco com espessura e encaixe verificáveis. [Auditoria, integrações e plano de evolução](./architect-audit.md)

