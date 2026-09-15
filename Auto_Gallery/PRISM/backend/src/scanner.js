import path from 'node:path';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const HERE=path.dirname(fileURLToPath(import.meta.url));
export const DATA_DIR=path.resolve(HERE,'..','..','data');
const IMG_EXTS=['.jpg','.jpeg','.png','.webp','.gif','.bmp','.avif'];
const VID_EXTS=['.mp4','.webm','.mov','.mkv','.avi','.m4v'];
export async function loadJson(name,fallback){try{return JSON.parse(await fs.readFile(path.join(DATA_DIR,name),'utf8'));}catch{return fallback;}}
let writeQueue = Promise.resolve();
export function saveJson(name,data){
  const job = writeQueue.then(async () => {
    await fs.mkdir(DATA_DIR,{recursive:true});
    const target = path.join(DATA_DIR,name);
    const tmp = `${target}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data,null,2)+'\n','utf8');
    await fs.rename(tmp, target);
  });
  writeQueue = job.catch(() => {});
  return job;
}
async function walk(dir,base,exts){let out=[];let entries=[];try{entries=await fs.readdir(dir,{withFileTypes:true});}catch{return out;}for(const e of entries){if(e.name.startsWith('.'))continue;const abs=path.join(dir,e.name);if(e.isDirectory())out=out.concat(await walk(abs,base,exts));else if(exts.includes(path.extname(e.name).toLowerCase())){const rel=path.relative(base,abs).split(path.sep).join('/');const st=await fs.stat(abs);out.push({rel,size:st.size,modifiedAt:st.mtimeMs});}}return out;}
export async function scanMedia(){const cfg=await loadJson('config.json',{});const imgs=await walk(path.join(DATA_DIR,'images'),path.join(DATA_DIR,'images'),IMG_EXTS);const vids=await walk(path.join(DATA_DIR,'videos'),path.join(DATA_DIR,'videos'),VID_EXTS);imgs.sort((a,b)=>a.rel.localeCompare(b.rel,undefined,{numeric:true}));vids.sort((a,b)=>a.rel.localeCompare(b.rel,undefined,{numeric:true}));const images=imgs.map((x,i)=>({id:`img_${i+1}_${path.extname(x.rel).slice(1)}`,type:'image',index:i,name:path.basename(x.rel),src:'/media/images/'+x.rel.split('/').map(encodeURIComponent).join('/'),size:x.size,addedAt:x.modifiedAt}));const videos=vids.map((x,i)=>({id:`vid_${i+1}_${path.extname(x.rel).slice(1)}`,type:'video',index:i,name:path.basename(x.rel),src:'/media/videos/'+x.rel.split('/').map(encodeURIComponent).join('/'),size:x.size,addedAt:x.modifiedAt}));const media={generatedAt:new Date().toISOString(),images,videos};await saveJson('media.json',media);return media;}
if(process.argv[1]===fileURLToPath(import.meta.url))scanMedia().then(x=>console.log(`Scanned ${x.images.length} images, ${x.videos.length} videos`));
