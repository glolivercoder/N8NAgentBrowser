module.exports = {
  "env": {
    "browser": true,
    "es2021": true,
    "webextensions": true,
    "node": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module"
  },
  "rules": {
    // Erros e problemas potenciais
    "no-var": "error",
    "prefer-const": "warn",
    "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }],
    "no-console": "off", // Permitimos console em extensões
    "no-debugger": "error",
    
    // Estilo e formatação
    "semi": ["error", "always"],
    "quotes": ["warn", "single", { "allowTemplateLiterals": true }],
    "indent": ["warn", 2, { "SwitchCase": 1 }],
    "comma-dangle": ["warn", "never"],
    "arrow-parens": ["warn", "as-needed"],
    "max-len": ["warn", { "code": 100, "ignoreComments": true, "ignoreStrings": true }],
    
    // Boas práticas
    "eqeqeq": ["error", "always", { "null": "ignore" }],
    "curly": ["warn", "multi-line"],
    "brace-style": ["warn", "1tbs"],
    "prefer-arrow-callback": "warn",
    "arrow-body-style": ["warn", "as-needed"],
    
    // Específico para extensões
    "no-alert": "warn" // Alertas podem ser úteis em extensões, mas com moderação
  },
  "ignorePatterns": [
    "dist/**/*",
    "node_modules/**/*"
  ]
};
