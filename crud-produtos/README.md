# Estoque — CRUD de Produtos

Trabalho 2: Deploy automático em VM — DevOps Avançado.

## Integrantes
- Carlos Gabriel Alves Nascimento
- Thaina de Sá

## O sistema
Cadastro, listagem, busca, edição e exclusão de produtos. Cada produto tem nome, categoria, preço e quantidade. O painel mostra número de produtos, unidades e valor total do estoque. A exclusão pede confirmação e os campos são validados no navegador e no servidor.

Tecnologias: HTML, CSS e JavaScript na interface; Node.js 24 no backend; SQLite em arquivo; Docker e Docker Compose; GitHub Actions com Runner self-hosted. Não precisa instalar pacotes npm. Interface e API usam o mesmo endereço.

## Executar no seu computador
1. Instale Node.js 24 ou superior.
2. Abra o terminal dentro desta pasta.
3. Execute `npm start`.
4. Abra http://localhost:3000 no navegador.

Não abra o HTML com duplo clique ou Live Server: ele precisa do servidor Node para acessar o banco.

Os dados ficam em `data/estoque.sqlite`. Não apague a pasta se quiser manter os cadastros. Para verificar o CRUD e a persistência: `npm test` (usa a porta 3099 e um banco temporário).

## Executar com Docker na VM
Com Docker Engine e o plugin Docker Compose instalados:

```bash
docker compose -p estoque-crud up -d --build --wait
```

Acesse `http://IP-DA-VM:3000`. Descubra o IP com `hostname -I`. Configure a rede da VM para permitir acesso a partir do seu computador (ex.: adaptador em modo bridge) e, se houver firewall, permita a porta 3000 na rede do laboratório.

O volume `estoque-crud_estoque_data` preserva o banco durante os deploys. Não use `docker compose down -v`, pois essa opção apaga os dados.

## Configurar o deploy automático
1. Crie um repositório GitHub e envie todos os arquivos, inclusive `.github/workflows/deploy.yml`. A branch usada é `main`; ajuste o workflow se sua branch tiver outro nome.
2. Na VM Ubuntu, instale Docker Engine e Docker Compose. O usuário que executará o Runner precisa conseguir executar `docker ps` sem sudo.
3. No repositório, abra **Settings → Actions → Runners → New self-hosted runner** e escolha Linux e a arquitetura da VM.
4. No terminal da VM, siga os comandos de download e configuração fornecidos pelo próprio GitHub. Use o token fornecido nessa tela; não coloque esse token nos arquivos do projeto.
5. Inicie o Runner com `./run.sh` e mantenha o terminal aberto. Para executar como serviço, use `sudo ./svc.sh install` e `sudo ./svc.sh start` na pasta do Runner, depois da configuração.
6. Confirme no GitHub que o Runner aparece **Idle/online**.
7. Envie uma alteração à branch `main`, ou execute o workflow manualmente pela aba Actions.
8. A Action baixa o código na VM, executa os testes dentro de um container Node e recria a aplicação com Docker Compose. O deploy espera o healthcheck confirmar a aplicação.
9. Abra `http://IP-DA-VM:3000` para conferir o resultado.

Use o mesmo nome de projeto Compose `estoque-crud` nos comandos manuais e no workflow para manter o mesmo volume e a mesma aplicação. O primeiro teste local feito somente com Node usa um banco diferente do volume Docker.

## Demonstrar ao professor
1. Cadastre um produto, edite, busque e exclua para demonstrar o CRUD.
2. Cadastre outro produto e mantenha-o salvo para demonstrar a persistência.
3. Em `public/index.html`, altere o título “Seus produtos, organizados.” para “Deploy automático funcionando!”.
4. Faça commit e push na branch `main`.
5. Mostre a execução verde na aba Actions.
6. Atualize o navegador no endereço da VM: o título deve mudar e o produto cadastrado deve continuar salvo.
7. Mostre o Runner online e os containers com `docker compose -p estoque-crud ps`.

## Antes de entregar
- Preencha o nome do segundo integrante.
- Acrescente neste README o IP/porta reais da VM e, se desejar, prints da execução.
- Envie o link completo do repositório ao líder, identificando o Trabalho 2.

## Limites desta entrega
Projeto acadêmico sem login, destinado à demonstração na rede do laboratório. Quem acessar o endereço pode alterar os produtos. O projeto inclui a configuração de deploy, mas a criação da VM, instalação do Runner e a execução no seu GitHub precisam ser feitas no seu ambiente. Não publique um Runner self-hosted em repositório que execute código de contribuidores não confiáveis.
