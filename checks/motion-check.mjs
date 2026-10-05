import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';

const html = readFileSync('dist/index.html', 'utf8');
const js = readFileSync('dist/assets/motion.js', 'utf8');
const css = readFileSync('dist/assets/motion.css', 'utf8');
const original = execFileSync('git', ['show', 'HEAD:dist/index.html'], {encoding:'utf8'});
const withoutMotion = value => value.replace('<link rel="stylesheet" href="./assets/motion.css"/>\n<script src="./assets/motion.js" defer></script>\n','');
assert.equal(withoutMotion(html),withoutMotion(original),'Copy, URLs, semantics and existing functionality are unchanged');
assert.match(css, /prefers-reduced-motion:reduce/);
assert.match(css, /opacity: 1 !important; translate: none !important/);
assert.doesNotMatch(css, /display:\s*none/);
assert.match(js, /threshold: \.12/);
assert.match(js, /observer\?\.disconnect/);
let observerCreated = 0;
const context = {
  matchMedia:()=>({matches:true,addEventListener(){}}),
  document:{querySelectorAll:()=>[],querySelector:()=>null,addEventListener(){}},
  window:{addEventListener(){},IntersectionObserver:function(){observerCreated++;}},
  IntersectionObserver:function(){observerCreated++;},
  scrollY:0, innerHeight:900, setTimeout,
};
vm.runInNewContext(js,context);
assert.equal(observerCreated,0,'Reduced motion creates no reveal observer');
// Normal motion: the observer's root reaches far above the viewport, so content skipped by an
// anchor jump, restored scroll position or fast fling is revealed instead of staying hidden.
let options;
const normal = {
  ...context,
  matchMedia:()=>({matches:false,addEventListener(){}}),
  IntersectionObserver:function(_, value){options=value;this.observe=()=>{};this.disconnect=()=>{};},
};
normal.window = {addEventListener(){},IntersectionObserver:normal.IntersectionObserver};
vm.runInNewContext(js,normal);
assert.ok(parseInt(options?.rootMargin) >= 10000,'Reveal observer covers content above the viewport');
console.log('PASS: source invariants, reduced-motion fallback, no display hiding, JS syntax and motion safety checks.');
