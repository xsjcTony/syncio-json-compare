import { defineConfig } from '@aelita-dev/eslint-config'


export default defineConfig({
  stylistic: {
    semi: false,
    commaDangle: 'always-multiline',
    indent: 2,
    quotes: 'single',
  },
  'import': {
    tsResolverOptions: {
      project: ['tsconfig.app.json', 'tsconfig.node.json'],
    },
    ruleOptions: {
      order: {
        typeImportsFirst: true,
      },
    },
  },
})
