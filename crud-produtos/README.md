# Trabalho 2 — Deploy automático em VM

## Integrantes

- Carlos Gabriel Alves Nascimento
- [Nome completo do segundo integrante]

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
