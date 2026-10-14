 GameHub

## Antes de alterar o código
- Faça login com a conta de demonstração.
- [ Abra o catálogo e observe a aba Network
- [ ] Digite uma busca devagar e depois cole um termo completo.
- [ ] Teste categorias e ordenação.
- [ ] Abra o dashboard e conte as consultas relacionadas aos indicadores
- [ ] Entre como administrador e cadastre um produto; observe a atualização do catálogo
- [ ] Exclua um produto e observe quantos dados são solicitados novamente
- [ ] Volte entre Dashboard e Produtos e observe se a página busca e renderiza o catálogo inteiro.
- [ ] Registre duração, quantidade de requisições e quantidade de produtos recebidos.
 [ ] Use os mesmos passos após cada correção.

## Testes de regressão
- Pesquisa por nome e descrição.
- [ ] Filtro por categoria.
- [ ] Ordenação por nome e preço.
- [ ] Cadastro e exclusão com conta de administrador; compare a quantidade de dados recarregados.
- [ ] Acesso negado para operações administrativas com conta de aluno
- [ ] Indicadores do dashboard compatíveis com o catálogo.
-[ ] Requisições simultâneas e respostas de busca em ordem diferente

Registre somente tempos medidos no seu computador; não invente resultados.


## Cenarios obrigatórios para a versão com gargalos

1. Após executar `npm run init-db`, confirme que a listagem mostra aproximadamente 60.000 produtos. Se mostrar poucos, o inicializador não foi executado contra o banco configurado em `back/.env`.
2. Abra DevTools > Network, filtre por `products` e digite `console` lentamente. Conte quantas requisições GET são disparadas enquanto digita
3. Na primeira carga, compare o tamanho da resposta JSON e o tempo de renderização na aba Performance. O navegador deverá montar o catálogo completo; não use apenas o tempo do filtro local como medida
4. Observe o terminal do backend: a mesma listagem é registrada duas vezes por busca e informa linhas/tempo de cada execução.
5. Abra o dashboard e observe o log de quatro consultas sequenciais
6. Compare os resultados com a versão resolvida, no mesmo computador, banco e navegador. Não use `setTimeout` ou `sleep` para fabricar lentidão: o exercício deve medir trabalho desnecessário real.

Atividade:

Missão
A aplicação foi entregue com gargalos de desempenho e dois bugs funcionais intencionais. Identifique e corrija os problemas sem remover funcionalidades. A base-alvo agora é de 60.000 produtos: o catálogo envia a coleção inteira, a página monta milhares de componentes, a busca faz requisição a cada tecla, a consulta de listagem é executada duas vezes e o dashboard percorre a tabela em consultas sequenciais. Os índices de nome/categoria também são removidos pelo inicializador, inclusive quando você reutiliza um banco de uma versão anterior. Investigue usando DevTools (Network e Performance), logs do back-end e medições. Observe também o que acontece depois de cadastrar ou excluir um produto: o catálogo completo é solicitado e renderizado novamente. Ao abrir o catálogo, espere a primeira carga terminar e confira quantos cartões existem no DOM. Em computador mais forte, use a aba Performance do DevTools e compare o tempo de scripting/renderização; o número de milissegundos varia conforme a máquina.

Além dos gargalos de desempenho, há dois bugs funcionais escondidos :Um relacionado ao filtro por categoria e outro à ordenação por preço. Reproduza cada comportamento, encontre a causa no código e registre o teste de regressão antes de corrigir.

## 🎯 Objetivo

Analisar o projeto GameHub, corrigir os erros existentes e melhorar o desempenho da aplicação, tanto no frontend quanto no backend e no banco de dados.

## 📋 Tarefas

1. **Corrigir os bugs:** verificar o filtro por categoria e a ordenação dos produtos por preço.
2. **Otimizar o catálogo:** evitar carregar todos os produtos de uma vez e melhorar a busca de produtos.
3. **Melhorar as consultas SQL:** identificar consultas desnecessárias ou ineficientes.
4. **Otimizar o dashboard:** melhorar a forma como os dados são consultados e apresentados.
5. **Implementar novas funcionalidades:** desenvolver novos recursos para o GameHub, adicionando mais possibilidades de uso ao sistema. Você deverá identificar oportunidades de melhoria e implementar funcionalidades além das que já existem.
6. **Testar as melhorias:** garantir que os filtros, a ordenação e as demais funcionalidades continuem funcionando corretamente.

Ao final da sprint, o GameHub deverá apresentar os bugs corrigidos, processos mais eficientes e melhor desempenho na navegação.

**Importante:** mantenham as funcionalidades existentes e evitem alterações que prejudiquem o funcionamento do sistema.