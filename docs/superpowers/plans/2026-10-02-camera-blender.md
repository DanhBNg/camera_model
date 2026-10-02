# Camera Blender implementation plan

**Goal:** Rebuild the approved ATELIER 35 as a detailed, separable Blender asset and integrate it into the offline viewer.
**Architecture:** Native Python construction in `blender/camera/`; GLB at `src/assets/models/camera.glb`; asynchronous GLTFLoader adapter supplies the existing runtime contract. Build embeds GLB bytes in the standalone HTML.
**Tech stack:** Blender 5.2.2, Python, Three.js, esbuild, Node tests.

- [x] Preserve current HTML in artifacts before rebuilding; run baseline tests.
- [x] Define and test 17-part metadata coverage and detachable optics behavior. Vocabulary/gameplay expansion deferred by user.
- [x] Create native mesh/material helpers, chassis, optics and internal-mechanism passes. Record purpose as interactive visualization and original inferred design. Keep the approved silhouette and existing pivots.
- [x] Save source Blender file and export separate named assemblies, retaining focus pivot. Independently re-import GLB and assert finite geometry, required names, dimension bounds and budget; write SHA-bound report.
- [x] Implement GLB adapter and inline binary loader. Update controller for iris detachment and dynamic count. User deferred assembly learning; source remains but is not invoked.
- [x] Build HTML and run unit plus desktop/mobile browser checks. All 7 unit tests pass. Browser verifies 17-part picking/isolation, reset, focus, shutter/back, orbit/zoom/pinch and expanded mobile framing; no page errors or network requests.
- [x] Deliver model, reproducible runner, verification report, studio preview and updated README. Kept local without commit/publish.

Final artifact: 17 assemblies, 75 mesh batches, 173,307 exported triangles, GLB 3,715,384 bytes. Runtime draws 192,503 triangles / 78 calls because transparent double-sided passes also count. Offline HTML is 5.32 MiB. Independent review found and prompted a fix for exploded mobile framing; regression browser test now passes for all four view presets.

Validation commands: `npm test`, `npm run model:camera`, `npm run build`, `npm run test:browser`.

Approval: user accepted the design on 02/10/2026 and instructed implementation. Work in the current requested workspace, preserving the pre-existing HTML. Numeric/export gates are implemented in scripts; aesthetic inspection is manual. Manufacture is outside this web-model task.
