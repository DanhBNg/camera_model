"""A native studio scene and modest preview rendered from the exported asset."""
import bpy, pathlib, json, hashlib, math
from mathutils import Vector
HERE=pathlib.Path(__file__).resolve().parent
ROOT=HERE.parents[1]
for o in list(bpy.data.objects):bpy.data.objects.remove(o,do_unlink=True)
asset=ROOT/'src/assets/models/camera.glb'
assert bpy.ops.import_scene.gltf(filepath=str(asset))=={'FINISHED'}
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=800;scene.render.resolution_y=700;scene.render.resolution_percentage=100
scene.world.color=(.17,.17,.17)
def aim(o,target):o.rotation_euler=(Vector(target)-o.location).to_track_quat('-Z','Y').to_euler()
cam_data=bpy.data.cameras.new('Studio camera');cam=bpy.data.objects.new('Studio camera',cam_data)
scene.collection.objects.link(cam);cam.location=(.21,-.31,.16);aim(cam,(0,-.013,.002));cam_data.lens=54;cam_data.clip_start=.005;scene.camera=cam
for name,pos,power,size,color in [('Key',(-.12,-.13,.25),9,.20,(1,.91,.80)),('Fill',(.23,-.06,.11),5,.16,(.75,.89,1)),('Rim',(.02,.16,.19),12,.14,(1,1,1))]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color
    o=bpy.data.objects.new(name,data);scene.collection.objects.link(o);o.location=pos;aim(o,(0,0,0))
mesh=bpy.data.meshes.new('Ground');mesh.from_pydata([(-2,-2,-.042),(2,-2,-.042),(2,2,-.042),(-2,2,-.042)],[],[(0,1,2,3)])
ground=bpy.data.objects.new('Ground',mesh);scene.collection.objects.link(ground)
mat=bpy.data.materials.new('Studio slate');mat.diffuse_color=(.026,.047,.05,1);mat.use_nodes=True
mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(.026,.047,.05,1);mat.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.72
mesh.materials.append(mat)
scene.view_settings.view_transform='AgX'
out=ROOT/'artifacts/blender';out.mkdir(parents=True,exist_ok=True)
scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'camera-studio.png')
assert bpy.ops.wm.save_as_mainfile(filepath=str(HERE/'camera-studio.blend'))=={'FINISHED'}
assert bpy.ops.render.render(write_still=True)=={'FINISHED'}
receipt={'asset_sha256':hashlib.sha256(asset.read_bytes()).hexdigest(),'preview':'artifacts/blender/camera-studio.png','resolution':[800,700],'engine':'Cycles','samples':32}
(out/'preview-receipt.json').write_text(json.dumps(receipt,indent=2),encoding='utf8')
print('AGENT_OK '+json.dumps(receipt))
