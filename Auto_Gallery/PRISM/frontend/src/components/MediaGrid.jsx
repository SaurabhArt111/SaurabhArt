import {useEffect,useMemo,useRef,useState} from 'react';
import {FiClock,FiHeart,FiImage,FiPlay,FiStar,FiVideo} from 'react-icons/fi';

function useColumnCount(view){
  const ref=useRef(null);
  const [width,setWidth]=useState(0);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const update=()=>setWidth(el.clientWidth||0);
    update();
    const ro=new ResizeObserver(update);
    ro.observe(el);
    return()=>ro.disconnect();
  },[]);
  const min=view==='lg'?300:220;
  const gap=view==='lg'?14:12;
  return {ref,count:Math.max(1,Math.min(7,Math.floor((width+gap)/(min+gap)))),width};
}

function distribute(items,count,view,containerWidth){
  const columns=Array.from({length:count},()=>[]);
  const heights=Array(count).fill(0);
  const gap=view==='lg'?14:12;
  const estimatedWidth=Math.max(160,(containerWidth-(count-1)*gap)/count);
  items.forEach((item,index)=>{
    let target=0;
    for(let i=1;i<count;i++) if(heights[i]<heights[target]) target=i;
    const ratio=item.width&&item.height?item.height/item.width:1;
    const estimated=(ratio*estimatedWidth)+56+gap;
    columns[target].push(item);
    heights[target]+=estimated;
  });
  return columns;
}

export default function MediaGrid({items,kind,view='grid',onOpen,onAction,user,empty}){
  const isImage=kind==='image';
  if(!items.length)return <div className="empty"><div className="empty-ico">{isImage?<FiImage/>:<FiPlay/>}</div><div className="empty-title">{empty?.title||'Nothing here'}</div><div className="empty-sub">{empty?.sub||''}</div></div>;
  if(!isImage){
    if(view==='list')return <div className="vid-grid lst">{items.map(item=><VideoCard key={item.id} item={item} user={user} onOpen={onOpen} onAction={onAction}/>)}</div>;
    return <VideoMasonry items={items} view={view} user={user} onOpen={onOpen} onAction={onAction}/>;
  }
  if(view==='list')return <div className="img-grid lst">{items.map(item=><ImageCard key={item.id} item={item} user={user} onOpen={onOpen} onAction={onAction}/>)}</div>;
  return <Masonry items={items} view={view} user={user} onOpen={onOpen} onAction={onAction}/>;
}

function Masonry({items,view,user,onOpen,onAction}){
  const {ref,count,width}=useColumnCount(view);
  const columns=useMemo(()=>distribute(items,count,view,width),[items,count,view,width]);
  return <div ref={ref} className={'img-grid masonry '+(view==='lg'?'lg':'')}>
    {columns.map((column,i)=><div className="img-col" key={i}>{column.map(item=><ImageCard key={item.id} item={item} user={user} onOpen={onOpen} onAction={onAction}/>)}</div>)}
  </div>;
}

function VideoMasonry({items,view,user,onOpen,onAction}){
  const {ref,count,width}=useColumnCount(view);
  const columns=useMemo(()=>distribute(items,count,view,width),[items,count,view,width]);
  return <div ref={ref} className={'vid-grid masonry '+(view==='lg'?'lg':'')}>
    {columns.map((column,i)=><div className="vid-col" key={i}>{column.map(item=><VideoCard key={item.id} item={item} user={user} onOpen={onOpen} onAction={onAction}/>)}</div>)}
  </div>;
}

function ImageCard({item,user,onOpen,onAction}){
  const fav=user.favorites.includes(item.id), liked=user.liked.includes(item.id);
  const meta=[item.width&&item.height?`${item.width} × ${item.height}`:'',item.size?item.size:''].filter(Boolean).join(' · ');
  return <article className="img-card" onClick={()=>onOpen(item)} tabIndex={0} role="button" aria-label={`Open ${item.name}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onOpen(item)}}>
    <div className="img-media">
      <img src={item.src} alt={item.name} loading="lazy" decoding="async" fetchPriority="low" onError={e=>{e.currentTarget.style.opacity=.25}}/>
      <div className="img-vignette"/>
      <button aria-label="Favorite" title="Favorite" className={'quick-fav '+(fav?'on':'')} onClick={e=>{e.stopPropagation();onAction('favorites',item.id)}}><FiStar/></button>
      <div className="img-open"><span><FiImage/> Open</span></div>
    </div>
    <div className="img-card-info"><div className="img-name" title={item.name}>{item.name}</div><div className="img-meta">{meta||'IMAGE'}</div></div>
    <div className="img-overlay"><div className="img-acts">
      <button title="Like" aria-label="Like" className={'img-act '+(liked?'on':'')} onClick={e=>{e.stopPropagation();onAction('liked',item.id)}}><FiHeart/></button>
      <button title="Favorite" aria-label="Favorite" className={'img-act '+(fav?'on':'')} onClick={e=>{e.stopPropagation();onAction('favorites',item.id)}}><FiStar/></button>
    </div></div>
    <div className="img-lst-info"><div className="img-lst-name">{item.name}</div><div className="img-lst-meta">IMAGE · {meta||new Date(item.addedAt).toLocaleDateString()}</div></div>
  </article>;
}

function VideoCard({item,user,onOpen,onAction}){
  const fav=user.favorites.includes(item.id),liked=user.liked.includes(item.id),later=user.watchLater.includes(item.id),prog=user.videoProgress[item.id]||0;
  return <article className="vid-card" onClick={()=>onOpen(item)} tabIndex={0} role="button" aria-label={`Open ${item.name}`} onKeyDown={e=>{if(e.key==='Enter'||e.key===' ')onOpen(item)}}>
    <div className="vid-thumb">
      <div className="vid-poster"><FiVideo/><span>VIDEO</span></div>
      <div className="vid-shade"/>
      <button aria-label="Favorite" title="Favorite" className={'quick-fav '+(fav?'on':'')} onClick={e=>{e.stopPropagation();onAction('favorites',item.id)}}><FiStar/></button>
      <div className="vid-play"><FiPlay fill="currentColor"/></div>
      {prog>0&&<div className="vid-prog"><div className="vid-prog-fill" style={{width:(prog*100)+'%'}}/></div>}
    </div>
    <div className="vid-body">
      <div className="vid-title" title={item.name}>{item.name}</div>
      <div className="vid-meta">VIDEO{item.size?` · ${item.size}`:''}</div>
      <div className="vid-stars">{[1,2,3,4,5].map(n=><button type="button" key={n} title={`Rate ${n} stars`} aria-label={`Rate ${n} stars`} className={'vid-star '+(n<=(user.ratings[item.id]||0)?'on':'')} onClick={e=>{e.stopPropagation();onAction('rating',item.id,n)}}><FiStar fill="currentColor"/></button>)}</div>
      <div className="vid-actions">
        <button className={'vid-act '+(liked?'on-like':'')} onClick={e=>{e.stopPropagation();onAction('liked',item.id)}}><FiHeart/> Like</button>
        <button className={'vid-act '+(fav?'on-fav':'')} onClick={e=>{e.stopPropagation();onAction('favorites',item.id)} }><FiStar/> Fav</button>
        <button className={'vid-act '+(later?'on-later':'')} onClick={e=>{e.stopPropagation();onAction('watchLater',item.id)} }><FiClock/> Later</button>
      </div>
    </div>
  </article>;
}
