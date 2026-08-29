# Governança de fontes nutricionais — NutriOS

## Princípio

O catálogo do NutriOS separa **dado nutricional normalizado** de **proveniência**. Cada alimento pode ter uma ou mais fontes documentadas, com versão, código externo, data de captura e observações de licença.

## TBCA

A TBCA pode ser usada como referência clínica e fonte externa. O NutriOS não deve copiar ou redistribuir em massa o conteúdo da TBCA em um produto comercial sem autorização/licença compatível.

Estratégia:

- armazenar referências/códigos externos quando permitido;
- manter a versão da fonte;
- permitir importação apenas quando houver base jurídica/licença adequada;
- nunca alterar silenciosamente valores importados: correções locais geram nova proveniência/versão.

## Tabela de Composição de Alimentos — Sonia Tucunduva Philippi

Trata-se de obra editorial protegida. O NutriOS deve tratá-la como referência bibliográfica até existir licença que autorize ingestão e uso no produto.

## Fabricantes e industrializados

Produtos industrializados devem ser cadastrados por versão de rótulo, preferencialmente com:

- marca;
- nome comercial;
- GTIN/EAN quando disponível;
- porção declarada;
- valores normalizados por 100 g ou 100 ml;
- energia, proteína, carboidrato, gorduras, gordura saturada, fibras, sódio, açúcares totais e adicionados quando declarados;
- ingredientes;
- alergênicos;
- alegações nutricionais;
- URL ou documento de origem;
- data de captura do rótulo;
- data/versão do fabricante quando disponível.

Mudança de formulação não sobrescreve o histórico. Deve gerar nova versão/fonte.

## Cadastro profissional

A nutricionista pode criar alimentos e preparações próprias. O sistema registra autoria, data e histórico de edição.

## Receitas

Receitas não armazenam nutrientes digitados manualmente como fonte principal. Seus valores nutricionais são calculados deterministicamente a partir dos alimentos cadastrados e das quantidades em gramas.

## IA

A IA pode:

- sugerir classificação;
- sugerir tags;
- apontar campos faltantes;
- comparar versões;
- propor regras de protocolo.

A IA não pode:

- inventar composição nutricional;
- substituir valores oficiais de rótulo ou fonte licenciada;
- publicar alterações de protocolo sem revisão profissional;
- criar alimentos invisíveis ao catálogo durante a geração de plano.
