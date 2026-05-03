#!/usr/bin/env bash
# =============================================================================
# ShowVibe — Supabase TypeScript Type Generation
# Usage: ./scripts/db-types.sh
# Requires: supabase CLI linked (supabase link --project-ref <ref>)
# =============================================================================

set -euo pipefail

OUTPUT_PATH="src/lib/supabase/database.types.ts"

mkdir -p "$(dirname "$OUTPUT_PATH")"

echo "Generating Supabase types -> $OUTPUT_PATH"
npx supabase gen types typescript --linked > "$OUTPUT_PATH"

echo "Done."
