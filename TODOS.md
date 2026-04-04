# TODOS

## Spritesheet optimization for hero player
**Priority:** Low (performance optimization)
**Status:** Deferred — revisit after testing scrub performance with individual images

Pack pre-extracted WebP frames into spritesheets (one per clip). Reduces HTTP requests from ~190 per clip to 1. Canvas draws from source coordinates instead of loading individual Image objects.

**When to do this:** If scrubbing feels janky with individual images on a real connection (not localhost). HTTP/2 multiplexing on Vercel should handle it, but if it doesn't, this is the fix.

**Implementation:** Python script using Pillow. Input: directory of WebP frames. Output: single spritesheet image + JSON manifest mapping frame index to {x, y, width, height} source coordinates. Canvas `drawImage(spritesheet, sx, sy, sw, sh, dx, dy, dw, dh)` for rendering.

**Depends on:** Hero player built and testable.
