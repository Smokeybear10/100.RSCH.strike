# Strike Research Work

## Data needed for a valid benchmark

The annotation workspace and video-to-manifest/prediction workflow are implemented. The remaining benchmark work needs new footage and human review.

- Resolve fight IDs, source IDs, and video timestamps for the legacy clips.
- Review legacy labels for strike attempts, including misses and blocks; leave ambiguous clips in development.
- Label new fights with hard negatives such as feints, guard changes, clinch breaks, and camera motion.
- Reserve complete, uninspected fights for the final test before selecting clips.
- Generate paired raw/masked inputs with identical frame IDs and document mask provenance in the source dataset.

## Experiments after the data audit passes

- Run the frozen ImageNet appearance baseline with raw and masked inputs under identical settings.
- Review per-fight errors and paired prediction changes before claiming a benefit from segmentation.
- Repeat with fixed, reported seeds; assess uncertainty at the fight level when enough fights exist.
- Consider a temporal model only after establishing the appearance baseline. Frame averaging cannot distinguish forward from reversed motion.

## Deferred UI work

Spritesheets for hero playback remain deferred until measured network or scrub performance justifies them. Research data and reproducible results take priority.
