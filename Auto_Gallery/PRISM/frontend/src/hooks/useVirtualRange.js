import {useEffect,useMemo,useRef,useState} from 'react';

// Lightweight window virtualization for PRISM's fixed-scroll .main container.
// It listens to the actual scrolling element instead of the grid itself.
export function useVirtualRange(count,{itemHeight=230,overscan=6,enabled=true}={}){
 const ref=useRef(null);
 const [state,setState]=useState({scrollTop:0,height:window.innerHeight});
 useEffect(()=>{
   const scroller=ref.current?.closest('.main') || document.querySelector('.main');
   if(!scroller)return;
   let raf=0;
   const update=()=>{
     cancelAnimationFrame(raf);
     raf=requestAnimationFrame(()=>setState({scrollTop:scroller.scrollTop,height:scroller.clientHeight||window.innerHeight}));
   };
   update();
   scroller.addEventListener('scroll',update,{passive:true});
   const ro=new ResizeObserver(update);
   ro.observe(scroller);
   return()=>{cancelAnimationFrame(raf);scroller.removeEventListener('scroll',update);ro.disconnect()};
 },[]);
 const range=useMemo(()=>{
   if(!enabled)return {start:0,end:count,top:0,bottom:0};
   const start=Math.max(0,Math.floor(state.scrollTop/itemHeight)-overscan);
   const end=Math.min(count,Math.ceil((state.scrollTop+state.height)/itemHeight)+overscan);
   return {start,end,top:start*itemHeight,bottom:Math.max(0,(count-end)*itemHeight)};
 },[count,itemHeight,overscan,enabled,state]);
 return {ref,...range};
}
