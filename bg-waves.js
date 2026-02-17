import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("bg");
const hero = canvas ? canvas.closest(".hero-section") : null;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const loader = new THREE.TextureLoader();
// IMPORTANT: Ensure this path correctly points to our hero image
const tex = loader.load("img/hero.png", () => {
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
});

const uniforms = {
  uTex: { value: tex },
  uTime: { value: 0 },
  uAmp: { value: 0.014 },
  uSpeed: { value: 0.9 },
  uScale: { value: 2.6 },
  uAspect: { value: 1 },
  uCenterY: { value: 0.72 },
  uBand: { value: 0.22 },
};

const material = new THREE.ShaderMaterial({
  uniforms,
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = vec4(position.xy, 0.0, 1.0);
    }
  `,
  fragmentShader: `
    precision highp float;
    varying vec2 vUv;
    uniform sampler2D uTex;
    uniform float uTime, uAmp, uSpeed, uScale, uAspect, uCenterY, uBand;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p);
      float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
      vec2 u=f*f*(3.0-2.0*f);
      return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
    }
    float fbm(vec2 p){
      float v=0.0, a=0.5;
      for(int i=0;i<5;i++){
        v += a*noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }
    void main(){
      vec2 uv = vUv;
      vec2 p = vec2(uv.x * uAspect, uv.y);
      float t = uTime * uSpeed;
      float n1 = fbm(p * uScale + vec2(t, 0.0));
      float n2 = fbm(p * (uScale*1.6) + vec2(t*1.3, 2.0));
      float n3 = fbm(p * (uScale*3.0) + vec2(t*1.8, 5.0));
      float filament = (n3 - 0.5) * 0.35;
      float dx = (n1 - 0.5) + filament;
      float dy = (n2 - 0.5) * 0.25;
      float dist = abs(uv.y - uCenterY);
      float band = 1.0 - smoothstep(0.0, uBand, dist);
      vec2 duv = vec2(dx, dy) * uAmp * band;
      vec3 col = texture2D(uTex, uv + duv).rgb;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
});

const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
scene.add(quad);

function resize() {
  const rect = hero ? hero.getBoundingClientRect() : null;
  const w = rect && rect.width ? rect.width : window.innerWidth;
  const h = rect && rect.height ? rect.height : window.innerHeight;
  renderer.setSize(w, h, false);
  uniforms.uAspect.value = w / h;
}
window.addEventListener("resize", resize);
if (hero && "ResizeObserver" in window) {
  const observer = new ResizeObserver(resize);
  observer.observe(hero);
}
resize();

const start = performance.now();
function tick(now) {
  uniforms.uTime.value = (now - start) * 0.001;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);
