import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const palette = { ink:'#153e46', cream:'#fff0ce', sand:'#e7bb89', teal:'#159c9d', darkTeal:'#087a84', coral:'#ef7658', yellow:'#ffd36b', plum:'#765375', blue:'#4b78bf', brick:'#c47458', leaf:'#499b7c', metal:'#7c999e', dark:'#334f58', skin:'#b87852', white:'#fff9e9' };
export const worldMaterial = new THREE.MeshStandardMaterial({vertexColors:true,roughness:.82,metalness:.02});

/** A baked vertex-colour mesh has one draw call regardless of its component count. */
export class ShapeBuilder {
  private parts:THREE.BufferGeometry[]=[];
  add(geometry:THREE.BufferGeometry,color:string,x=0,y=0,z=0,rx=0,ry=0,rz=0):this {
    let g=geometry.index ? geometry.toNonIndexed():geometry;
    if(g!==geometry) geometry.dispose();
    g.deleteAttribute('uv');
    const m=new THREE.Matrix4().compose(new THREE.Vector3(x,y,z),new THREE.Quaternion().setFromEuler(new THREE.Euler(rx,ry,rz)),new THREE.Vector3(1,1,1));
    g.applyMatrix4(m);
    const c=new THREE.Color(color),n=g.getAttribute('position').count,a=new Float32Array(n*3);
    for(let i=0;i<n;i++){a[i*3]=c.r;a[i*3+1]=c.g;a[i*3+2]=c.b;}
    g.setAttribute('color',new THREE.BufferAttribute(a,3));this.parts.push(g);return this;
  }
  box(w:number,h:number,d:number,c:string,x=0,y=0,z=0,rx=0,ry=0,rz=0):this{return this.add(new THREE.BoxGeometry(w,h,d),c,x,y,z,rx,ry,rz);}
  round(w:number,h:number,d:number,r:number,c:string,x=0,y=0,z=0,rx=0,ry=0,rz=0):this{return this.add(new RoundedBoxGeometry(w,h,d,1,r),c,x,y,z,rx,ry,rz);}
  sphere(r:number,c:string,x=0,y=0,z=0,sx=1,sy=1,sz=1):this {const g=new THREE.SphereGeometry(r,10,7);g.scale(sx,sy,sz);return this.add(g,c,x,y,z);}
  cylinder(top:number,bottom:number,h:number,c:string,x=0,y=0,z=0,rx=0,ry=0,rz=0,segments=10):this {return this.add(new THREE.CylinderGeometry(top,bottom,h,segments),c,x,y,z,rx,ry,rz);}
  torus(r:number,t:number,c:string,x=0,y=0,z=0,rx=0,ry=0,rz=0):this {return this.add(new THREE.TorusGeometry(r,t,5,12),c,x,y,z,rx,ry,rz);}
  mesh():THREE.Mesh {const g=this.geometry();const mesh=new THREE.Mesh(g,worldMaterial);mesh.castShadow=true;mesh.receiveShadow=true;return mesh;}
  geometry():THREE.BufferGeometry {const merged=mergeGeometries(this.parts,false);if(!merged)throw Error('Cannot combine art geometry');this.parts.forEach(g=>g.dispose());this.parts=[];merged.computeBoundingSphere();return merged;}
}

export function disposeTree(root:THREE.Object3D):void {const geometries=new Set<THREE.BufferGeometry>();root.traverse(o=>{if(o instanceof THREE.Mesh)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());}
export function hash(seed:number):number {let x=seed|0;x=Math.imul(x^(x>>>16),0x45d9f3b);x=Math.imul(x^(x>>>16),0x45d9f3b);return((x^(x>>>16))>>>0)/4294967296;}
