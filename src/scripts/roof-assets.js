import * as T from 'three';
import {cabineDetailGeometry} from './cabine-details.js';
import { resourceRoot } from '../../architect/registry.mjs';
import { canonicalStairParts } from './geometry.js';
import {kitBoxes,kitFace,kitUV,orientKitPoint} from '../../architect/v2/kit-shapes.mjs';
import {navalGeometry} from './naval-assets.js';

const TILE = 16;
const unitCube = [0, 0, 0, 16, 16, 16];

function boxes(shape, states) {
  if (shape === 'stairs') return canonicalStairParts(states);
  if (shape === 'cube' || shape === 'log') return [unitCube];
  if (shape === 'slab') {
    const y = states['minecraft:vertical_half'] === 'top' ? 8 : 0;
    return [[0, y, 0, 16, y + 8, 16]];
  }
  if (shape === 'trapdoor') {
    const y = states.upside_down_bit ? 13 : 0;
    return [[0, y, 0, 16, y + 3, 16]];
  }
  const parts=kitBoxes(shape,states);
  if(parts) return parts;
  throw Error('Forma sem geometria no catálogo: ' + shape);
}

// Split at part boundaries, discarding faces inside the union. All coordinates
// and the texture crops below remain in native sixteenths until atlas mapping.
function emitSurface(parts, appendFace) {
  const cuts = [0, 1, 2].map(i => [...new Set(parts.flatMap(b => [b[i], b[i+3]]))].sort((a,b) => a-b));
  const [xs, ys, zs] = cuts;
  const filled = (i,j,k) => {
    if (![i,j,k].every((n,axis) => n >= 0 && n + 1 < cuts[axis].length)) return false;
    return parts.some(b => xs[i] >= b[0] && xs[i+1] <= b[3] && ys[j] >= b[1] &&
      ys[j+1] <= b[4] && zs[k] >= b[2] && zs[k+1] <= b[5]);
  };
  for (let i=0; i+1 < xs.length; i++) for (let j=0; j+1 < ys.length; j++) for (let k=0; k+1 < zs.length; k++) {
    if (!filled(i,j,k)) continue;
    const [a,b] = [xs[i],xs[i+1]], [c,d] = [ys[j],ys[j+1]], [e,f] = [zs[k],zs[k+1]];
    if (!filled(i+1,j,k)) appendFace(0, [[b,c,f],[b,c,e],[b,d,e],[b,d,f]]);
    if (!filled(i-1,j,k)) appendFace(1, [[a,c,e],[a,c,f],[a,d,f],[a,d,e]]);
    if (!filled(i,j+1,k)) appendFace(2, [[a,d,f],[b,d,f],[b,d,e],[a,d,e]]);
    if (!filled(i,j-1,k)) appendFace(3, [[a,c,e],[b,c,e],[b,c,f],[a,c,f]]);
    if (!filled(i,j,k+1)) appendFace(4, [[a,c,f],[b,c,f],[b,d,f],[a,d,f]]);
    if (!filled(i,j,k-1)) appendFace(5, [[b,c,e],[a,c,e],[a,d,e],[b,d,e]]);
  }
}

function orient([x,y,z], shape, s) {
  if (shape === 'log') {
    if (s.pillar_axis === 'x') return [y,16-x,z];
    if (s.pillar_axis === 'z') return [x,16-z,y];
  }
  let turns = 0;
  if (shape === 'stairs') turns = [3,1,0,2][s.weirdo_direction];
  if (shape === 'trapdoor') {
    if (s.open_bit) [y,z] = s.upside_down_bit ? [z,29-y] : [16-z,13+y];
    turns = [1,3,2,0][s.direction];
  }
  for (let n=0; n<turns; n++) [x,z] = [16-z,x];
  return orientKitPoint([x,y,z],shape,s);
}

export function roofGeometry(spec, states, mapUV) {
  const detail=cabineDetailGeometry(spec,states,mapUV);if(detail)return detail;
  const naval=navalGeometry(spec,states,mapUV);if(naval)return naval;
  const positions = [], uvs = [], indices = [];
  emitSurface(boxes(spec.shape, states), (face, corners) => {
    const tile = spec.texture[kitFace(spec.shape,face,corners[0])];
    const faceY=Math.max(...corners.map(p=>p[1]));
    const base = positions.length / 3;
    for (const corner of corners) {
      const [x,y,z] = corner;
      // Side edge of a closed trapdoor uses the upper three sprite rows.
      const h = spec.shape === 'trapdoor' && !states.upside_down_bit ? y + 13 : y;
      const [u,v] = kitUV(spec.shape,face,corner,faceY) ?? [[16-z,h],[z,h],[x,16-z],[x,z],[x,h],[16-x,h]][face];
      positions.push(...orient(corner, spec.shape, states).map(n => n/16));
      uvs.push(...mapUV(tile,u,v));
    }
    indices.push(base,base+1,base+2,base,base+2,base+3);
  });
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions,3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uvs,2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  return geometry;
}

async function loadAtlas(catalog) {
  const paths = [...new Set(Object.values(catalog).flatMap(s => Object.values(s.texture)))];
  // One replicated edge texel per side prevents sampling the adjacent sprite.
  const stride = TILE + 2, columns = Math.ceil(Math.sqrt(paths.length));
  const canvas = document.createElement('canvas');
  canvas.width = columns * stride;
  canvas.height = Math.ceil(paths.length / columns) * stride;
  const ctx = canvas.getContext('2d', {willReadFrequently:true});
  ctx.imageSmoothingEnabled = false;
  const positions = new Map(), failures = [];
  await Promise.all(paths.map(async (path, i) => {
    const x = i % columns * stride + 1, y = Math.floor(i / columns) * stride + 1;
    positions.set(path,[x,y]);
    try {
      const response = await fetch(resourceRoot + path, {signal:AbortSignal.timeout(15000)});
      if (!response.ok) throw Error(response.statusText);
      const image = await createImageBitmap(await response.blob());
      ctx.drawImage(image,0,0,image.width,image.width,x,y,TILE,TILE);
      image.close();
    } catch {
      failures.push(path);
      for (let j=0;j<2;j++) for (let k=0;k<2;k++) {
        ctx.fillStyle = (j+k)%2 ? '#272329' : '#d947a9';
        ctx.fillRect(x+k*8,y+j*8,8,8);
      }
    }
    ctx.drawImage(canvas,x,y,1,TILE,x-1,y,1,TILE);
    ctx.drawImage(canvas,x+TILE-1,y,1,TILE,x+TILE,y,1,TILE);
    ctx.drawImage(canvas,x-1,y,stride,1,x-1,y-1,stride,1);
    ctx.drawImage(canvas,x-1,y+TILE-1,stride,1,x-1,y+TILE,stride,1);
  }));
  const mapUV = (path,u,v) => {
    const [x,y] = positions.get(path);
    return [(x+u)/canvas.width,1-(y+TILE-v)/canvas.height];
  };
  const pixels = ctx.getImageData(0,0,canvas.width,canvas.height).data;
  const alphaHit = hit => {
    if (!hit.uv) return true;
    const x = Math.min(canvas.width-1, Math.max(0,Math.floor(hit.uv.x * canvas.width)));
    const y = Math.min(canvas.height-1,Math.max(0,Math.floor((1-hit.uv.y) * canvas.height)));
    return pixels[(x+y*canvas.width)*4+3] >= (hit.object?.material?.transparent ? 1 : 128);
  };
  const texture = new T.CanvasTexture(canvas);
  texture.colorSpace = T.SRGBColorSpace;
  texture.magFilter = texture.minFilter = T.NearestFilter;
  texture.generateMipmaps = false;
  // Self-emission of kit lamps is a preview. This atlas never adds block-light
  // propagation to the scene or changes the material used by 0.1 projects.
  const emitters=Object.values(catalog).filter(spec=>spec.lightEmission>0);
  let emission=null;
  if(emitters.length){
    const mask=document.createElement('canvas');
    mask.width=canvas.width;mask.height=canvas.height;
    const glow=mask.getContext('2d');
    glow.fillStyle='black';glow.fillRect(0,0,mask.width,mask.height);
    for(const spec of emitters)for(const tile of new Set(Object.values(spec.texture))){
      if(failures.includes(tile)) continue;
      const [x,y]=positions.get(tile);
      glow.globalAlpha=spec.lightEmission/15;
      glow.drawImage(canvas,x-1,y-1,stride,stride,x-1,y-1,stride,stride);
    }
    emission=new T.CanvasTexture(mask);
    emission.colorSpace=T.SRGBColorSpace;
    emission.magFilter=emission.minFilter=T.NearestFilter;
    emission.generateMipmaps=false;
  }
  return {texture, emission, mapUV, failures, alphaHit};
}

function inventoryIcons(catalog, geometry, materialFor) {
  const renderer = new T.WebGLRenderer({alpha:true, antialias:false});
  renderer.setSize(64,64);
  const scene = new T.Scene();
  scene.add(new T.AmbientLight(0xffffff,1.45));
  const light = new T.DirectionalLight(0xffffff,2.0);
  light.position.set(-2,4,3);
  scene.add(light);
  const camera = new T.OrthographicCamera(-.84,.84,.84,-.84,.1,12);
  camera.position.set(2.6,2.1,3.8);
  const icons = {};
  for (const [id, spec] of Object.entries(catalog)) {
    const states = Object.fromEntries(Object.entries(spec.states).map(([key,domain]) => [key,domain[0]]));
    if (spec.shape === 'stairs') states.weirdo_direction = 3;
    const mesh = new T.Mesh(geometry({id,states}),materialFor(id));
    camera.lookAt(mesh.geometry.boundingBox.getCenter(new T.Vector3()));
    scene.add(mesh);
    renderer.render(scene,camera);
    icons[id] = renderer.domElement.toDataURL();
    scene.remove(mesh);
  }
  renderer.dispose();
  renderer.forceContextLoss();
  return icons;
}

export async function createRoofAssets(catalog) {
  const atlas = await loadAtlas(catalog), cache = new Map();
  const material = new T.MeshLambertMaterial({map:atlas.texture, alphaTest:.5});
  if(atlas.emission){
    material.emissive.set(0xffffff);
    material.emissiveMap=atlas.emission;
    material.emissiveIntensity=.4;
  }
  function geometry({id,states}) {
    const spec = catalog[id];
    if (!spec) throw Error('Bloco ausente no catálogo: ' + id);
    const key = JSON.stringify([id,...Object.keys(spec.states).map(s => states[s])]);
    if (!cache.has(key)) cache.set(key,roofGeometry(spec,states,atlas.mapUV));
    return cache.get(key);
  }
  const glass=Object.values(catalog).some(spec=>spec.translucent)
    ? new T.MeshLambertMaterial({map:atlas.texture,transparent:true,depthWrite:false}) : null;
  const materialFor=id=>catalog[id]?.translucent?glass:material;
  const icons = inventoryIcons(catalog,geometry,materialFor);
  return {
    geometry, material, materialFor, icons, failures:atlas.failures, alphaHit:atlas.alphaHit,
    isOpaqueCube:block=>catalog[block.id]?.shape==='cube'&&!catalog[block.id].translucent,
    dispose() {
      for (const g of cache.values()) g.dispose();
      cache.clear();
      material.dispose();glass?.dispose();
      atlas.texture.dispose();
      atlas.emission?.dispose();
    },
  };
}
