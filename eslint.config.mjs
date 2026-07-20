import coreWebVitals from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';

const eslintConfig = [
  ...coreWebVitals,
  ...typescript,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
      'src/generated/**',
    ],
  },
  {
    // Dívida técnica pré-existente ao adotar o ESLint neste repo.
    // Rebaixado para `warn` para o CI não travar com o passivo atual — sem
    // esconder os problemas. Meta: pagar a dívida e voltar cada uma para `error`.
    // Contagem inicial (2026-07): no-explicit-any 79, set-state-in-effect 5,
    // no-html-link-for-pages 4, no-empty-object-type 2, immutability 1.
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/immutability': 'warn',
      '@next/next/no-html-link-for-pages': 'warn',
    },
  },
];

export default eslintConfig;
