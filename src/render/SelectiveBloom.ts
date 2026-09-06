import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

/** High quality only. Black occluders retain depth, so pickups behind trains cannot glow through them. */
export class SelectiveBloom {
  private readonly extraction:EffectComposer;
  private readonly composite:EffectComposer;
  private readonly bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.10,.2,.10);
  private readonly output=new OutputPass();
  private readonly merge:ShaderPass;
  private readonly dark=new THREE.MeshBasicMaterial({color:0x000000,fog:false});
  private readonly background=new THREE.Color(0x000000);
  private readonly replaced=new Map<THREE.Mesh,THREE.Material|THREE.Material[]>();
  private readonly size=new THREE.Vector2();

  constructor(private readonly renderer:THREE.WebGLRenderer,private readonly scene:THREE.Scene,private readonly camera:THREE.Camera){
    this.extraction=new EffectComposer(renderer);
    this.extraction.setPixelRatio(1);
    this.extraction.renderToScreen=false;
    this.extraction.addPass(new RenderPass(scene,camera));
    this.extraction.addPass(this.bloom);
    this.merge=new ShaderPass({
      uniforms:{tDiffuse:{value:null},bloomTexture:{value:this.bloom.renderTargetsHorizontal[0]!.texture}},
      vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
      // Use only blurred light, not the extraction composer (which also contains the source image).
      fragmentShader:'uniform sampler2D tDiffuse; uniform sampler2D bloomTexture; varying vec2 vUv; void main(){vec4 base=texture2D(tDiffuse,vUv);gl_FragColor=vec4(base.rgb+texture2D(bloomTexture,vUv).rgb,base.a);}'
    });
    this.composite=new EffectComposer(renderer);
    this.composite.renderTarget1.samples=4;this.composite.renderTarget2.samples=4;
    this.composite.setPixelRatio(1);
    this.composite.addPass(new RenderPass(scene,camera));
    this.composite.addPass(this.merge);
    this.composite.addPass(this.output);
    this.resize();
  }

  resize():void{
    this.renderer.getDrawingBufferSize(this.size);
    this.composite.setSize(this.size.x,this.size.y);
    // Half drawing-buffer resolution, capped at 960 on either axis, including ultrawide screens.
    const scale=Math.min(.5,960/Math.max(this.size.x,this.size.y));
    this.extraction.setSize(Math.max(1,Math.round(this.size.x*scale)),Math.max(1,Math.round(this.size.y*scale)));
  }

  render():void{
    const background=this.scene.background,shadows=this.renderer.shadowMap.enabled,autoReset=this.renderer.info.autoReset;
    this.renderer.info.autoReset=false;this.renderer.info.reset();
    try{try{
      this.scene.background=this.background;
      this.scene.traverseVisible(object=>{
        if(object instanceof THREE.Mesh&&!object.userData.selectiveBloom){
          this.replaced.set(object,object.material);object.material=this.dark;
        }
      });
      this.renderer.shadowMap.enabled=false;
      this.extraction.render();
    }finally{
      this.replaced.forEach((material,mesh)=>{mesh.material=material;});this.replaced.clear();
      this.scene.background=background;this.renderer.shadowMap.enabled=shadows;
    }
    this.composite.render();}finally{this.renderer.info.autoReset=autoReset;}
  }

  dispose():void{
    this.extraction.dispose();this.composite.dispose();this.bloom.dispose();this.merge.dispose();this.output.dispose();this.dark.dispose();
  }
}
