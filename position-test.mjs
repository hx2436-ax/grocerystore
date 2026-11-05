import assert from 'node:assert/strict';
import {relations,advance} from './position-rules.mjs';
assert(relations([1,4,2],[1,0,2]).includes('Above'));
assert(relations([1,0,2],[1,4,2]).includes('Below'));
assert(relations([1,0,2],[2,0,2]).includes('Next to'));
assert(!relations([1,4,2],[1,0,2]).includes('Next to'));
assert.deepEqual(advance([0,0,0],[0,4,6],100),[0,4,6]);
const next=advance([0,0,0],[0,4,6],.65);assert(Math.abs(Math.hypot(...next)-.65)<1e-10);
console.log('Position relations and 3D stair movement passed');
