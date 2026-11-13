# Correção de materiais — evidência e abordagem

As sete imagens recebidas mostram defeitos do próprio visualizador: preto nas áreas transparentes do alçapão, lanternas/correntes/tochas simplificadas, folhas de textura usadas como ícones e iluminação local concentrada. Não são usadas para inferir IDs: IDs e estados continuam vindo da estrutura de 772 células.

Antes da integração: `bamboo_trapdoor` é uma placa de 3/16 com transparência da textura; remove-se a grade geométrica inventada. `iron_chain` usa dois planos cruzados de largura 3/16 e recortes de `chain1`/`chain2`, com eixo preservado. `lantern` usa recortes distintos da folha oficial (primeiro quadro de 16×16 da imagem de 16×48) para corpo, tampa e alça; `torch` usa o recorte central de `torch_on`, com inclinação conforme o estado. `scaffolding` usa as texturas TGA oficiais de topo, base e laterais com recorte alpha. `bell` usa as três texturas oficiais de faces e suporte pendurado; as dimensões finas continuam sem conferência no renderer Bedrock.

Fontes primárias: https://github.com/Mojang/bedrock-samples/tree/v1.26.60.5/resource_pack/textures . Os arquivos permanecem referenciados na origem; a pasta `.local/bambu-asset-audit` é privada e não faz parte do site. As URLs da Wiki enviadas pelo usuário foram consultadas, mas o serviço retornou 403/restrição; o painel adota linguagem de inventário com desenho CSS próprio. Não copia artigos ou folhas de textura para o pacote.

## Resultado da implementação

A transparência é recortada no material e no mapa de sombras. O picking também lê o alpha da textura para ignorar pixels vazados. As partes foram agrupadas em buffers por material com UVs já calculadas, eliminando a necessidade de modificar os shaders padrão de iluminação/sombra; o filtro recompõe somente os índices visíveis e o mapa de triângulos para blocos.

As texturas oficiais de todos os 23 tipos carregaram na sessão de teste, incluindo TGA de andaime. Os ícones usam os sprites oficiais de inventário para lanterna, corrente e sino e renders dos blocos com as mesmas geometrias/texturas para os demais. O desenho CSS do painel é próprio, inspirado em inventário, com contraste claro/escuro, slots e bordas em relevo. Sons, comportamento e crafting não foram adicionados ao produto.

Validação local em Chromium, viewport 1440×900 e DPR 1: 772 células renderizadas, 23 ícones, 80 combinações de estado com posições/normais/UVs finitas; as sete vistas enquadradas; partes 481/75/173/43 e progressão de dez blocos em cada; o raycast atravessou o pixel transparente do alçapão e selecionou a moldura opaca; inventário abre/fecha inclusive por Escape; toque foi exercitado em contexto móvel 390×844 e não houve overflow horizontal. Não ocorreram erros de página/console na suíte. Zero quadros novos em 1 segundo de repouso. Quadro completo observado: 22 chamadas de desenho e 11.658 triângulos; não é uma medição de FPS da máquina do usuário. JS de produção: aproximadamente 138,5 kB gzip, além de texturas externas e modelo.

Limite: a aparência foi comparada às imagens fornecidas e às folhas oficiais, sem uma nova conferência no renderer Bedrock. A iluminação é WebGL, sem propagação de luz do Minecraft; o sino, em especial, mantém simplificações de malha/suporte. A seleção e a estrutura de 772 células não foram alteradas. O site continua privado.
