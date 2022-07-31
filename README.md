# Consultar CNPJ na receita usando AnyCaptcha

- Este código realiza webscraping na página https://servicos.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp, permitindo a Emissão de Comprovante de Inscrição e de Situação Cadastralde CNPJ seja feita de forma automatizada.

- Atráves desde código é póssivel criar uma api para realizar consulta de cnpj e extrair dados de empresas cadastradas na receita.

- O projeto utiliza a plataforma Anycaptcha para conseguir passar pela verificação captcha da página.

Neste repositório é incluindo também um webapp feito em nodejs para utilizar esta api, que pode ser acessada atráves do link de acesso do repositório, ou pode ser configurada localmente, como exemplificado abaixo:

## Rodar localmente

Garanta que você tem instalado [Node.js](http://nodejs.org/)

```sh
$ git clone https://github.com/wandersonsousa/consultarcnpj # or clone your own fork
$ cd consultarcnpj
$ npm install
$ npm run start
```

Seu app vai estar rodando em [localhost:5000](http://localhost:5000/).

## Deploy no heroku

```
$ heroku create
$ git push heroku main
$ heroku open
```
