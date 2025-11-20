#!/bin/bash
# Start the Hugo development server using the local theme and demo site
echo "Starting Saunter Theme Development Server..."
echo "Theme Source: $(pwd)"
echo "Demo Site: examples/demo-site"
echo "--------------------------------------------------"

# We use the absolute path to the parent directory as the themesDir
# to ensure Hugo finds the 'mbtheme' folder correctly.
# This assumes the script is run from the root of the mbtheme repository.
THEMES_DIR=$(pwd)/../

hugo server \
  --source examples/demo-site \
  --themesDir "$THEMES_DIR" \
  --theme mbtheme \
  --disableFastRender \
  --navigateToChanged \
  --buildDrafts \
  --buildFuture
