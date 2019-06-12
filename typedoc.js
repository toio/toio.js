module.exports = {
  mode: 'modules',
  out: 'docs',
  exclude: ['**/node_modules/**', '**/*.test.ts'],
  name: 'toio.js',
  ignoreCompilerErrors: true,
  disableOutputCheck: true,
  excludeExternals: true,
  excludePrivate: true,
  excludeNotExported: true,
  skipInternal: true,
}
