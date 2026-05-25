import {defineConfig} from 'sanity';
import {structureTool} from 'sanity/structure';
import {visionTool} from '@sanity/vision';
import {schemaTypes} from './sanity/schemaTypes';

export default defineConfig({
  name: 'in_case_no_one_asked',
  title: 'In Case No One Asked',
  basePath: '/studio',
  projectId: '1lhk4fvw',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {
    types: schemaTypes,
  },
});
