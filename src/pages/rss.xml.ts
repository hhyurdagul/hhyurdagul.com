import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
    const blogs = await getCollection('blogs');
    const sortedPosts = blogs.sort(
        (a, b) => Number(new Date(b.data.date)) - Number(new Date(a.data.date))
    );
    return rss({
        title: 'HHYurdagul Blogs',
        description:
            'I post my thought on life, math, engineering and AI here.',
        site: context.site || 'https://hhyurdagul.com',
        items: sortedPosts.map((post) => ({
            title: post.data.title,
            pubDate: post.data.date,
            description: post.data.description,
            link: `/blog/${post.slug}/`,
        })),
        customData: `<language>en-us</language>`,
    });
}
