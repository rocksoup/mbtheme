# Temporary Micropub Implementation Files

These files are for the **microintegrations** repository, NOT this theme repo.

## Files to Copy to microintegrations:

1. **scripts/utils/micropub-client.mjs** → `scripts/utils/micropub-client.mjs`
2. **scripts/enrich-watched-micropub.mjs** → `scripts/enrich-watched-micropub.mjs`
3. **.github/workflows/enrich-watched.yml** → `.github/workflows/enrich-watched.yml` (REPLACE existing)

## Instructions:

1. Pull this branch
2. Copy these files to your microintegrations repo
3. Update package.json in microintegrations (see MICROPUB_IMPLEMENTATION_CHECKLIST.md)
4. Configure GitHub secrets (see checklist)
5. Delete this `temp-micropub-files/` directory from mbtheme

## Important:

These files should NOT stay in the theme repo - they're only here temporarily for easy transfer.
