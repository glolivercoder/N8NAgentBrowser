// build.js - Script para empacotar a extensão N8N Browser Agents
const fs = require('fs');
const path = require('path');
// const archiver = require('archiver'); // Movido para dentro da função buildExtension
const { execSync } = require('child_process');

// Configurações
const config = {
  sourceDir: __dirname,
  outputDir: path.join(__dirname, 'dist'),
  outputFile: 'n8n-browser-agents.zip',
  ignorePatterns: [
    '.git',
    'node_modules',
    'dist',
    '.vscode',
    '.DS_Store',
    '*.zip',
    '*.log',
    '*.md',
    'build.js'
  ],
  manifestPath: path.join(__dirname, 'manifest.json'),
  version: '1.0.0'
};

// Verificar e instalar dependências
function installDependencies() {
  console.log("Verificando se 'archiver' está acessível...");
  let archiverAvailable = false;
  try {
    require.resolve("archiver");
    archiverAvailable = true;
    console.log("Dependência 'archiver' já está instalada e acessível.");
  } catch (e) {
    console.log("'archiver' não está acessível. Tentando instalar dependências...");
  }

  if (!archiverAvailable) {
    try {
      execSync("npm install", { stdio: "inherit", cwd: config.sourceDir });
      console.log("Dependências instaladas com sucesso!");
      // Tentar resolver novamente para confirmar, mas não falhar o script aqui.
      // O require principal em buildExtension fará a tentativa final.
      try {
        require.resolve("archiver");
        console.log("'archiver' agora está acessível após a instalação.");
      } catch (postInstallError) {
        console.warn("Aviso: 'archiver' pode não estar imediatamente acessível após 'npm install'. O script principal tentará carregá-lo.");
      }
    } catch (error) {
      console.error("Erro crítico durante a execução de 'npm install':", error);
      process.exit(1); // Sair se o npm install em si falhar catastroficamente
    }
  }
}

// Função principal
async function buildExtension() {
  try {
    console.log('Iniciando build da extensão N8N Browser Agents...');
    
    // Instalar dependências se necessário
    installDependencies();
    const archiver = require('archiver'); // Movido do escopo global
    
    // Criar diretório de saída se não existir
    if (!fs.existsSync(config.outputDir)) {
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Atualizar versão no manifest.json se necessário
    updateManifestVersion();
    
    // Criar arquivo zip
    const outputPath = path.join(config.outputDir, config.outputFile);
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Eventos do archiver
    output.on('close', () => {
      const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
      console.log(`\nBuild concluído com sucesso!`);
      console.log(`Arquivo: ${outputPath}`);
      console.log(`Tamanho: ${sizeInMB} MB`);
      console.log('\nPara carregar a extensão no Chrome:');
      console.log('1. Acesse chrome://extensions/');
      console.log('2. Ative o "Modo do desenvolvedor"');
      console.log('3. Clique em "Carregar sem compactação"');
      console.log(`4. Selecione a pasta: ${config.sourceDir}`);
      console.log('\nPara testes, acesse:');
      console.log(`${config.sourceDir}\\tests\\run-tests.html`);
    });
    
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Aviso:', err);
      } else {
        throw err;
      }
    });
    
    archive.on('error', (err) => {
      throw err;
    });
    
    // Pipe archive para o output stream
    archive.pipe(output);
    
    // Adicionar arquivos ao zip
    await addFilesToArchive(archive, config.sourceDir, '');
    
    // Finalizar o arquivo
    await archive.finalize();
    
  } catch (error) {
    console.error('Erro durante o build:', error);
    process.exit(1);
  }
}

// Função para atualizar a versão no manifest.json
function updateManifestVersion() {
  try {
    if (fs.existsSync(config.manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(config.manifestPath, 'utf8'));
      
      // Usar a versão da configuração ou incrementar a versão atual
      if (config.version) {
        manifest.version = config.version;
      } else {
        // Incrementar a versão patch (1.0.0 -> 1.0.1)
        const versionParts = manifest.version.split('.');
        versionParts[2] = (parseInt(versionParts[2], 10) + 1).toString();
        manifest.version = versionParts.join('.');
      }
      
      fs.writeFileSync(config.manifestPath, JSON.stringify(manifest, null, 2));
      console.log(`Versão atualizada para: ${manifest.version}`);
    }
  } catch (error) {
    console.warn('Aviso: Não foi possível atualizar a versão no manifest.json', error);
  }
}

// Função para adicionar arquivos ao arquivo zip
async function addFilesToArchive(archive, sourceDir, currentDir) {
  const items = fs.readdirSync(path.join(sourceDir, currentDir));
  
  for (const item of items) {
    const itemPath = path.join(currentDir, item);
    const fullPath = path.join(sourceDir, itemPath);
    
    // Verificar se deve ignorar o item
    if (shouldIgnoreItem(itemPath)) {
      continue;
    }
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Adicionar diretório e seu conteúdo
      await addFilesToArchive(archive, sourceDir, itemPath);
    } else {
      // Adicionar arquivo
      archive.file(fullPath, { name: itemPath });
      process.stdout.write('.');
    }
  }
}

// Função para verificar se um item deve ser ignorado
function shouldIgnoreItem(itemPath) {
  return config.ignorePatterns.some(pattern => {
    if (pattern.startsWith('*')) {
      // Padrão de extensão (*.zip)
      const extension = pattern.substring(1);
      return itemPath.endsWith(extension);
    } else {
      // Padrão de diretório/arquivo (.git, node_modules)
      return itemPath.includes(pattern);
    }
  });
}

// Executar o build
buildExtension();
