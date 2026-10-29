import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync } from 'node:fs';
const dir = process.env.DATA_DIR || './data';
mkdirSync(dir, {recursive:true});
const db = new DatabaseSync(`${dir}/estoque.sqlite`);
db.exec('PRAGMA journal_mode=WAL; CREATE TABLE IF NOT EXISTS produtos (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT NOT NULL, categoria TEXT NOT NULL, preco INTEGER NOT NULL, quantidade INTEGER NOT NULL)');
const html=readFileSync(new URL('./public/index.html',import.meta.url));
function valid(p) {return p && typeof p.nome==='string' && p.nome.trim().length>0 && p.nome.length<=120 && typeof p.categoria==='string' && p.categoria.length<=80 && typeof p.preco==='number' && Number.isFinite(p.preco) && p.preco>=0 && p.preco<=100000000 && Number.isSafeInteger(p.quantidade) && p.quantidade>=0 && p.quantidade<=100000000;}
export const server=http.createServer(async(req,res)=>{
 const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try {
 const url=new URL(req.url,'http://localhost');
 if(req.method==='GET' && url.pathname==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(html);}
 if(req.method==='GET' && url.pathname==='/health')return send(200,{ok:true});
 if(req.method==='GET' && url.pathname==='/api/produtos')return send(200,db.prepare('SELECT id,nome,categoria,preco/100.0 AS preco,quantidade FROM produtos ORDER BY id DESC').all());
 const match=url.pathname.match(/^\/api\/produtos\/(\d+)$/);
 if(!['/api/produtos'].includes(url.pathname)&&!match)return send(404,{erro:'Rota não encontrada.'});
 let p;
 if(['POST','PUT'].includes(req.method)){
 let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16000)return send(413,{erro:'Dados muito grandes.'});}
 try{p=JSON.parse(body);}catch{return send(400,{erro:'JSON inválido.'});}
 if(!valid(p))return send(400,{erro:'Confira o nome, categoria, preço e quantidade. Valores devem ser positivos ou zero; quantidade deve ser inteira.'});
 }
 if(req.method==='POST' && !match){const result=db.prepare('INSERT INTO produtos(nome,categoria,preco,quantidade) VALUES(?,?,?,?)').run(p.nome.trim(),p.categoria.trim(),Math.round(p.preco*100),p.quantidade);return send(201,{id:Number(result.lastInsertRowid)});}
 if(match&&req.method==='PUT'){const r=db.prepare('UPDATE produtos SET nome=?,categoria=?,preco=?,quantidade=? WHERE id=?').run(p.nome.trim(),p.categoria.trim(),Math.round(p.preco*100),p.quantidade,match[1]);return send(r.changes?200:404,r.changes?{ok:true}:{erro:'Produto não encontrado.'});}
 if(match&&req.method==='DELETE'){const r=db.prepare('DELETE FROM produtos WHERE id=?').run(match[1]);return send(r.changes?200:404,r.changes?{ok:true}:{erro:'Produto não encontrado.'});}
 send(405,{erro:'Método não permitido.'});
 }catch(e){console.error(e);send(500,{erro:'Não foi possível concluir a operação.'});}
});
server.listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Estoque disponível na porta '+(process.env.PORT||3000)));
