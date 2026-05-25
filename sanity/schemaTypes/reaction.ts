import {defineField, defineType} from 'sanity';

export const reaction = defineType({
  name: 'reaction',
  title: 'Post Reactions',
  type: 'document',
  fields: [
    defineField({
      name: 'postId',
      title: 'Post document ID',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'fireCount', title: 'Fire count', type: 'number', initialValue: 0}),
    defineField({name: 'deadCount', title: 'Dead count', type: 'number', initialValue: 0}),
    defineField({name: 'preachCount', title: 'Preach count', type: 'number', initialValue: 0}),
    defineField({name: 'perfectCount', title: 'Perfect count', type: 'number', initialValue: 0}),
    defineField({name: 'teaCount', title: 'Tea count', type: 'number', initialValue: 0}),
    defineField({name: 'legacyPostId', title: 'Legacy Supabase post ID', type: 'string'}),
  ],
  preview: {
    select: {
      title: 'postId',
    },
  },
});
