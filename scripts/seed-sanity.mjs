import './load-env.mjs';
import {createClient} from '@sanity/client';
import {seedDocuments} from './sanity-seed-data.mjs';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '1lhk4fvw';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2026-05-25';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!token) {
  console.error('SANITY_API_WRITE_TOKEN is required to seed Sanity.');
  process.exit(1);
}

const client = createClient({projectId, dataset, apiVersion, token, useCdn: false});

const transaction = seedDocuments.reduce((tx, document) => tx.createOrReplace(document), client.transaction());

await transaction.commit();

console.log(`Seeded ${seedDocuments.length} Sanity documents into ${projectId}/${dataset}.`);
