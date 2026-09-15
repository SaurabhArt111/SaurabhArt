import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import mime from 'mime-types';
import crypto from 'node:crypto';
import { scanMedia, loadJson, saveJson, DATA_DIR } from './scanner.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const app = express();
const PORT = Number(process.env.PORT || 5000);
const HOST = process.env.HOST || '0.0.0.0';
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const json = name => path.join(DATA_DIR, name);
const defaultUser = () => ({ id:'default', watchLater:[], favorites:[], liked:[], history:[], ratings:{}, videoProgress:{}, imageViewed:[] });
async function getUser(){ const users=await loadJson('users.json',{}); return users.default || defaultUser(); }
async function setUser(user){ const users=await loadJson('users.json',{}); users.default=user; await saveJson('users.json',users); }
async function activity(type,payload={}){ const a=await loadJson('activity.json',[]); a.push({id:crypto.randomUUID(),type,payload,at:new Date().toISOString()}); if(a.length>1000)a.splice(0,a.length-1000); await saveJson('activity.json',a); }

app.get('/api/health',(_,res)=>res.json({ok:true,name:'PRISM',stack:'JERN',node:process.version}));
app.get('/api/media',async(_,res)=>{ try { const media=await scanMedia(); res.json(media); } catch(e){ res.status(500).json({error:e.message}); }});
app.get('/api/config',async(_,res)=>res.json(await loadJson('config.json',{})));
app.put('/api/config',async(req,res)=>{ try { await saveJson('config.json',req.body||{}); const media=await scanMedia(); res.json({ok:true,config:req.body,media}); } catch(e){res.status(500).json({error:e.message});} });
app.post('/api/scan',async(_,res)=>{ try { res.json(await scanMedia()); } catch(e){res.status(500).json({error:e.message});} });
app.get('/api/user',async(_,res)=>res.json(await getUser()));
app.put('/api/user',async(req,res)=>{ try { const user={...defaultUser(),...(req.body||{}),id:'default'}; await setUser(user); res.json(user); } catch(e){res.status(500).json({error:e.message});} });
app.post('/api/user/action',async(req,res)=>{ try { const {action,id,value}=req.body||{}; const u=await getUser(); const arrays={liked:'liked',favorites:'favorites',watchLater:'watchLater'}; if(arrays[action]){ const k=arrays[action], i=u[k].indexOf(id); if(value===true && i<0)u[k].push(id); else if(value===false && i>=0)u[k].splice(i,1); else if(value===undefined){ if(i>=0)u[k].splice(i,1); else u[k].push(id); } } else if(action==='rating'){u.ratings[id]=Number(value)||0;} else if(action==='progress'){
  const next=Math.max(0,Math.min(1,Number(value)||0));
  const prev=Number(u.videoProgress[id]||0);
  // Ignore insignificant progress writes; the client already debounces these.
  if(Math.abs(next-prev) < 0.005 && next < 1) return res.json(u);
  u.videoProgress[id]=next;
} else if(action==='history'){u.history=u.history.filter(x=>x!==id);u.history.push(id);u.history=u.history.slice(-500);} else if(action==='imageViewed'){if(!u.imageViewed.includes(id))u.imageViewed.push(id);} else return res.status(400).json({error:'Unknown action'}); await setUser(u); if(action!=='progress') await activity(action,{id,value}); res.json(u); } catch(e){res.status(500).json({error:e.message});} });
app.get('/api/export',async(_,res)=>res.json({version:1,exportedAt:new Date().toISOString(),userdata:await getUser()}));
app.post('/api/import',async(req,res)=>{ try { const d=req.body||{}; if(!d.userdata) return res.status(400).json({error:'Invalid export format'}); await setUser({...defaultUser(),...d.userdata,id:'default'}); res.json(await getUser()); } catch(e){res.status(500).json({error:e.message});} });
app.post('/api/reset',async(_,res)=>{ const u=defaultUser(); await setUser(u); await activity('reset'); res.json(u); });

const IMAGE_DIR = path.join(DATA_DIR, 'images');
const VIDEO_DIR = path.join(DATA_DIR, 'videos');

// Images: normal static delivery with long-lived caching.
app.use('/media/images', express.static(IMAGE_DIR, {
  fallthrough: true,
  etag: true,
  maxAge: '5m',
  immutable: false,
  acceptRanges: true
}));

// Videos: explicit byte-range delivery. This is more reliable for seeking,
// large files and browser media players than treating videos like ordinary files.
app.get('/media/videos/{*filePath}', async (req, res, next) => {
  try {
    const raw = Array.isArray(req.params.filePath) ? req.params.filePath.join('/') : req.params.filePath;
    if (!raw) return next();
    const relative = decodeURIComponent(raw);
    const root = path.resolve(VIDEO_DIR);
    const file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(root + path.sep)) return res.status(400).end();

    const stat = await fs.stat(file);
    if (!stat.isFile()) return next();

    const size = stat.size;
    const type = mime.lookup(file) || 'application/octet-stream';
    const range = req.headers.range;
    res.setHeader('Content-Type', type);
    res.setHeader('Accept-Ranges', 'bytes');
    // Media is a local vault asset; do not accumulate full video files in browser cache.
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('ETag', `W/\"${stat.size}-${Math.floor(stat.mtimeMs)}\"`);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());

    if (!range) {
      res.setHeader('Content-Length', size);
      return createReadStream(file).pipe(res);
    }

    const match = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!match) {
      res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
      return;
    }
    let start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2] || 0));
    let end = match[2] ? Number(match[2]) : size - 1;
    if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start >= size || end < start) {
      res.status(416).setHeader('Content-Range', `bytes */${size}`).end();
      return;
    }
    end = Math.min(end, size - 1);
    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    res.setHeader('Content-Length', end - start + 1);
    return createReadStream(file, { start, end }).pipe(res);
  } catch (error) {
    if (error.code === 'ENOENT') return next();
    console.error('Video delivery error:', error);
    return next(error);
  }
});

const dist = path.join(ROOT, '..', 'frontend', 'dist');
app.use(express.static(dist, { etag: true, maxAge: '1h' }));
app.get('/{*splat}', async (req, res, next) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/media/')) return next();
  try {
    await fs.access(path.join(dist, 'index.html'));
    res.sendFile(path.join(dist, 'index.html'));
  } catch {
    res.status(404).send('PRISM frontend not built. Run npm run build.');
  }
});

const server = app.listen(PORT, HOST, () => console.log(`PRISM JERN backend → http://localhost:${PORT}`));
server.on('error', error => {
  console.error(`PRISM JERN could not start on port ${PORT}:`, error.message);
  process.exitCode = 1;
});
