# Validação e limites — 10/11/2026

## Modelo e arquitetura

A extração direta e `verificar-modelo.py` confirmam 772 posições únicas, os 80 estados de paleta, 23 IDs, volume 17 × 14 × 59 e hash do arquivo de origem. A camada secundária está vazia. A origem no mundo não foi incluída no JSON publicado: os números mostrados são locais à caixa.

O Portal existente é estático, com Three.js, fábrica compartilhada e instâncias. O novo projeto é Astro estático com Three.js isolado, sem depender do Portal nem dos seus arquivos ou identidade. Todos os assets visuais do novo projeto são próprios ou bibliotecas licenciadas; não contém cache ou textura oficial do Minecraft.

## Testes locais

- Build Astro/Vite e verificação de dados: passaram. O Vite avisou que o módulo principal excede 500 kB sem compressão.
- Chromium automatizado: 772 blocos presentes, 80 estados distintos, lista de 23 itens totalizando 772; camada local 3 mostrou 323 blocos; avanço de 123 blocos mostrou 123. Instâncias ocultas foram removidas das listas usadas para picking.
- Sete vistas: projeções das extremidades medidas dentro da área visível em 1440 × 900 e 390 × 844. Também foi ajustado o zoom ao trocar a proporção do viewport. O teste de projeção não é uma comparação com o Minecraft.
- Cursor: a seleção foi comparada com a interseção da instância. Toque real em contexto móvel: selecionou uma laje e abriu seus dados, sem erro de página. Modal de materiais, origem opcional e troca de tema foram exercitados; uma sessão funcional nova não registrou erros de console ou página.
- Cena completa após aquecimento, Chromium automatizado em DPR 1: 15 chamadas de desenho, 18.938 triângulos no quadro observado e zero quadros novos durante 1 segundo de repouso. Uma sombra direcional é gerada em mapa 1024² e recalculada ao alterar filtros; medidas não são FPS nem medem desempenho na GPU do usuário.

## Limitações

As imagens de referência temporárias indicadas não estavam mais disponíveis, portanto não foi possível comparação lado a lado ou aferir os detalhes diretamente com o mundo. Formas pequenas e texturas são aproximações descritas em `CURADORIA.md`; As UVs são recortadas por face na densidade de 16 pixels por bloco, porém as texturas próprias não reproduzem os pixels vanilla. Não há simulação do Minecraft ou do sino. A verificação do arquivo no jogo relatada pelo usuário não valida o renderizador web. O teste móvel foi em emulação, não em dispositivo físico. Nenhuma comparação de desempenho relativa ao Portal foi executada.

O agrupamento inicial por cuboide resultou em 129 chamadas; a versão atual usa atributos por instância e voltou a 15 no quadro observado. Os atributos de recorte foram comparados com os cuboides visíveis após um filtro de camada; o close foi comparado visualmente antes e depois do agrupamento.
A movimentação automatizada de câmera (12 pequenos deslocamentos) produziu 77 quadros até a amostragem, 16 chamadas no quadro observado com contorno de seleção e 18.938 triângulos; após a inércia terminar, não houve novos quadros durante 1 segundo. O total de quadros depende do ritmo da automação e não é uma medida de FPS.
