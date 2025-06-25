import {type SchemaTypeDefinition} from 'sanity'

import {authorType} from './documents/author'
import {postType} from './documents/post'
import {settings} from './singletons/settings'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Singletons
  settings,
  // Documents
  postType,
  authorType,
]
