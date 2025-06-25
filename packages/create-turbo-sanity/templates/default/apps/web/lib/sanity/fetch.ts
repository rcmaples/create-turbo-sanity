import {draftMode} from 'next/headers'
import type {ClientPerspective, QueryParams} from 'next-sanity'

import {client} from './client'
import {token} from './token'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  perspective: _perspective,
  stega: _stega,
}: {
  query: QueryString
  params?: QueryParams | Promise<QueryParams>
  perspective?: Omit<ClientPerspective, 'raw'>
  stega?: boolean
}) {
  const perspective = _perspective || (await draftMode()).isEnabled ? 'previewDrafts' : 'published'
  const stega = _stega || perspective === 'previewDrafts' || process.env.VERCEL_ENV === 'preview'
  if (perspective === 'previewDrafts') {
    return client.fetch(query, await params, {
      stega,
      perspective: 'previewDrafts',
      token,
      useCdn: false,
      next: {revalidate: 0},
    })
  }
  return client.fetch(query, await params, {
    stega,
    perspective: 'published',
    useCdn: true,
    next: {revalidate: 60},
  })
}
