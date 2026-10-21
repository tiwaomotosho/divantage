#!/usr/bin/env bash
# Rebuild every generated catalogue file from the plain-text sources, then validate.
# Run from the pack/repo root:  bash spec-assets/generators/rebuild_all.sh
# Sources (the ONLY files an admin edits by hand) live in spec-assets/taxonomy/source/.
set -euo pipefail
SRC=spec-assets/taxonomy/source; G=spec-assets/generators
python3 -I $G/build_identity.py  $SRC .   # sectors, families, identities (ISCO-08), needs, tool registry
python3 -I $G/build_learning.py  $SRC .   # handwritten roadmaps + flagship lenses, lens index, who-uses
python3 -I $G/build_roadmaps.py  $SRC .   # archetype+signature roadmaps for every other registry tool
python3 -I $G/build_skills.py    $SRC .   # Skills entry point
python3 -I $G/build_helpers.py   $SRC .   # helpers + pilot profiles (V2.5)
python3 -I $G/export_occupations.py .     # occupations directory (CSV + Markdown)
python3 -I $G/export_feature_matrix.py . # feature matrix table in doc 23 (V2.5)
python3 -I spec-assets/validate_identity_layer.py spec-assets 08_Starter_Catalogue
python3 -I spec-assets/validate_catalogue.py spec-assets 08_Starter_Catalogue/records
python3 -I spec-assets/validate_feature_matrix.py .  # every owner feature traceable (V2.5, TC-130)
echo "Now run the search harnesses (needs: npm i minisearch@7.1.2): node spec-assets/search/identity-harness.mjs . && node spec-assets/search/reference-harness.mjs ."
