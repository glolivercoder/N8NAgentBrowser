/**
 * Content script para integração com a interface do N8N
 * Este script é injetado nas páginas do N8N para adicionar funcionalidades
 */

// Estado do script
const state = {
  isN8nInterface: false,
  currentWorkflow: null,
  modalOpen: false
};

// Verificar se estamos em uma página do N8N
function checkN8nInterface() {
  // Verificar elementos específicos da interface do N8N
  const n8nContainer = document.querySelector('.n8n-main-container');
  state.isN8nInterface = !!n8nContainer;
  
  if (state.isN8nInterface) {
    console.log('N8N Workflow Assistant: Interface N8N detectada');
    injectCustomStyles();
    setupObservers();
  }
  
  return state.isN8nInterface;
}

// Injetar estilos personalizados
function injectCustomStyles() {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .n8n-assistant-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }
    
    .n8n-assistant-modal-content {
      background-color: white;
      border-radius: 8px;
      width: 80%;
      max-width: 800px;
      max-height: 80vh;
      overflow-y: auto;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
    }
    
    .n8n-assistant-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .n8n-assistant-modal-body {
      padding: 16px;
    }
    
    .n8n-assistant-modal-footer {
      padding: 16px;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }
    
    .n8n-assistant-btn {
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 600;
    }
    
    .n8n-assistant-btn-primary {
      background-color: #FF6D5A;
      color: white;
      border: none;
    }
    
    .n8n-assistant-btn-secondary {
      background-color: transparent;
      color: #FF6D5A;
      border: 1px solid #FF6D5A;
    }
    
    .n8n-assistant-floating-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background-color: #FF6D5A;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      z-index: 9998;
    }
  `;
  
  document.head.appendChild(styleElement);
}

// Configurar observadores para detectar mudanças na interface
function setupObservers() {
  // Observar mudanças na URL para detectar navegação entre workflows
  let lastUrl = location.href;
  new MutationObserver(() => {
    const url = location.href;
    if (url !== lastUrl) {
      lastUrl = url;
      onUrlChange();
    }
  }).observe(document, { subtree: true, childList: true });
  
  // Adicionar botão flutuante
  addFloatingButton();
}

// Manipular mudanças de URL
function onUrlChange() {
  // Verificar se estamos na página de edição de workflow
  if (location.href.includes('/workflow/')) {
    setTimeout(() => {
      detectCurrentWorkflow();
    }, 1000);
  }
}

// Detectar o workflow atual
function detectCurrentWorkflow() {
  // Esta função seria implementada para extrair os dados do workflow atual
  // da interface do N8N. Como isso depende da estrutura específica do DOM
  // e possivelmente de APIs internas do N8N, aqui apresentamos apenas um esboço.
  
  console.log('N8N Workflow Assistant: Detectando workflow atual...');
  
  // Exemplo simplificado - na implementação real, seria necessário
  // analisar o DOM ou interceptar chamadas de API para obter os dados completos
  state.currentWorkflow = {
    name: document.querySelector('.workflow-name')?.textContent || 'Workflow Sem Nome',
    nodes: Array.from(document.querySelectorAll('.node-item')).map(node => ({
      name: node.querySelector('.node-name')?.textContent,
      type: node.getAttribute('data-node-type')
    }))
  };
  
  console.log('N8N Workflow Assistant: Workflow detectado', state.currentWorkflow);
}

// Adicionar botão flutuante
function addFloatingButton() {
  const button = document.createElement('div');
  button.className = 'n8n-assistant-floating-btn';
  button.innerHTML = '🤖';
  button.title = 'N8N Workflow Assistant';
  
  button.addEventListener('click', () => {
    openAssistantMenu();
  });
  
  document.body.appendChild(button);
}

// Abrir menu do assistente
function openAssistantMenu() {
  if (state.modalOpen) return;
  
  const modal = document.createElement('div');
  modal.className = 'n8n-assistant-modal';
  
  modal.innerHTML = `
    <div class="n8n-assistant-modal-content">
      <div class="n8n-assistant-modal-header">
        <h2>N8N Workflow Assistant</h2>
        <button class="n8n-assistant-close-btn">✕</button>
      </div>
      <div class="n8n-assistant-modal-body">
        <h3>O que você gostaria de fazer?</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px;">
          <button class="n8n-assistant-menu-item" data-action="generate">
            <div style="font-size: 24px; margin-bottom: 8px;">➕</div>
            <div>Gerar novo workflow</div>
          </button>
          <button class="n8n-assistant-menu-item" data-action="analyze">
            <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
            <div>Analisar workflow atual</div>
          </button>
          <button class="n8n-assistant-menu-item" data-action="improve">
            <div style="font-size: 24px; margin-bottom: 8px;">⚡</div>
            <div>Sugerir melhorias</div>
          </button>
          <button class="n8n-assistant-menu-item" data-action="explain">
            <div style="font-size: 24px; margin-bottom: 8px;">📝</div>
            <div>Explicar workflow</div>
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Adicionar event listeners
  modal.querySelector('.n8n-assistant-close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  // Fechar ao clicar fora do conteúdo
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
  
  // Adicionar event listeners para os itens do menu
  modal.querySelectorAll('.n8n-assistant-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      const action = item.getAttribute('data-action');
      handleMenuAction(action, modal);
    });
  });
  
  document.body.appendChild(modal);
  state.modalOpen = true;
}

// Manipular ações do menu
function handleMenuAction(action, modal) {
  closeModal(modal);
  
  switch (action) {
    case 'generate':
      openGenerateWorkflowModal();
      break;
    case 'analyze':
      openAnalyzeWorkflowModal();
      break;
    case 'improve':
      openSuggestImprovementsModal();
      break;
    case 'explain':
      openExplainWorkflowModal();
      break;
  }
}

// Fechar modal
function closeModal(modal) {
  modal.remove();
  state.modalOpen = false;
}

// Abrir modal para gerar workflow
function openGenerateWorkflowModal() {
  const modal = createModal('Gerar Novo Workflow');
  
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <form id="generate-workflow-form">
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Nome do Workflow:</label>
        <input type="text" id="workflow-name" placeholder="Meu Novo Workflow" style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;">
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Descrição (o que o workflow deve fazer):</label>
        <textarea id="workflow-description" rows="5" placeholder="Descreva em detalhes o que você deseja que o workflow faça..." style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; resize: vertical;"></textarea>
      </div>
      
      <div style="margin-bottom: 16px;">
        <label style="display: block; margin-bottom: 8px; font-weight: 500;">Tipo de Trigger:</label>
        <div style="display: flex; gap: 16px;">
          <label style="display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="trigger-type" value="webhook" checked>
            Webhook
          </label>
          <label style="display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="trigger-type" value="schedule">
            Agendamento
          </label>
          <label style="display: flex; align-items: center; gap: 4px;">
            <input type="radio" name="trigger-type" value="manual">
            Manual
          </label>
        </div>
      </div>
    </form>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="cancel-btn">Cancelar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="generate-btn">Gerar Workflow</button>
  `;
  
  // Adicionar event listeners
  modal.querySelector('#cancel-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#generate-btn').addEventListener('click', async () => {
    const name = modal.querySelector('#workflow-name').value;
    const description = modal.querySelector('#workflow-description').value;
    const triggerType = modal.querySelector('input[name="trigger-type"]:checked').value;
    
    if (!name || !description) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Atualizar conteúdo do modal para mostrar loading
    modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
      <div style="text-align: center; padding: 32px;">
        <div style="margin-bottom: 16px;">Gerando workflow...</div>
        <div class="loading-spinner"></div>
      </div>
    `;
    
    modal.querySelector('.n8n-assistant-modal-footer').innerHTML = '';
    
    try {
      // Enviar mensagem para o background script
      const response = await chrome.runtime.sendMessage({
        action: 'generateWorkflow',
        description,
        requirements: {
          name,
          triggerType
        }
      });
      
      if (response.success) {
        // Mostrar resultado
        showWorkflowResult(modal, response.workflow);
      } else {
        showError(modal, response.error || 'Erro ao gerar workflow');
      }
    } catch (error) {
      showError(modal, error.message || 'Erro ao comunicar com a extensão');
    }
  });
  
  document.body.appendChild(modal);
  state.modalOpen = true;
}

// Abrir modal para analisar workflow
function openAnalyzeWorkflowModal() {
  if (!state.currentWorkflow) {
    alert('Nenhum workflow detectado. Por favor, abra um workflow no N8N primeiro.');
    return;
  }
  
  const modal = createModal('Analisar Workflow');
  
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="margin-bottom: 16px;">
      <p>Workflow atual: <strong>${state.currentWorkflow.name}</strong></p>
      <p>Número de nós: <strong>${state.currentWorkflow.nodes.length}</strong></p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Tipo de análise:</label>
      <select id="analysis-type" style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px;">
        <option value="complete">Análise completa</option>
        <option value="performance">Performance</option>
        <option value="security">Segurança</option>
        <option value="best-practices">Melhores práticas</option>
      </select>
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="cancel-btn">Cancelar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="analyze-btn">Analisar Workflow</button>
  `;
  
  // Adicionar event listeners
  modal.querySelector('#cancel-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#analyze-btn').addEventListener('click', async () => {
    const analysisType = modal.querySelector('#analysis-type').value;
    
    // Atualizar conteúdo do modal para mostrar loading
    modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
      <div style="text-align: center; padding: 32px;">
        <div style="margin-bottom: 16px;">Analisando workflow...</div>
        <div class="loading-spinner"></div>
      </div>
    `;
    
    modal.querySelector('.n8n-assistant-modal-footer').innerHTML = '';
    
    try {
      // Enviar mensagem para o background script
      const response = await chrome.runtime.sendMessage({
        action: 'analyzeWorkflow',
        workflow: state.currentWorkflow,
        analysisType
      });
      
      if (response.success) {
        // Mostrar resultado da análise
        showAnalysisResult(modal, response.analysis);
      } else {
        showError(modal, response.error || 'Erro ao analisar workflow');
      }
    } catch (error) {
      showError(modal, error.message || 'Erro ao comunicar com a extensão');
    }
  });
  
  document.body.appendChild(modal);
  state.modalOpen = true;
}

// Abrir modal para sugerir melhorias
function openSuggestImprovementsModal() {
  if (!state.currentWorkflow) {
    alert('Nenhum workflow detectado. Por favor, abra um workflow no N8N primeiro.');
    return;
  }
  
  const modal = createModal('Sugerir Melhorias');
  
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="margin-bottom: 16px;">
      <p>Workflow atual: <strong>${state.currentWorkflow.name}</strong></p>
      <p>Número de nós: <strong>${state.currentWorkflow.nodes.length}</strong></p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">Contexto adicional (opcional):</label>
      <textarea id="improvement-context" rows="4" placeholder="Descreva quaisquer requisitos específicos ou problemas que você está enfrentando..." style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 4px; resize: vertical;"></textarea>
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="cancel-btn">Cancelar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="suggest-btn">Sugerir Melhorias</button>
  `;
  
  // Adicionar event listeners
  modal.querySelector('#cancel-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#suggest-btn').addEventListener('click', async () => {
    const context = modal.querySelector('#improvement-context').value;
    
    // Atualizar conteúdo do modal para mostrar loading
    modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
      <div style="text-align: center; padding: 32px;">
        <div style="margin-bottom: 16px;">Gerando sugestões...</div>
        <div class="loading-spinner"></div>
      </div>
    `;
    
    modal.querySelector('.n8n-assistant-modal-footer').innerHTML = '';
    
    try {
      // Enviar mensagem para o background script
      const response = await chrome.runtime.sendMessage({
        action: 'suggestImprovements',
        workflow: state.currentWorkflow,
        context
      });
      
      if (response.success) {
        // Mostrar sugestões
        showSuggestions(modal, response.suggestions);
      } else {
        showError(modal, response.error || 'Erro ao gerar sugestões');
      }
    } catch (error) {
      showError(modal, error.message || 'Erro ao comunicar com a extensão');
    }
  });
  
  document.body.appendChild(modal);
  state.modalOpen = true;
}

// Abrir modal para explicar workflow
function openExplainWorkflowModal() {
  if (!state.currentWorkflow) {
    alert('Nenhum workflow detectado. Por favor, abra um workflow no N8N primeiro.');
    return;
  }
  
  const modal = createModal('Explicar Workflow');
  
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="text-align: center; padding: 32px;">
      <div style="margin-bottom: 16px;">Gerando explicação...</div>
      <div class="loading-spinner"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  state.modalOpen = true;
  
  // Simular chamada à API (na implementação real, seria uma chamada ao background script)
  setTimeout(() => {
    const explanation = `
      <h3>Explicação do Workflow: ${state.currentWorkflow.name}</h3>
      
      <p>Este workflow foi projetado para [finalidade do workflow]. Ele consiste em ${state.currentWorkflow.nodes.length} nós que trabalham juntos para automatizar o processo.</p>
      
      <h4>Fluxo de Execução:</h4>
      <ol>
        <li>O workflow é iniciado por um trigger [tipo de trigger].</li>
        <li>Os dados são processados através de uma série de nós, incluindo [tipos de nós].</li>
        <li>O resultado final é [ação final do workflow].</li>
      </ol>
      
      <h4>Detalhes dos Nós:</h4>
      <ul>
        ${state.currentWorkflow.nodes.map(node => `
          <li><strong>${node.name || 'Nó sem nome'}</strong> (${node.type || 'Tipo desconhecido'}): [descrição da função do nó]</li>
        `).join('')}
      </ul>
      
      <p>Este workflow é adequado para [casos de uso]. Para melhorar sua eficiência, considere [sugestões de melhoria].</p>
    `;
    
    modal.querySelector('.n8n-assistant-modal-body').innerHTML = explanation;
    
    modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
      <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="close-btn">Fechar</button>
      <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="copy-btn">Copiar Explicação</button>
    `;
    
    modal.querySelector('#close-btn').addEventListener('click', () => {
      closeModal(modal);
    });
    
    modal.querySelector('#copy-btn').addEventListener('click', () => {
      const textToCopy = modal.querySelector('.n8n-assistant-modal-body').textContent.trim();
      navigator.clipboard.writeText(textToCopy);
      alert('Explicação copiada para a área de transferência');
    });
  }, 2000);
}

// Criar modal base
function createModal(title) {
  const modal = document.createElement('div');
  modal.className = 'n8n-assistant-modal';
  
  modal.innerHTML = `
    <div class="n8n-assistant-modal-content">
      <div class="n8n-assistant-modal-header">
        <h2>${title}</h2>
        <button class="n8n-assistant-close-btn">✕</button>
      </div>
      <div class="n8n-assistant-modal-body">
        <!-- Conteúdo será preenchido dinamicamente -->
      </div>
      <div class="n8n-assistant-modal-footer">
        <!-- Botões serão preenchidos dinamicamente -->
      </div>
    </div>
  `;
  
  // Adicionar event listener para fechar
  modal.querySelector('.n8n-assistant-close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  // Fechar ao clicar fora do conteúdo
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal(modal);
    }
  });
  
  return modal;
}

// Mostrar resultado do workflow gerado
function showWorkflowResult(modal, workflow) {
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3>Workflow Gerado com Sucesso!</h3>
      <p>Seu workflow "${workflow.name}" foi gerado e está pronto para ser importado no N8N.</p>
    </div>
    
    <div style="margin-bottom: 16px;">
      <label style="display: block; margin-bottom: 8px; font-weight: 500;">JSON do Workflow:</label>
      <pre style="background-color: #f5f5f7; padding: 16px; border-radius: 4px; overflow: auto; max-height: 200px;">${JSON.stringify(workflow, null, 2)}</pre>
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="close-btn">Fechar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="copy-btn">Copiar JSON</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="import-btn">Importar para N8N</button>
  `;
  
  modal.querySelector('#close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#copy-btn').addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(workflow, null, 2));
    alert('JSON copiado para a área de transferência');
  });
  
  modal.querySelector('#import-btn').addEventListener('click', () => {
    // Na implementação real, isso usaria a API do N8N para importar o workflow
    alert('Funcionalidade de importação em desenvolvimento');
    closeModal(modal);
  });
}

// Mostrar resultado da análise
function showAnalysisResult(modal, analysis) {
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3>Análise do Workflow</h3>
    </div>
    
    <div style="margin-bottom: 16px;">
      ${analysis.html || `<p>${analysis.text || 'Nenhuma análise disponível'}</p>`}
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="close-btn">Fechar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="copy-btn">Copiar Análise</button>
  `;
  
  modal.querySelector('#close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#copy-btn').addEventListener('click', () => {
    const textToCopy = analysis.text || modal.querySelector('.n8n-assistant-modal-body').textContent.trim();
    navigator.clipboard.writeText(textToCopy);
    alert('Análise copiada para a área de transferência');
  });
}

// Mostrar sugestões de melhoria
function showSuggestions(modal, suggestions) {
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="margin-bottom: 16px;">
      <h3>Sugestões de Melhoria</h3>
    </div>
    
    <div style="margin-bottom: 16px;">
      ${suggestions.html || `<p>${suggestions.text || 'Nenhuma sugestão disponível'}</p>`}
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-secondary" id="close-btn">Fechar</button>
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="copy-btn">Copiar Sugestões</button>
  `;
  
  modal.querySelector('#close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
  
  modal.querySelector('#copy-btn').addEventListener('click', () => {
    const textToCopy = suggestions.text || modal.querySelector('.n8n-assistant-modal-body').textContent.trim();
    navigator.clipboard.writeText(textToCopy);
    alert('Sugestões copiadas para a área de transferência');
  });
}

// Mostrar erro
function showError(modal, errorMessage) {
  modal.querySelector('.n8n-assistant-modal-body').innerHTML = `
    <div style="text-align: center; padding: 32px;">
      <div style="color: #FF4949; font-size: 48px; margin-bottom: 16px;">❌</div>
      <h3 style="margin-bottom: 16px;">Ocorreu um erro</h3>
      <p>${errorMessage}</p>
    </div>
  `;
  
  modal.querySelector('.n8n-assistant-modal-footer').innerHTML = `
    <button class="n8n-assistant-btn n8n-assistant-btn-primary" id="close-btn">Fechar</button>
  `;
  
  modal.querySelector('#close-btn').addEventListener('click', () => {
    closeModal(modal);
  });
}

// Listener para mensagens do background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkN8nPage') {
    sendResponse({ isN8nPage: state.isN8nInterface });
  } 
  else if (message.action === 'openGenerateWorkflowModal') {
    openGenerateWorkflowModal();
    sendResponse({ success: true });
  } 
  else if (message.action === 'openAnalyzeWorkflowModal') {
    openAnalyzeWorkflowModal();
    sendResponse({ success: true });
  } 
  else if (message.action === 'openSuggestImprovementsModal') {
    openSuggestImprovementsModal();
    sendResponse({ success: true });
  }
  
  return true;
});

// Inicializar
checkN8nInterface();
