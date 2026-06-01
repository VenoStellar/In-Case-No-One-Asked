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
    defineField({name: 'heartCount', title: 'Heart count', type: 'number', initialValue: 0}),
    defineField({name: 'likeCount', title: 'Like count', type: 'number', initialValue: 0}),
    defineField({name: 'dislikeCount', title: 'Dislike count', type: 'number', initialValue: 0}),
    defineField({name: 'laughCount', title: 'Laugh count', type: 'number', initialValue: 0}),
    defineField({name: 'teaCount', title: 'Tea count', type: 'number', initialValue: 0}),
    defineField({name: 'legacyPostId', title: 'Legacy Supabase post ID', type: 'string'}),
  ],
  preview: {
    select: {
      title: 'postId',
    },
  },
});
