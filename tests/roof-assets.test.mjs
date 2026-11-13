import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Vector3 } from 'three';
import { registry } from '../architect/registry.mjs';
import { roofGeometry } from '../src/scripts/roof-assets.js';

// Put the end grain in a separate horizontal tile for texture-face assertions.
function sample(id,states) {
  const spec = registry['minecraft:'+id];
  return roofGeometry(spec,states,(path,u,v) => [u/16 + Number(path.endsWith('_top.png'))*2,v/16]);
}

function checkSurface(geometry, occupied) {
  const p = geometry.getAttribute('position'), n = geometry.getAttribute('normal');
  for (let i=0; i<geometry.index.count; i+=3) {
    const indices = Array.from(geometry.index.array.slice(i,i+3));
    const [a,b,c] = indices.map(i => new Vector3().fromBufferAttribute(p,i));
    const center = a.clone().add(b).add(c).divideScalar(3);
    const normal = new Vector3().fromBufferAttribute(n,indices[0]);
    assert.ok(b.sub(a).cross(c.sub(a)).dot(normal) > 0, 'front faces point outward');
    assert.ok(occupied(...center.clone().addScaledVector(normal,-.001).toArray()), 'solid behind triangle');
    assert.ok(!occupied(...center.clone().addScaledVector(normal,.001).toArray()), 'air in front of triangle');
  }
}

test('Escadas e cantos orientam o patamar alto e eliminam faces sobrepostas', () => {
  const highDirections = [[1,0],[-1,0],[0,1],[0,-1]];
  for (const [dir,[dx,dz]] of highDirections.entries()) for (const inverted of [false,true]) {
    for (const corner of registry['minecraft:mangrove_stairs'].states['minecraft:corner']) {
      const g = sample('mangrove_stairs',{weirdo_direction:dir,upside_down_bit:inverted,'minecraft:corner':corner});
      checkSurface(g,(x,y,z) => {
        if ([x,y,z].some(n=>n<0||n>1)) return false;
        if ((inverted ? 1-y : y) < .5) return true;
        const high = (x-.5)*dx + (z-.5)*dz > 0;
        const left = (x-.5)*dz - (z-.5)*dx > 0;
        return ({none:high,inner_left:high||left,inner_right:high||!left,outer_left:high&&left,outer_right:high&&!left})[corner];
      });
      g.dispose();
    }
  }
});

test('Alçapões ocupam a parede de dobradiça e mantêm três pixels de espessura', () => {
  for (const side of [0,1,2,3]) for (const open of [true,false]) for (const upper of [true,false]) {
    const g = sample('bamboo_trapdoor',{direction:side,open_bit:open,upside_down_bit:upper});
    checkSurface(g,(x,y,z) => {
      if ([x,y,z].some(n=>n<0||n>1)) return false;
      const depth = open ? [x,1-x,z,1-z][side] : upper ? 1-y : y;
      return depth < 3/16;
    });
    g.dispose();
  }
});

test('Eixo do tronco transporta os topos e a fibra com a geometria', () => {
  for (const [axisIndex,axis] of ['x','y','z'].entries()) {
    const g = sample('stripped_mangrove_log',{pillar_axis:axis});
    const normals = g.getAttribute('normal'), uv = g.getAttribute('uv');
    for (let i=0; i<normals.count; i++) {
      const direction = new Vector3().fromBufferAttribute(normals,i);
      assert.equal(uv.getX(i) >= 2,Math.abs(direction.getComponent(axisIndex)) === 1);
    }
    g.dispose();
  }
});

test('Lajes recortam metade do sprite na lateral sem esticar os pixels', () => {
  for (const half of ['top','bottom']) {
    const g = sample('deepslate_brick_slab',{'minecraft:vertical_half':half});
    const uv = g.getAttribute('uv'), n = g.getAttribute('normal');
    const v = Array.from({length:n.count},(_,i)=>i).filter(i=>n.getY(i)===0).map(i=>uv.getY(i));
    assert.deepEqual([Math.min(...v),Math.max(...v)],half==='top'?[.5,1]:[0,.5]);
    g.dispose();
  }
});
