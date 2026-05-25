import {createClient} from '@sanity/client';
import {sanityApiVersion, sanityDataset, sanityProjectId, sanityReadToken, sanityWriteToken} from './env';

export const sanityReadClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  token: sanityReadToken || sanityWriteToken,
  useCdn: false,
});

export const sanityWriteClient = createClient({
  projectId: sanityProjectId,
  dataset: sanityDataset,
  apiVersion: sanityApiVersion,
  token: sanityWriteToken,
  useCdn: false,
});

export function requireSanityWriteToken() {
  if (!sanityWriteToken) {
    throw new Error('SANITY_API_WRITE_TOKEN is required for Sanity mutations.');
  }
}
