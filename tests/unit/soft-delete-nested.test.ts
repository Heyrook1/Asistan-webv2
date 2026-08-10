import { describe, expect, it } from 'vitest'

import {
  applySoftDeleteToCountSelect,
  applySoftDeleteToNestedTree,
  applySoftDeleteToQueryArgs,
  applySoftDeleteToWhereRelationFilters,
  withNotDeleted,
} from '@/lib/security/soft-delete-nested'

describe('soft-delete nested filters (appointment archive consistency)', () => {
  it('preserves explicit deletedAt overrides', () => {
    expect(withNotDeleted({ deletedAt: { not: null } })).toEqual({ deletedAt: { not: null } })
    expect(withNotDeleted(undefined)).toEqual({ deletedAt: null })
  })

  it('injects deletedAt into nested appointments include', () => {
    expect(
      applySoftDeleteToNestedTree({
        appointments: {
          orderBy: [{ date: 'desc' }],
          include: { service: { select: { name: true } } },
        },
        assignedDoctor: { select: { id: true, fullName: true } },
      }),
    ).toEqual({
      appointments: {
        orderBy: [{ date: 'desc' }],
        include: { service: { select: { name: true } } },
        where: { deletedAt: null },
      },
      assignedDoctor: { select: { id: true, fullName: true } },
    })
  })

  it('rewrites _count.appointments: true for patient list counters', () => {
    expect(
      applySoftDeleteToCountSelect({
        appointments: true,
        members: true,
        patients: true,
      }),
    ).toEqual({
      appointments: { where: { deletedAt: null } },
      members: { where: { deletedAt: null } },
      patients: { where: { deletedAt: null } },
    })
  })

  it('adds deletedAt to relation some/none filters (fill-the-gap style)', () => {
    expect(
      applySoftDeleteToWhereRelationFilters({
        businessId: 'b1',
        appointments: {
          some: { status: 'COMPLETED' },
          none: { status: { in: ['SCHEDULED', 'CONFIRMED'] } },
        },
      }),
    ).toEqual({
      businessId: 'b1',
      appointments: {
        some: { status: 'COMPLETED', deletedAt: null },
        none: { status: { in: ['SCHEDULED', 'CONFIRMED'] }, deletedAt: null },
      },
    })
  })

  it('applies nested filters on full query args without dropping include', () => {
    const args = applySoftDeleteToQueryArgs({
      where: { id: 'p1', businessId: 'b1' },
      include: {
        appointments: { orderBy: [{ date: 'desc' }] },
        _count: { select: { appointments: true } },
      },
    })

    expect(args).toEqual({
      where: { id: 'p1', businessId: 'b1', deletedAt: null },
      include: {
        appointments: { orderBy: [{ date: 'desc' }], where: { deletedAt: null } },
        _count: { select: { appointments: { where: { deletedAt: null } } } },
      },
    })
  })
})
