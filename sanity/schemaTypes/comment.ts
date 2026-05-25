import {defineField, defineType} from 'sanity';

export const comment = defineType({
  name: 'comment',
  title: 'Reader Comment',
  type: 'document',
  fields: [
    defineField({name: 'authorName', title: 'Author name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'content', title: 'Content', type: 'text', rows: 4, validation: (rule) => rule.required()}),
    defineField({name: 'createdAt', title: 'Created at', type: 'datetime'}),
    defineField({name: 'legacyId', title: 'Legacy Supabase ID', type: 'string'}),
  ],
  preview: {
    select: {
      title: 'authorName',
      subtitle: 'content',
    },
  },
});
