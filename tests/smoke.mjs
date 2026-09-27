import assert from 'node:assert/strict';
const base=process.env.SMOKE_URL || 'http://127.0.0.1:3002';
const routes=['/','/contact','/online-booth','/experiences','/about','/privacy'];
for(const route of routes) {
 const response=await fetch(base+route,{redirect:'manual'});
 assert.equal(response.status,200,route);
 const html=await response.text();
 assert.match(html,/<h1[ >]/,route);
}
const home=await (await fetch(base)).text();
assert.ok(home.includes('A tale of Pixü Studios'));
assert.ok(home.includes('Send enquiry'));
const booth=await (await fetch(base+'/online-booth')).text();
assert.ok(booth.includes('Start the booth'));
assert.ok(booth.includes('pixu-modern'));
assert.equal((await fetch(base+'/missing-page')).status,404);
for(const path of ['/creative-services','/photobooth','/photobooth/packages','/reviews','/store']) assert.equal((await fetch(base+path,{redirect:'manual'})).status,308,path);
console.log('Passed: six pages, five legacy redirects, original homepage, enquiry form, new Online Booth and 404.');
