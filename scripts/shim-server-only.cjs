/** CLI shim — Next.js `server-only` package is a boundary, not needed in tsx smokes. */
const Module = require('module')

const originalLoad = Module._load
Module._load = function patchedLoad(request, parent, isMain) {
  if (request === 'server-only') return {}
  return originalLoad.apply(this, arguments)
}
