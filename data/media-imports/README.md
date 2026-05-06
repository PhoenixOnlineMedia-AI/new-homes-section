# Media Import Intake

Use these folders as local staging areas before importing media into Supabase Storage.

## Builder Logos

Path:

```text
data/media-imports/builder-logos
```

Drop builder logo files here when you want the importer to match them to builders by filename. The matcher currently supports builder logos only.

Good filename examples:

```text
lennar-logo.png
taylor-morrison.svg
dr-horton-builder-logo.webp
```

Run a dry run first:

```bash
npm run import:builder-logos
```

Import matched logos:

```bash
npm run import:builder-logos -- --commit
```

## Community Photos

Reserved path:

```text
data/media-imports/community-photos
```

This folder is reserved for the later community photo matcher. The active importer does not process community photos yet.
