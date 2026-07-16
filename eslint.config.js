import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        localStorage: 'readonly',
        Blob: 'readonly',
        URL: 'readonly',
        FileReader: 'readonly',
        setInterval: 'readonly',
      },
    },
  },
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        console: 'readonly',
      },
    },
  },
];
