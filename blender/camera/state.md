# ATELIER 35 — Blender rebuild

Date: 2026-10-02 (Asia/Saigon).
Purpose: interactive web visualization. User approved redesign, then explicitly deferred assembly gameplay. Manufacture: NOT_REQUESTED.

## Inputs and workflow

Reference: original camera source in this repository, approved silver / dark teal rangefinder design. No external or AI-generated meshes. Dimensions, optical stack, internal mechanisms and hidden surfaces are inferred original design, not a commercial camera reconstruction.

Read `C:/Users/AMLT/Downloads/DESIGN-OS-3D-GUIDE.md`, local design-os `AGENTS.md`, `.project-agent.md`, `blender-agent-core`, foundational scripting/workflow/version material and export guidance. Local tools: `C:/Users/AMLT/Desktop/explode/tools/design-os-3d-blender`; toolchain records revision `0fa32f46f261009f14cf318c8c4b3137f210a667`. Executed Blender reports 5.2.2 LTS.

Route: disposable headless Blender processes using native data API. No claim of passing the full upstream native pipeline or production gate. Script postconditions and last AGENT_OK marker are automated; silhouette, finish and framing review are manual image inspections.

## Structure

17 roots retain stable IDs: body, top, base, mount, lens, glass, finder, shutter, back, iris, speed_dial, rewind, advance, film_cartridge, takeup, film_gate, curtain. Focus is a child pivot of lens; back's origin is its left hinge. Pressure plate stays with the back door. Other details merge only within their common parent and material.

Native dimensions are metres. Constructor inputs use web axes +Y up/+Z forward at 35 mm per unit, mapped into Blender as `(x,-z,y) * .035`; GLB exports Y-up. Adapter converts translations and vertex positions back to presentation units once.

## Outputs

- `camera-editable.blend`: individual details and modifiers, editable before batching.
- `camera.blend`: mesh batches per moving parent/material, source of the GLB.
- `camera-studio.blend`: camera/lights/ground presentation scene from the exported GLB.
- `../../src/assets/models/camera.glb`: self-contained web asset.
- `build-report.json`: independent reimport report, source and artifact hashes.
- `../../artifacts/blender/camera-studio.png`: studio render; preview-receipt.json records its input identity.

All .blend files can be regenerated. Run `npm run model:camera`, then `npm run build`. BLENDER_BIN overrides the runner's existing portable Blender path. Run Blender with `--background --factory-startup --disable-autoexec --python-exit-code 3 --python blender/camera/preview.py` to regenerate the studio scene/image.

## Verification and limits

verify.py checks GLB reimport, finite vertices, expected roots/pivot, materials, overall bounds, 250k triangle / 130 mesh / 15 MiB budgets and self-contained resources. Current hashes/counts are in build-report.json.

Browser checks cover desktop and emulated mobile, all 17 selectable assemblies, optical-centre picking, isolate, explode/reset, optics detach, back hinge, focus, shutter lockout, orbit/zoom/pinch and zero external requests. Gameplay is excluded at the owner's request. Emulation does not establish physical-phone performance.

Shutter-button movement, focus-ring rotation and mechanisms are illustrative; no computed optical image, accurate curtain mechanics or manufacturing validation. Alpha-based multi-layer glass approximates coated lenses in real time.

Original root HTML preserved at `artifacts/before-blender/index.html`. Work remains local on `camera-blender-redesign`; nothing published.
