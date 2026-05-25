# In-Case-No-One-Asked
Our personal blog.

## License

This project is proprietary and closed source. No one may use, copy, modify,
distribute, host, deploy, or create derivative works from this website without
prior written permission from the copyright owner.

## Sanity CMS

Content now lives in Sanity project `1lhk4fvw`, dataset `production`.

Useful commands:

```bash
pnpm sanity:dev
pnpm sanity:seed
pnpm sanity:deploy
```

Set `SANITY_API_WRITE_TOKEN` before running `pnpm sanity:seed` or using site writes.
The migration readout found `0` live Supabase rows, so the seed script preserves the
three starter posts that were previously hardcoded in the app.
