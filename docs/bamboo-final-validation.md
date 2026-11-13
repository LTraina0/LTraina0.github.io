# Casa de Bambu final · validação em 12/11/2026

A casa central, duas pontes menores e a haste foram extraídas de uma cópia do Mundo De testes global salvo em 1.26.63.1. As 667 células são preservadas exatamente em posição de mundo, ID, estados e versão. A ponte maior foi composta com seções da ponte frontal finalizada e mantém o comprimento de 36 blocos medido no modelo survival anterior; são 251 células novas e uma soleira de ligação. Total: 919 células.

Frente +Z, ponte maior oeste -X conforme o terceiro print do usuário. Andaime central em (-4,-61,-10), bambu em X=-4,Z=-16. Nenhum deslocamento da haste, nenhum subterrâneo. Originais de jogo preservados; checkout do site isolado dos estudos navais em andamento.

## Verificação concluída

- Integridade da cópia: SHA-256 dos 12 arquivos iguais à fonte antes da extração; 17 CRC32C na leitura de SSTable/WAL ativos.
- `node --test tests/bamboo-final.test.mjs tests/block-light.test.mjs`: cinco testes de composição e seis verificações de iluminação aprovados. Domínios dos estados conferidos na curadoria oficial.
- `tests/bamboo-browser.mjs`: 37 verificações aprovadas, sete vistas completas, cinco módulos, montagem por bloco e camada, cortes nas 16 camadas, inventário com 24 IDs, seleção e detalhes do bloco, grade, dia/noite, viewport 390×844 sem overflow, carregamento dos três portais. Nenhum erro de página ou textura ausente.
- Comparação lado a lado dos prints e da prévia: cobertura escalonada, aberturas/alçapões, portões, beirais, pórticos, apoio de barro e haste. Os pilares usam regiões opacas corretas do atlas, sem os recortes transparentes que fragmentavam sua aparência.
- Revisão independente pelo agente de arquitetura: contagens, frente, módulos, bounds, gates, planta e emissão, sem bloqueantes adicionais.
- `git diff --check`: sem erros. Build e publicação registrados no recibo de entrega privado após sua execução.

Relatório e capturas no workspace privado: `output/casa-bambu-final-2026-11-12/browser-qa/report.json`, `comparison.html` e `comparison.png`. Os prints do usuário e os assets oficiais não foram adicionados ao código público.

## Limites

A geometria de portões e vegetação e a propagação de luz são aproximações da prévia web. Texturas e domínios se referem ao sample oficial v1.26.60.5; os IDs/estados colocados são confirmados pelo mundo 1.26.63.1. Não houve teste dentro do jogo nem declaração de equivalência ao renderizador Bedrock. O mundo original não recebeu alterações.
