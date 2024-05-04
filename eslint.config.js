import globals from 'globals'
import pluginJs from '@eslint/js'

export default [
  {
    languageOptions: { globals: globals.browser },
    files: ['**/*.js'],
    ignores: ['dist/'] // FIXME This do not prevent the linter from checking the dist folder!
  },
  pluginJs.configs.recommended
]
