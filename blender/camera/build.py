"""Reproducible ATELIER 35 asset; run with Blender --background --python."""
import sys, pathlib, json, traceback
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import bpy
import geometry as g
import chassis, optics, mechanisms

def main():
    # Disposable factory-startup process only. Never run against a user's open file.
    for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
    bpy.context.scene.unit_settings.system='METRIC'
    bpy.context.scene.unit_settings.scale_length=1
    g.palette();chassis.build();optics.build();mechanisms.build()
    bpy.context.view_layer.update()
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'camera-editable.blend'))
    g.merge_visuals()
    groups=[o for o in bpy.context.scene.objects if o.type=='EMPTY' and o.parent is None]
    assert len(groups)==17,len(groups)
    for o in groups:o['presentationUnitMeters']=g.S
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'camera.blend'))
    out=HERE.parents[1]/'src/assets/models/camera.glb';out.parent.mkdir(parents=True,exist_ok=True)
    assert bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_apply=True,export_extras=True,export_yup=True,export_cameras=False,export_lights=False)=={'FINISHED'}
    assert out.stat().st_size>10000
    print('AGENT_OK '+json.dumps({'stage':'build','assemblies':len(groups),'bytes':out.stat().st_size,'meshes':len([o for o in bpy.context.scene.objects if o.type=='MESH'])}))

try:main()
except Exception:
    traceback.print_exc();print('AGENT_FAIL {"stage":"build"}');raise
