# Como Configurar a API Key do OpenRouter

## 🔑 API Key Fornecida
```
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
```

## 📋 Passos para Configuração

### 1. Abrir a Extensão
- Clique no ícone da extensão N8N Workflow Assistant na barra de ferramentas do navegador
- Ou acesse através do menu de extensões

### 2. Navegar para Configurações
- Na interface da extensão, clique na aba **"Settings"**
- Você verá um formulário com vários campos de configuração

### 3. Configurar API Key do OpenRouter
- Localize o campo **"OpenRouter API Key"**
- Cole a API key fornecida:
  ```
  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
  ```

### 4. Configurações Adicionais (Opcionais)
Você também pode configurar:

- **N8N URL**: `http://localhost:5678` (padrão)
- **Docker Port**: `5678` (padrão)
- **Docker Data Path**: `./n8n-data` (padrão)

### 5. Salvar Configurações
- Clique no botão **"Save Settings"**
- Aguarde a confirmação de que as configurações foram salvas

### 6. Testar a Configuração
- Vá para a aba **"Tests"**
- Execute os testes de integração para verificar se tudo está funcionando
- Os testes do OpenRouter agora devem passar com sucesso

## 🧪 Resultados Esperados dos Testes

### Antes da Configuração:
```
✅ Passaram: 3
❌ Falharam: 5
Total: 8
```

### Após a Configuração:
```
✅ Passaram: 7-8
❌ Falharam: 0-1
Total: 8
```

## ✅ Verificação de Sucesso

Após configurar a API key, você deve ver:

1. **Testes do OpenRouter passando**:
   - ✅ Verificar Configuração da API Key
   - ✅ Obter Modelos Disponíveis
   - ✅ Gerar Workflow
   - ✅ Exportar Workflow
   - ✅ Ciclo Completo de Workflow

2. **Funcionalidades habilitadas**:
   - Geração de workflows via IA
   - Acesso aos modelos do OpenRouter
   - Exportação de workflows
   - Análise e sugestões de melhorias

## 🔧 Solução de Problemas

### Se os testes ainda falharem:

1. **Verifique a API key**:
   - Certifique-se de que copiou a chave completa
   - Não deve haver espaços extras no início ou fim

2. **Recarregue a extensão**:
   - Vá para `chrome://extensions/`
   - Encontre a extensão N8N Workflow Assistant
   - Clique no botão de recarregar (🔄)

3. **Verifique a conexão com internet**:
   - A API do OpenRouter precisa de conexão ativa
   - Teste acessando https://openrouter.ai

4. **Limpe o cache**:
   - Na aba Settings, procure por opção de limpar cache
   - Ou recarregue a página da extensão

## 📞 Suporte

Se ainda houver problemas:

1. Abra o console do navegador (F12)
2. Vá para a aba Console
3. Execute os testes novamente
4. Verifique se há erros específicos no console
5. Anote qualquer mensagem de erro para diagnóstico

## 🎉 Próximos Passos

Com a API key configurada, você pode:

1. **Gerar workflows automaticamente** usando descrições em linguagem natural
2. **Analisar workflows existentes** para identificar melhorias
3. **Exportar workflows** em diferentes formatos
4. **Usar o assistente IA** para dúvidas sobre N8N
5. **Criar automações Docker** para N8N

Aproveite todas as funcionalidades da extensão! 🚀