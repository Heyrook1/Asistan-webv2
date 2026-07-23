/**
 * Apply the full PascalCase RLS migration stack (idempotent).
 * Usage: pnpm db:rls:apply
 */
import { runRlsStackApply } from './lib/rls-stack.mjs'

runRlsStackApply({ label: 'RLS stack' }).catch(async (error) => {
  console.error('Migration failed:', error.message)
  process.exit(1)
})
