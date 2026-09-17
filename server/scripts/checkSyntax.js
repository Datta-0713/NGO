'use strict';
const fs=require('fs'); const path=require('path'); const {execFileSync}=require('child_process');
const roots=[path.join(__dirname,'..','src'),path.join(__dirname,'..','scripts')]; const failures=[];
function walk(dir){for(const n of fs.readdirSync(dir)){const p=path.join(dir,n),s=fs.statSync(p);if(s.isDirectory()&&n!=='node_modules')walk(p);else if(s.isFile()&&p.endsWith('.js')){try{execFileSync(process.execPath,['--check',p],{stdio:'ignore'})}catch{failures.push(p)}}}}
roots.filter(fs.existsSync).forEach(walk);
if(failures.length){console.error('Syntax errors:\n'+failures.join('\n'));process.exit(1)}
console.log('All server JavaScript files passed syntax checks.');
