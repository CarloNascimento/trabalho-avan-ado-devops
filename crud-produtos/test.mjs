import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
test('CRUD, validação e persistência SQLite',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'estoque-'));let child;
 async function start(){child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:'3099',DATA_DIR:dir},stdio:['ignore','pipe','pipe']});await new Promise((resolve,reject)=>{child.stdout.once('data',resolve);child.once('error',reject);child.once('exit',code=>reject(Error('Servidor encerrou '+code)));});}
 async function stop(){const p=new Promise(r=>child.once('exit',r));child.kill();await p;}
 async function request(path='',method='GET',data){return fetch('http://localhost:3099/api/produtos'+path,{method,headers:{'Content-Type':'application/json'},body:data===undefined?undefined:JSON.stringify(data)});}
 try{await start();assert.equal((await fetch('http://localhost:3099/')).status,200);
 assert.equal((await request('','POST',{nome:'',categoria:'',preco:-1,quantidade:0})).status,400);
 const r=await request('','POST',{nome:'Produto teste',categoria:'Teste',preco:12.35,quantidade:4});assert.equal(r.status,201);const {id}=await r.json();
 let list=await(await request()).json();assert.equal(list.length,1);assert.equal(list[0].preco,12.35);
 assert.equal((await request('/'+id,'PUT',{nome:'Atualizado',categoria:'Teste',preco:20,quantidade:2})).status,200);
 await stop();await start();list=await(await request()).json();assert.equal(list[0].nome,'Atualizado');assert.equal(list[0].quantidade,2);
 assert.equal((await request('/'+id,'DELETE')).status,200);assert.equal((await(await request()).json()).length,0);assert.equal((await request('/'+id,'DELETE')).status,404);
 }finally{if(child&&child.exitCode===null)await stop();rmSync(dir,{recursive:true,force:true});}
});
