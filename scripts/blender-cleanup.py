"""Free Blender GLB normalization, validation, and .blend source preservation.
Run blender -b --python scripts/blender-cleanup.py -- assets/authored public/models
Optional trailing --pilot restricts validation to Pip and station module.
"""
import bpy, sys, os, json
from pathlib import Path
args=sys.argv[sys.argv.index('--')+1:]
src=Path(args[0]).resolve();dest=Path(args[1]).resolve();dest.mkdir(parents=True,exist_ok=True)
blend_dir=src.parent/'blender';blend_dir.mkdir(parents=True,exist_ok=True)
pilot='--pilot' in args
extras='--extras' in args
report=[]
for path in sorted(src.glob('*.glb')):
    if pilot and path.stem not in ['pip-default','station-0']:continue
    if extras and path.stem not in ['tunnel-entrance','harbor']:continue
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=str(path))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    # Authored input is already metre-scale, Y-up glTF, vertex colours linear.
    # Preserve split normals, articulation transforms and animation; merge by distance
    # only for static modules where vertices share position and color safely.
    verts=sum(len(o.data.vertices) for o in meshes)
    tris=sum(sum(len(p.vertices)-2 for p in o.data.polygons) for o in meshes)
    for obj in meshes:
        obj.data.validate(verbose=False,clean_customdata=False)
    bpy.context.scene.unit_settings.system='METRIC'
    bpy.context.scene.unit_settings.scale_length=1
    blend=blend_dir/(path.stem+'.blend')
    bpy.ops.wm.save_as_mainfile(filepath=str(blend))
    out=dest/path.name
    bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',export_animations=True,export_yup=True,export_apply=False)
    report.append({'id':path.stem,'input':str(path),'blend':str(blend),'final':str(out),'vertices':verts,'triangles':tris,'meshes':len(meshes),'materials':len(bpy.data.materials),'textures':len(bpy.data.images),'actions':[a.name for a in bpy.data.actions],'bytes':out.stat().st_size,'status':'Blender imported, validated, saved, and exported; runtime visual inspection separate'})
(src.parent/('blender-pilot-report.json' if pilot else 'blender-extras-report.json' if extras else 'blender-report.json')).write_text(json.dumps(report,indent=2),encoding='utf-8')
print('Validated and exported',len(report),'assets')
