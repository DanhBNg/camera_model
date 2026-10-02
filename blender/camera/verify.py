"""Independent round-trip checks of the delivered GLB in a fresh process."""
import bpy, pathlib, math, json, hashlib, struct
from mathutils import Vector
HERE=pathlib.Path(__file__).resolve().parent
path=HERE.parents[1]/'src/assets/models/camera.glb'
expected={'body','top','base','mount','lens','glass','iris','back','finder','shutter','speed_dial','rewind','advance','film_cartridge','takeup','film_gate','curtain'}
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
assert bpy.ops.import_scene.gltf(filepath=str(path))=={'FINISHED'}
roots=[o for o in bpy.context.scene.objects if o.parent is None]
assert {o.name for o in roots}==expected
assert bpy.data.objects.get('focus-pivot').parent.name=='lens'
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];triangles=0;points=[]
for o in meshes:
    o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
    assert len(o.data.materials)>0
    assert len(o.data.vertices)>0
    for v in o.data.vertices:
        p=o.matrix_world @ v.co
        assert all(math.isfinite(n) for n in p);points.append(p)
minimum=[min(p[i] for p in points) for i in range(3)]
maximum=[max(p[i] for p in points) for i in range(3)]
dims=[b-a for a,b in zip(minimum,maximum)]
assert .13<dims[0]<.16 and .075<dims[1]<.10 and .08<dims[2]<.10,dims
assert triangles<250000,triangles
assert len(meshes)<130,len(meshes)
assert path.stat().st_size<15*1024**2
data=path.read_bytes();chunk=struct.unpack_from('<I',data,12)[0];doc=json.loads(data[20:20+chunk])
assert all('uri' not in b for b in doc['buffers'])
assert all('uri' not in i for i in doc.get('images',[]))
report={'status':'PASS','sha256':hashlib.sha256(data).hexdigest(),'assemblies':sorted(expected),'meshes':len(meshes),'triangles':triangles,'bytes':len(data),'dimensions_m_blender_xyz':dims,'materials':len(doc.get('materials',[])),'checks':['GLB reimport','17 named roots','focus hierarchy','finite vertices','materials','dimension bounds','geometry budget','self contained buffers and images'],'purpose':'interactive web visualization','manufacture':'NOT_REQUESTED'}
report['source_sha256']={p.name:hashlib.sha256(p.read_bytes()).hexdigest() for p in HERE.glob('*.py')}
report['blend_sha256']=hashlib.sha256((HERE/'camera.blend').read_bytes()).hexdigest()
(HERE/'build-report.json').write_text(json.dumps(report,indent=2),encoding='utf8')
print('AGENT_OK '+json.dumps(report))
