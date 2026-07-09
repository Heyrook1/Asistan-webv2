# Contributing to Asistan-webv2

Thank you for contributing to Asistan Health! This guide will help you understand our development process.

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on code quality and user impact

## Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/Asistan-webv2.git
   cd Asistan-webv2
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feat/your-feature-name
   # or for bugfixes:
   # git checkout -b fix/your-bug-name
   ```

3. **Set up development environment**
   ```bash
   pnpm install
   cp .env.example .env.local
   # Add your Supabase credentials to .env.local
   pnpm db:generate
   pnpm dev
   ```

## Workflow

### 1. Make Changes

**Follow these conventions:**

- **Commit messages:** Use conventional commits
  ```
  feat: add rate limiting to API endpoints
  fix: resolve image sizing warning
  docs: update deployment guide
  test: add tests for RBAC module
  refactor: improve database query performance
  ```

- **Branch naming:**
  ```
  feat/feature-name
  fix/bug-description
  docs/doc-title
  refactor/module-name
  ```

- **Code style:** Run ESLint before committing
  ```bash
  pnpm lint
  ```

### 2. Test Your Changes

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm e2e

# Check types
pnpm lint

# Build for production
pnpm build
```

**Coverage requirements:**
- New features should have unit tests (target 80%+ coverage)
- API routes should have E2E tests
- Bug fixes should include regression tests

### 3. Database Changes

If you modify `prisma/schema.prisma`:

```bash
# Create migration
pnpm prisma migrate dev --name your_migration_name

# Or for development:
pnpm db:push

# Always test migrations locally first
```

**Never** commit raw SQL migrations to `supabase/migrations/` without testing.

### 4. Create Pull Request

```bash
# Push your branch
git push origin feat/your-feature-name
```

Then on GitHub:
1. Fill out the PR template completely
2. Link related issues: `Closes #123`
3. Describe what changed and why
4. Screenshots for UI changes

### 5. Code Review

- Wait for at least 1 approval
- Address all comments before merging
- Keep commits clean and organized
- Rebase before merging (no merge commits)

## PR Template

```markdown
## Description
What does this PR do?

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue)

## Testing
How was this tested?
- [ ] Unit tests added
- [ ] E2E tests added
- [ ] Manual testing on localhost

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass locally
- [ ] No new warnings
- [ ] Documentation updated
```

## Guidelines

### TypeScript

- Always use strict types (no `any`)
- Export interfaces for props
- Use `@param` and `@returns` in JSDoc

```typescript
/**
 * Create a new appointment
 * @param businessId - The business UUID
 * @param date - Appointment date in YYYY-MM-DD format
 * @returns Created appointment or error
 */
export async function createAppointment(businessId: string, date: string): Promise<Appointment> {
  // ...
}
```

### React Components

- Use functional components with hooks
- Memoize expensive computations: `useMemo`
- Split large components into smaller ones
- Max 300 lines per file
- Use `'use client'` at component level, not file level

```typescript
'use client'

interface PatientListProps {
  businessId: string
  onSelect: (id: string) => void
}

export function PatientList({ businessId, onSelect }: PatientListProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  
  return (
    <div>
      {patients.map(p => (
        <button key={p.id} onClick={() => onSelect(p.id)}>
          {p.fullName}
        </button>
      ))}
    </div>
  )
}
```

### API Routes

- Always validate input with Zod
- Return standardized response format (use `apiSuccess`, `apiError`)
- Add rate limiting to public endpoints
- Log errors to Sentry
- Add API documentation

```typescript
import { apiSuccess, apiError } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  // Rate limiting
  const ip = request.ip || 'unknown'
  if (!await checkRateLimit(`endpoint:${ip}`)) {
    return apiError('Too many requests', 429)
  }
  
  // Validation
  const parsed = mySchema.safeParse(await request.json())
  if (!parsed.success) {
    return apiError('Invalid input', 400)
  }
  
  // Business logic
  try {
    const result = await createThing(parsed.data)
    return apiSuccess(result, 201)
  } catch (error) {
    return apiError('Server error', 500)
  }
}
```

### Accessibility

Every new feature must meet WCAG 2.1 Level AA:

- [ ] Keyboard navigable (Tab through all interactive elements)
- [ ] Color contrast >= 4.5:1 for text
- [ ] Images have `alt` text
- [ ] Buttons have `aria-label` if text-only icons
- [ ] Modals trap focus and have close button
- [ ] Form fields have associated labels
- [ ] Error messages linked to fields with `aria-describedby`

Test with: `npx axe-core` or screen reader (NVDA, JAWS)

### Security

- Never commit secrets or API keys
- Validate all user input (Zod)
- Use parameterized queries (Prisma)
- Sanitize HTML output
- Add CSRF tokens to forms
- Use HTTPS everywhere
- Test with `npm audit`

### Performance

- Keep bundles < 200KB per page
- Lazy load heavy components: `dynamic(() => import(...))`
- Optimize images: WebP, correct dimensions
- Memoize expensive calculations: `useMemo`, `useCallback`
- Profile with DevTools Lighthouse

### Database

- Index queries used in WHERE and ORDER BY
- Avoid N+1 queries: use `select()` to fetch specific fields
- Use database transactions for multi-step operations
- Always write migrations (never raw SQL in production)
- Test migrations on staging first

## Documentation

Update docs when you:
- Add new features
- Change API contracts
- Fix bugs with workarounds
- Add configuration options

Files to update:
- `README.md` (architecture, setup)
- `SETUP.md` (development guide)
- `DEPLOYMENT.md` (production guide)
- Inline code comments for complex logic

## Release Process

1. **Semantic Versioning:** MAJOR.MINOR.PATCH
   - MAJOR: Breaking changes
   - MINOR: New features
   - PATCH: Bug fixes

2. **Changelog:** Update `CHANGELOG.md`
   ```markdown
   ## [1.2.0] - 2026-06-15
   ### Added
   - Rate limiting on API endpoints
   
   ### Fixed
   - Image sizing warning on homepage
   ```

3. **Tag release:**
   ```bash
   git tag v1.2.0
   git push origin v1.2.0
   ```

## Asking for Help

- **Questions:** Open a Discussion on GitHub
- **Bugs:** Open an Issue with reproduction steps
- **Ideas:** Start a Discussion before opening PR
- **Security:** Email security@asistan.health (don't open public issue)

## Useful Commands

```bash
# Run everything before pushing
pnpm lint && pnpm test && pnpm build

# Format code
pnpm lint --fix

# Check for vulnerabilities
npm audit

# Generate Prisma client
pnpm db:generate

# Create database backup
pg_dump $DATABASE_URL > backup.sql

# Profile bundle size
ANALYZE=true pnpm build
```

## Architecture Overview

```
Asistan-webv2 (Next.js 16)
├── app/api/*         - Serverless API routes
├── app/dashboard/*   - Protected pages (RBAC)
├── app/client/*      - Public booking pages
├── components/       - React components
├── lib/
│   ├── supabase/    - Database client
│   ├── actions/     - Server actions
│   ├── rbac.ts      - Authorization
│   └── utils/       - Helpers
├── prisma/          - ORM schema
└── tests/           - Test suites
```

**Key patterns:**
- Server Components by default (faster, more secure)
- Client Components only for interactivity
- Zod for validation at API boundaries
- Prisma for type-safe database access
- React Query for async state (optional)

## Support

- **Docs:** [README.md](README.md)
- **Setup:** [SETUP.md](SETUP.md)
- **Deploy:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Audit:** [AUDIT_REPORT.md](AUDIT_REPORT.md)

---

Thank you for making Asistan better! 🚀
