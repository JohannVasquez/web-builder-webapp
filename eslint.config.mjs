import next from 'eslint-config-next';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'coverage/**',
      'next-env.d.ts',
      '*.mjs',
      '*.js',
      'next.config.ts',
    ],
  },
  ...next,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
    },
  },
  {
    files: [
      'src/modules/**/*.ts',
      'src/modules/**/*.tsx',
      'src/shared/**/*.ts',
      'src/shared/**/*.tsx',
    ],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
        node: { extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'] },
      },
      'boundaries/elements': [
        { type: 'domain', pattern: 'src/modules/*/domain/**' },
        { type: 'application', pattern: 'src/modules/*/application/**' },
        { type: 'infrastructure', pattern: 'src/modules/*/infrastructure/**' },
        { type: 'presentation', pattern: 'src/modules/*/presentation/**' },
        { type: 'shared', pattern: 'src/shared/**' },
      ],
    },
    rules: {
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { element: { type: 'domain' } },
              allow: [{ to: { element: { type: ['domain', 'shared'] } } }],
            },
            {
              from: { element: { type: 'application' } },
              allow: [{ to: { element: { type: ['domain', 'application', 'shared'] } } }],
            },
            {
              from: { element: { type: 'infrastructure' } },
              allow: [
                {
                  to: {
                    element: {
                      type: ['domain', 'application', 'infrastructure', 'shared'],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'presentation' } },
              allow: [
                {
                  to: {
                    element: {
                      type: ['domain', 'application', 'presentation', 'shared'],
                    },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'shared' } },
              allow: [{ to: { element: { type: 'shared' } } }],
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/**/*.spec.ts', 'src/**/*.spec.tsx'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  prettier,
);
