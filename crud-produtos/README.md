# Trabalho 2 — Deploy automático em VM

## Integrantes

- Carlos Gabriel Alves Nascimento
- Thaina de Sá

## Sobre o projeto

O projeto é um sistema de controle de produtos. Nele é possível cadastrar, consultar, editar e excluir produtos, informando nome, categoria, preço e quantidade em estoque.

Foram utilizados HTML, CSS e JavaScript na interface, Node.js no servidor e SQLite para salvar os dados. A aplicação roda com Docker e Docker Compose em uma máquina virtual Ubuntu no VirtualBox.

## Como funciona o deploy

O Runner self-hosted foi instalado na VM e conectado ao repositório do GitHub. Ele recebe e executa as tarefas da Action dentro da própria máquina virtual.

Quando uma alteração é enviada para a branch main, a Action baixa o código atualizado, verifica a configuração e executa o Docker Compose para atualizar a aplicação automaticamente. Os produtos cadastrados ficam salvos em um volume do Docker.

## Como acessar

Com a VM ligada e conectada à rede do laboratório, o sistema pode ser acessado pelo endereço:

http://172.16.9.133:3000

Caso o IP mude, é possível consultar o endereço atual usando o comando `hostname -I` no terminal da VM.

Para iniciar a aplicação manualmente, dentro da pasta `crud-produtos`, o comando é:

`docker compose -p estoque-crud up -d --build --wait`

Para as atualizações automáticas, a VM e o Runner precisam estar em execução.

## Teste da atualização

Para testar, alterei o título da página e enviei a alteração para o GitHub. Depois acompanhei a execução na aba Actions e atualizei a página no navegador para conferir o novo texto, sem executar o deploy manualmente na VM.



# Explicação Action - Deploy


jobs:
  deploy:
    runs-on: self-hosted
    defaults:
      run:
        working-directory: crud-produtos
        
    -> Uma única tarefa, chamada deploy.
      runs-on: self-hosted é a diferença principal: em vez de uma máquina do GitHub, ela roda na sua própria VM, onde você instalou o runner do GitHub. Por isso consegue mexer no Docker de lá.
      defaults.run.working-directory faz todos os comandos run: rodarem dentro da pasta crud-produtos (onde está o docker-compose). Isso não afeta os passos com uses:, como o checkout.


- uses: actions/checkout@v4
    -> Baixa a versão mais recente do repositório na VM, para que o Docker construa a aplicação com o código atualizado.


- run: docker ps
    -> Teste rápido: confirma que o runner tem acesso ao Docker. Se falhar (Docker parado ou sem permissão), o deploy para aqui.


- run: docker compose -p estoque-crud config -q
    -> Verifica se o docker-compose.yml está correto, sem subir nada (-q = silencioso, só reporta erro). O -p estoque-crud define o nome do projeto, mantendo sempre os mesmos containers entre deploys.


- run: docker compose -p estoque-crud up -d --build --wait
    -> É o deploy em si:
      --build: reconstrói a imagem com o código novo.
      up -d: sobe (ou recria) os containers em segundo plano.
      --wait: espera os containers ficarem saudáveis (healthcheck) antes de seguir.


- run: |
    docker compose -p estoque-crud ps
    curl --fail http://localhost:3000/health
          -> ps lista o estado dos containers no log.
            curl --fail chama o endpoint /health da aplicação; se responder com erro, o passo falha e o workflow fica vermelho, avisando que o deploy deu problema.



Blocos acima do jobs: que impactam
on: dispara a cada push na main ou manualmente.
concurrency com cancel-in-progress: false garante que dois deploys não rodem ao mesmo tempo: o segundo espera o primeiro terminar, em vez de cancelá-lo.
permissions: contents: read dá ao workflow só permissão de leitura do repositório, o suficiente para baixar o código.
Resumo

A cada push na main, a VM baixa o código, valida o Docker e o compose, reconstrói e sobe a aplicação, e por fim testa se ela está respondendo em /health.

