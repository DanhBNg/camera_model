"""Native mesh builders. Inputs use the existing web frame: +Y up, +Z lens.
One presentation unit is 35 mm; stored Blender geometry is in metres.
"""
import bpy, math
from mathutils import Vector, Matrix
from collections import defaultdict
S = .035
C = Matrix(((1,0,0),(0,0,-1),(0,1,0)))
M = {}

def coord(p): return C @ Vector(p) * S

def material(name, color, metal=0, rough=.4, alpha=1):
    m=bpy.data.materials.new(name);m.diffuse_color=(*color,alpha);m.use_nodes=True
    p=m.node_tree.nodes.get('Principled BSDF')
    p.inputs['Base Color'].default_value=(*color,1)
    p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
    p.inputs['Alpha'].default_value=alpha
    if alpha<1:
        m.surface_render_method='DITHERED'
        p.inputs['Coat Weight'].default_value=1
        p.inputs['Coat Roughness'].default_value=.09
    M[name]=m;return m

def palette():
    for args in [('silver',(.56,.60,.60),.88,.28),('edge',(.28,.34,.35),.95,.22),
      ('dark',(.018,.025,.028),.6,.3),('leather',(.012,.063,.059),0,.82),
      ('black',(.004,.007,.008),.1,.75),('brass',(.53,.32,.105),.82,.3),
      ('orange',(.9,.12,.035),.3,.31),('ivory',(.72,.72,.60),.1,.46),
      ('glass',(.017,.16,.19),.16,.065,.15),('violet',(.065,.029,.14),.30,.10,.20),
      ('optic',(.005,.02,.03),.62,.12),('film',(.19,.066,.019),.25,.42)]: material(*args)
    # Deterministic seamless fine leather grain, packed into the native asset.
    import numpy as np
    rng=np.random.default_rng(317);h=rng.random((256,256))
    h=(h+np.roll(h,1,0)+np.roll(h,1,1))/3
    dx=(np.roll(h,-1,1)-np.roll(h,1,1))*.65
    dy=(np.roll(h,-1,0)-np.roll(h,1,0))*.65
    pixels=np.ones((256,256,4),dtype=np.float32)
    pixels[:,:,0]=.5+dx;pixels[:,:,1]=.5+dy;pixels[:,:,2]=1
    im=bpy.data.images.new('Atelier leather grain',width=256,height=256)
    im.colorspace_settings.name='Non-Color';im.pixels.foreach_set(pixels.ravel());im.pack()
    m=M['leather'];nt=m.node_tree;tex=nt.nodes.new('ShaderNodeTexImage');tex.image=im
    normal=nt.nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=.7
    nt.links.new(tex.outputs['Color'],normal.inputs['Color'])
    nt.links.new(normal.outputs['Normal'],nt.nodes.get('Principled BSDF').inputs['Normal'])

def group(name, pos=(0,0,0), parent=None):
    o=bpy.data.objects.new(name,None);bpy.context.scene.collection.objects.link(o)
    o.location=coord(pos);o.parent=parent
    if parent is None:o['partId']=name
    return o

def mesh(parent,name,verts,faces,mat,pos=(0,0,0),smooth=False,bevel=0):
    data=bpy.data.meshes.new(name);data.from_pydata([coord(v) for v in verts],[],faces);data.update()
    o=bpy.data.objects.new(name,data);bpy.context.scene.collection.objects.link(o)
    o.parent=parent;o.location=coord(pos);data.materials.append(M[mat]);o['explodeWithParent']=True
    for p in data.polygons:p.use_smooth=smooth
    if bevel:
        b=o.modifiers.new('Machined edge radii','BEVEL');b.width=bevel*S;b.segments=3
        b=o.modifiers.new('Surface normals','WEIGHTED_NORMAL');b.keep_sharp=True;b.weight=40
    return o

def box(p,n,size,pos,mat='dark',r=.02):
    x,y,z=[v/2 for v in size]
    vs=[(-x,-y,-z),(x,-y,-z),(x,y,-z),(-x,y,-z),(-x,-y,z),(x,-y,z),(x,y,z),(-x,y,z)]
    fs=[(0,3,2,1),(4,5,6,7),(0,1,5,4),(3,7,6,2),(0,4,7,3),(1,2,6,5)]
    return mesh(p,n,vs,fs,mat,pos,smooth=True,bevel=min(r,min(size)*.45))

def front_shell(p):
    outer=[];inner=[]
    # Uniform angular sampling keeps the optical opening circular, including
    # between the outer rectangle's corners. Ray/SDF intersection rounds the shell.
    for i in range(128):
        a=i*math.tau/128;dx=math.cos(a);dy=math.sin(a);lo=0;hi=3
        for _ in range(32):
            t=(lo+hi)/2;x=.23+t*dx;y=-.08+t*dy
            qx=abs(x)-1.79;qy=abs(y+.04)-.81
            sdf=math.hypot(max(qx,0),max(qy,0))+min(max(qx,qy),0)-.11
            if sdf>0:hi=t
            else:lo=t
        outer.append((.23+lo*dx,-.08+lo*dy))
        inner.append((.23+.635*dx,-.08+.635*dy))
    vs=[]
    for loop,z in [(outer,-.065),(outer,.065),(inner,-.065),(inner,.065)]:
        vs.extend((x,y,z) for x,y in loop)
    fs=[];N=len(outer)
    for i in range(N):
        j=(i+1)%N
        fs.extend([(i,j,N+j,N+i),(2*N+j,2*N+i,3*N+i,3*N+j),
                   (N+i,N+j,3*N+j,3*N+i),(j,i,2*N+i,2*N+j)])
    return mesh(p,'continuous front shell',vs,fs,'dark',(0,0,.45),bevel=.014)

def lathe(p,n,profile,pos=(0,0,0),mat='dark',axis='z',segments=80):
    vs=[];fs=[]
    for radius,h in profile:
        for i in range(segments):
            a=i*math.tau/segments;x=radius*math.cos(a);y=radius*math.sin(a)
            vs.append((x,y,h) if axis=='z' else (x,h,-y))
    for j in range(len(profile)-1):
        for i in range(segments):
            a=j*segments+i;b=j*segments+(i+1)%segments
            fs.append((a,b,b+segments,a+segments))
    return mesh(p,n,vs,fs,mat,pos,smooth=True)

def ring(p,n,ro,ri,d,pos,mat='dark',axis='z'):
    e=min(.012,d*.2,(ro-ri)*.2)
    return lathe(p,n,[(ri,-d/2),(ro-e,-d/2),(ro,-d/2+e),(ro,d/2-e),(ro-e,d/2),(ri,d/2),(ri,-d/2)],pos,mat,axis)

def cyl(p,n,r,d,pos,mat='dark',axis='y',segments=64):
    return lathe(p,n,[(0,-d/2),(r-.006,-d/2),(r,-d/2+.006),(r,d/2-.006),(r-.006,d/2),(0,d/2)],pos,mat,axis,segments)

def rotate(o,axis,angle):
    v=C @ Vector({'x':(1,0,0),'y':(0,1,0),'z':(0,0,1)}[axis])
    o.rotation_euler=(Matrix.Rotation(angle,4,v)).to_euler();return o

def ribs(p,n,r,depth,pos,axis='z',count=80,mat='edge'):
    for i in range(count):
        a=math.tau*i/count
        if axis=='z': q=(pos[0]+r*math.cos(a),pos[1]+r*math.sin(a),pos[2]);size=(.021,.029,depth)
        else:q=(pos[0]+r*math.cos(a),pos[1],pos[2]-r*math.sin(a));size=(.021,depth,.029)
        rotate(box(p,f'{n}_{i:03}',size,q,mat,.005),axis,a)

def screw(p,n,pos,axis='z',r=.037):
    cyl(p,n,r,.018,pos,'silver',axis,32)
    q=list(pos);q[2 if axis=='z' else 1]+=.010
    box(p,n+'_slot',(r*1.4,.007,.006) if axis=='z' else (r*1.4,.006,.007),q,'black',.001)

def text(p,n,body,size,pos,mat='ivory',face='front',angle=0):
    d=bpy.data.curves.new(n,'FONT');d.body=body;d.size=size*S;d.align_x='CENTER';d.align_y='CENTER'
    d.resolution_u=4;d.extrude=.00001;d.materials.append(M[mat])
    o=bpy.data.objects.new(n,d);bpy.context.scene.collection.objects.link(o);o.parent=p;o.location=coord(pos)
    # Font local XY faces +Z. Convert its intended web orientation to Blender.
    R=Matrix.Identity(3)
    if face=='top':R=Matrix.Rotation(-math.pi/2,3,'X')
    if face=='back':R=Matrix.Rotation(math.pi,3,'Y')
    if angle:R=R @ Matrix.Rotation(angle,3,'Z')
    o.rotation_euler=(C @ R).to_euler();return o

def merge_visuals():
    """Evaluate modifiers/fonts and batch by material within each moving parent."""
    bpy.context.view_layer.update();deps=bpy.context.evaluated_depsgraph_get()
    buckets=defaultdict(list)
    for o in list(bpy.context.scene.objects):
        if o.type in {'MESH','FONT'}:buckets[(o.parent,o.data.materials[0].name)].append(o)
    for (parent,mat),objects in buckets.items():
        vs=[];fs=[];smooth=[];normals=[]
        for o in objects:
            ev=o.evaluated_get(deps);me=ev.to_mesh();offset=len(vs)
            vs.extend([o.matrix_local @ v.co for v in me.vertices])
            for poly in me.polygons:fs.append(tuple(offset+i for i in poly.vertices));smooth.append(poly.use_smooth)
            normal_matrix=o.matrix_local.to_3x3().inverted().transposed()
            normals.extend((normal_matrix @ n.vector).normalized() for n in me.corner_normals)
            ev.to_mesh_clear()
        d=bpy.data.meshes.new(parent.name+'_'+mat);d.from_pydata(vs,[],fs);d.materials.append(M[mat]);d.update()
        if mat=='leather':
            uv=d.uv_layers.new(name='Surface UV')
            for poly in d.polygons:
                axis=max(range(3),key=lambda i:abs(poly.normal[i]))
                axes=[i for i in range(3) if i!=axis]
                for loop in poly.loop_indices:
                    co=d.vertices[d.loops[loop].vertex_index].co
                    uv.data[loop].uv=(co[axes[0]]/S*2,co[axes[1]]/S*2)
        ob=bpy.data.objects.new(d.name,d);bpy.context.scene.collection.objects.link(ob);ob.parent=parent
        for poly,s in zip(d.polygons,smooth):poly.use_smooth=s
        d.normals_split_custom_set(normals)
        for o in objects:bpy.data.objects.remove(o,do_unlink=True)
