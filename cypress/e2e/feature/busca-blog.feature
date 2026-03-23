# language: pt

Funcionalidade: Busca de artigos do Blog do Agi
  Como visitante do Blog do Agi
  Quero pesquisar artigos por palavra-chave
  Para encontrar conteudos relevantes ou entender quando nao existem resultados

  Contexto:
    Dado que acesso a pagina inicial do Blog do Agi

  Cenario: Buscar artigos com um termo existente
    Quando pesquiso por um termo existente
    Entao devo visualizar artigos relacionados ao termo pesquisado

  Cenario: Buscar artigos com um termo sem resultados
    Quando pesquiso por um termo inexistente
    Entao devo visualizar a mensagem de nenhum resultado encontrado