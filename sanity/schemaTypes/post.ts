import {defineField, defineType} from 'sanity';

export const post = defineType({
  name: 'post',
  title: 'Post',
  type: 'document',
  fields: [
    defineField({name: 'title', title: 'Title', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'category', title: 'Category', type: 'string'}),
    defineField({name: 'byline', title: 'Byline', type: 'string'}),
    defineField({
      name: 'bodyHtml',
      title: 'Body HTML',
      type: 'text',
      rows: 12,
      description: 'Preserves the original Supabase/legacy rich text exactly.',
    }),
    defineField({name: 'tag', title: 'Tag', type: 'string'}),
    defineField({
      name: 'imageUrl',
      title: 'Image URL or data URL',
      type: 'string',
      description: 'Preserves legacy image_url values, including base64 data URLs.',
    }),
    defineField({name: 'isPublished', title: 'Published', type: 'boolean', initialValue: true}),
    defineField({name: 'publishedAt', title: 'Published at', type: 'datetime'}),
    defineField({name: 'sortOrder', title: 'Sort order', type: 'number', initialValue: 100}),
    defineField({name: 'legacyId', title: 'Legacy Supabase/static ID', type: 'string'}),
    defineField({name: 'isPinned', title: 'Pinned', type: 'boolean', initialValue: false}),
    defineField({name: 'stampLabel', title: 'Stamp label', type: 'string'}),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'category',
    },
  },
});
