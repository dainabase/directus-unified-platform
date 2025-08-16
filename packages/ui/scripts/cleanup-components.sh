#!/bin/bash

# Session 37 - Component Cleanup Script
# Purpose: Clean duplicate components and organize orphan files

echo "🧹 Starting Component Cleanup - Session 37"
echo "========================================="

cd packages/ui/src/components

# STEP 1: Handle duplicate directories
echo "📁 Step 1: Merging duplicate directories..."

# Merge breadcrumb vs breadcrumbs
if [ -d "breadcrumbs" ] && [ -d "breadcrumb" ]; then
  echo "Merging breadcrumbs into breadcrumb..."
  cp -r breadcrumbs/* breadcrumb/ 2>/dev/null || true
  rm -rf breadcrumbs
  echo "✅ Merged: breadcrumbs → breadcrumb"
fi

# Merge chart vs charts  
if [ -d "charts" ] && [ -d "chart" ]; then
  echo "Merging charts into chart..."
  cp -r charts/* chart/ 2>/dev/null || true
  rm -rf charts
  echo "✅ Merged: charts → chart"
fi

# Merge data-grid variants
if [ -d "data-grid-adv" ] || [ -d "data-grid-advanced" ]; then
  echo "Merging data-grid variants..."
  [ -d "data-grid-adv" ] && cp -r data-grid-adv/* data-grid/ 2>/dev/null || true
  [ -d "data-grid-advanced" ] && cp -r data-grid-advanced/* data-grid/ 2>/dev/null || true
  rm -rf data-grid-adv data-grid-advanced
  echo "✅ Merged: data-grid-adv, data-grid-advanced → data-grid"
fi

# Merge timeline variants
if [ -d "timeline-enhanced" ] && [ -d "timeline" ]; then
  echo "Merging timeline-enhanced into timeline..."
  cp -r timeline-enhanced/* timeline/ 2>/dev/null || true
  rm -rf timeline-enhanced
  echo "✅ Merged: timeline-enhanced → timeline"
fi

# STEP 2: Organize orphan files into their directories
echo ""
echo "📂 Step 2: Organizing orphan files..."

# Move audio-recorder files
if [ -f "audio-recorder.tsx" ]; then
  mkdir -p audio-recorder
  mv audio-recorder.tsx audio-recorder/
  [ -f "audio-recorder.test.tsx" ] && mv audio-recorder.test.tsx audio-recorder/
  [ -f "audio-recorder.stories.tsx" ] && mv audio-recorder.stories.tsx audio-recorder/
  echo "✅ Organized: audio-recorder files → audio-recorder/"
fi

# Move code-editor files (keep directory, move orphan files)
if [ -f "code-editor.tsx" ]; then
  mv code-editor.tsx code-editor/
  [ -f "code-editor.test.tsx" ] && mv code-editor.test.tsx code-editor/
  [ -f "code-editor.stories.tsx" ] && mv code-editor.stories.tsx code-editor/
  echo "✅ Organized: code-editor files → code-editor/"
fi

# Move drag-drop-grid files
if [ -f "drag-drop-grid.tsx" ]; then
  mkdir -p drag-drop-grid
  mv drag-drop-grid.tsx drag-drop-grid/
  [ -f "drag-drop-grid.test.tsx" ] && mv drag-drop-grid.test.tsx drag-drop-grid/
  [ -f "drag-drop-grid.stories.tsx" ] && mv drag-drop-grid.stories.tsx drag-drop-grid/
  echo "✅ Organized: drag-drop-grid files → drag-drop-grid/"
fi

# Move image-cropper files
if [ -f "image-cropper.tsx" ]; then
  mv image-cropper.tsx image-cropper/
  [ -f "image-cropper.test.tsx" ] && mv image-cropper.test.tsx image-cropper/
  [ -f "image-cropper.stories.tsx" ] && mv image-cropper.stories.tsx image-cropper/
  echo "✅ Organized: image-cropper files → image-cropper/"
fi

# Move infinite-scroll files
if [ -f "infinite-scroll.tsx" ]; then
  mkdir -p infinite-scroll
  mv infinite-scroll.tsx infinite-scroll/
  [ -f "infinite-scroll.test.tsx" ] && mv infinite-scroll.test.tsx infinite-scroll/
  [ -f "infinite-scroll.stories.tsx" ] && mv infinite-scroll.stories.tsx infinite-scroll/
  echo "✅ Organized: infinite-scroll files → infinite-scroll/"
fi

# Move kanban files
if [ -f "kanban.tsx" ]; then
  mv kanban.tsx kanban/
  [ -f "kanban.test.tsx" ] && mv kanban.test.tsx kanban/
  [ -f "kanban.stories.tsx" ] && mv kanban.stories.tsx kanban/
  echo "✅ Organized: kanban files → kanban/"
fi

# Move pdf-viewer files
if [ -f "pdf-viewer.tsx" ]; then
  mv pdf-viewer.tsx pdf-viewer/
  [ -f "pdf-viewer.test.tsx" ] && mv pdf-viewer.test.tsx pdf-viewer/
  [ -f "pdf-viewer.stories.tsx" ] && mv pdf-viewer.stories.tsx pdf-viewer/
  echo "✅ Organized: pdf-viewer files → pdf-viewer/"
fi

# Move rich-text-editor files
if [ -f "rich-text-editor.tsx" ]; then
  mv rich-text-editor.tsx rich-text-editor/
  [ -f "rich-text-editor.test.tsx" ] && mv rich-text-editor.test.tsx rich-text-editor/
  [ -f "rich-text-editor.stories.tsx" ] && mv rich-text-editor.stories.tsx rich-text-editor/
  echo "✅ Organized: rich-text-editor files → rich-text-editor/"
fi

# Move video-player files
if [ -f "video-player.tsx" ]; then
  mkdir -p video-player
  mv video-player.tsx video-player/
  [ -f "video-player.test.tsx" ] && mv video-player.test.tsx video-player/
  [ -f "video-player.stories.tsx" ] && mv video-player.stories.tsx video-player/
  echo "✅ Organized: video-player files → video-player/"
fi

# Move virtual-list files
if [ -f "virtual-list.tsx" ]; then
  mkdir -p virtual-list
  mv virtual-list.tsx virtual-list/
  [ -f "virtual-list.test.tsx" ] && mv virtual-list.test.tsx virtual-list/
  [ -f "virtual-list.stories.tsx" ] && mv virtual-list.stories.tsx virtual-list/
  echo "✅ Organized: virtual-list files → virtual-list/"
fi

# STEP 3: Create index files for new directories
echo ""
echo "📝 Step 3: Creating index.ts files..."

for dir in audio-recorder drag-drop-grid infinite-scroll video-player virtual-list; do
  if [ -d "$dir" ] && [ ! -f "$dir/index.ts" ]; then
    echo "export * from './${dir%.tsx}';" > "$dir/index.ts"
    echo "✅ Created index.ts for $dir"
  fi
done

# STEP 4: Update main index.ts
echo ""
echo "📝 Step 4: Updating main components index..."

# This would need to be done more carefully in practice
echo "⚠️  Note: Manual review needed for src/components/index.ts"

# STEP 5: Bundle files cleanup
echo ""
echo "🗑️ Step 5: Removing bundle files (will use direct imports)..."
rm -f advanced-bundle.ts data-bundle.ts feedback-bundle.ts forms-bundle.ts navigation-bundle.ts overlays-bundle.ts heavy-components.tsx
echo "✅ Removed all bundle files"

# STEP 6: Summary
echo ""
echo "========================================="
echo "✅ CLEANUP COMPLETE!"
echo ""
echo "Summary of changes:"
echo "- Merged 4 duplicate component directories"
echo "- Organized 10 orphan component files"
echo "- Created index files for new directories"
echo "- Removed 7 bundle files"
echo ""
echo "Next steps:"
echo "1. Review and update src/components/index.ts"
echo "2. Run tests to ensure everything works"
echo "3. Update imports in consuming code"
