import {defineField, defineType} from 'sanity';

export const comment = defineType({
  name: 'comment',
  title: 'Reader Comment',
  type: 'document',
  fields: [
    defineField({
      name: 'post',
      title: 'Post',
      type: 'reference',
      to: [{type: 'post'}],
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'authorName', title: 'Author name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'content', title: 'Content', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({
      name: 'parentComment',
      title: 'Parent comment (for replies)',
      type: 'reference',
      to: [{type: 'comment'}],
      description: 'Leave empty for top-level comments. Set this for replies to another comment.',
    }),
    defineField({
      name: 'replies',
      title: 'Replies',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{type: 'comment'}],
        },
      ],
      description: 'Automatically populated with replies to this comment.',
    }),
    defineField({name: 'createdAt', title: 'Created at', type: 'datetime'}),
    defineField({name: 'legacyId', title: 'Legacy Supabase ID', type: 'string'}),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'content',
      postTitle: 'post.title',
    },
    prepare({title, subtitle, postTitle}) {
      return {
        title: `${title} - ${postTitle || 'Post'}`,
        subtitle: subtitle?.substring(0, 50),
      };
    },
  },
});
