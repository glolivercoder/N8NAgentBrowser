# N8N Browser Agents

Uma extensão Chrome para criar agentes especialistas dentro do N8N para automatizar a criação de workflows, nós e triggers.

## Visão Geral

O N8N Browser Agents é uma extensão que integra a potência dos modelos de linguagem com a plataforma N8N, permitindo que usuários criem, analisem e otimizem workflows de forma automatizada através de uma interface amigável diretamente no navegador.

## Funcionalidades Principais

1. **Geração de Workflows Completos**
   - Crie workflows N8N completos a partir de descrições em linguagem natural
   - Inclui configuração automática de triggers, nós de processamento e ações

2. **Análise de Workflows Existentes**
   - Identifique gargalos e problemas de performance
   - Receba sugestões de otimização e boas práticas

3. **Assistente de Configuração**
   - Ajuda contextual para configurar nós complexos
   - Sugestões de parâmetros baseadas em casos de uso comuns

4. **Integração com OpenRouter**
   - Acesso a modelos de linguagem avançados
   - Flexibilidade para escolher diferentes modelos conforme a necessidade

5. **Biblioteca de Templates**
   - Acesso a templates pré-configurados para casos de uso comuns
   - Personalização rápida de templates existentes

## Arquitetura

A extensão é construída com uma arquitetura modular:

- **Background Service Worker**: Gerencia a comunicação com as APIs e o estado global
- **Content Scripts**: Integram-se à interface do N8N para fornecer funcionalidades contextuais
- **Popup UI**: Interface principal para interação com o usuário
- **API Integrations**: Conectores para OpenRouter e N8N API

## Integração com OpenRouter

A extensão utiliza a OpenRouter API para acessar modelos de linguagem avançados. O arquivo `openrouter-api.js` contém a implementação completa desta integração, incluindo:

- Autenticação e gerenciamento de chaves API
- Geração de completions com controle de parâmetros
- Streaming de respostas para feedback em tempo real
- Métodos especializados para tarefas relacionadas ao N8N

## Instalação

1. Clone este repositório
2. Abra o Chrome e navegue para `chrome://extensions/`
3. Ative o "Modo de desenvolvedor"
4. Clique em "Carregar sem compactação" e selecione a pasta do projeto
5. Configure sua chave API da OpenRouter nas configurações da extensão

## Uso

1. Navegue até sua instância do N8N
2. Clique no ícone da extensão na barra de ferramentas
3. Escolha a funcionalidade desejada:
   - Gerar novo workflow
   - Analisar workflow existente
   - Obter ajuda contextual

## Desenvolvimento

Consulte o arquivo [DESENVOLVIMENTO.md](./DESENVOLVIMENTO.md) para instruções detalhadas sobre como contribuir para este projeto, incluindo o checklist de desenvolvimento e boas práticas.

## Licença

Este projeto é licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

---

Desenvolvido com ❤️ para a comunidade N8N
