import { describe, expect, it } from 'vitest'
import {
  buildJobsProfileSearch,
  resolveJobsProfile,
  sanitizeProfileName,
} from './jobs-profile-resolution'

describe('sanitizeProfileName', () => {
  it('accepts simple profile names', () => {
    expect(sanitizeProfileName('aurora')).toBe('aurora')
    expect(sanitizeProfileName(' swarm6 ')).toBe('swarm6')
  })

  it('rejects empty and path-like values', () => {
    expect(sanitizeProfileName('')).toBeNull()
    expect(sanitizeProfileName('   ')).toBeNull()
    expect(sanitizeProfileName('../etc')).toBeNull()
    expect(sanitizeProfileName('a/b')).toBeNull()
    expect(sanitizeProfileName('a\\b')).toBeNull()
  })
})

describe('resolveJobsProfile', () => {
  it('prefers explicit ?profile= query param', () => {
    const url = new URL('http://localhost/api/hermes-jobs?profile=query-one')
    expect(resolveJobsProfile(url, 'env-one', () => 'file-one')).toBe(
      'query-one',
    )
  })

  it('falls back to HERMES_PROFILE env var', () => {
    const url = new URL('http://localhost/api/hermes-jobs')
    expect(resolveJobsProfile(url, 'env-one', () => 'file-one')).toBe(
      'env-one',
    )
  })

  it('falls back to file-backed active profile when env is absent', () => {
    const url = new URL('http://localhost/api/hermes-jobs')
    expect(resolveJobsProfile(url, undefined, () => 'file-one')).toBe('file-one')
  })

  it('ignores the default sentinel from active_profile', () => {
    const url = new URL('http://localhost/api/hermes-jobs')
    expect(resolveJobsProfile(url, undefined, () => 'default')).toBeNull()
  })
})

describe('buildJobsProfileSearch', () => {
  it('adds the resolved profile while preserving other params', () => {
    const url = new URL('http://localhost/api/hermes-jobs?limit=10')
    expect(buildJobsProfileSearch(url, 'aurora')).toBe(
      '?limit=10&profile=aurora',
    )
  })

  it('replaces any inbound profile query with the resolved profile', () => {
    expect(buildJobsProfileSearch('?profile=old&limit=10', 'new')).toBe(
      '?limit=10&profile=new',
    )
  })

  it('drops profile from the query when no resolved profile exists', () => {
    expect(buildJobsProfileSearch('?profile=old&limit=10', null)).toBe(
      '?limit=10',
    )
  })
})
