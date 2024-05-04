import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {
    languageOptions: { globals: globals.browser },
    files: ['**/*.js'],
    ignores: ['node_modules/', 'dist/']
  },
  pluginJs.configs.recommended
]
