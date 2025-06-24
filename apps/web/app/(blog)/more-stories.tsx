import Link from 'next/link'

import {sanityFetch} from '../../lib/sanity/fetch'
import {moreStoriesQuery} from '../../lib/sanity/queries'
import Avatar from './avatar'
import CoverImage from './cover-image'
import DateComponent from './date'

export default async function MoreStories(params: {skip: string; limit: number}) {
  const data = await sanityFetch({query: moreStoriesQuery, params})

  return (
    <>
      <div className="mb-32 grid grid-cols-1 gap-y-20 md:grid-cols-2 md:gap-x-16 md:gap-y-32 lg:gap-x-32">
        {data?.map(
          (post: {
            _id: string
            title: string
            slug: string
            date: string
            coverImage: {asset?: {_ref?: string}; alt?: string}
            excerpt: string
            author: {name: string; picture: {asset?: {_ref?: string}; alt?: string}}
          }) => {
            const {_id, title, slug, coverImage, excerpt, author} = post
            return (
              <article key={_id}>
                <Link href={`/posts/${slug}`} className="group mb-5 block">
                  <CoverImage image={coverImage} priority={false} />
                </Link>
                <h3 className="text-balance mb-3 text-3xl leading-snug">
                  <Link href={`/posts/${slug}`} className="hover:underline">
                    {title}
                  </Link>
                </h3>
                <div className="mb-4 text-lg">
                  <DateComponent dateString={post.date} />
                </div>
                {excerpt && <p className="text-pretty mb-4 text-lg leading-relaxed">{excerpt}</p>}
                {author && <Avatar name={author.name} picture={author.picture} />}
              </article>
            )
          },
        )}
      </div>
    </>
  )
}
