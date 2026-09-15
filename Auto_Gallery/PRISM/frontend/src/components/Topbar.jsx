import {FiClock,FiHeart,FiImage,FiMenu,FiSearch,FiSettings,FiStar,FiVideo} from 'react-icons/fi';
export default function Topbar({page,setPage,search,setSearch,toggleSidebar,badges}){
  const tab=p=>setPage(p);
  return <header className="topbar">
    <button className="icon-btn mob-menu" onClick={toggleSidebar} aria-label="Menu"><FiMenu/></button>
    <div className="logo" onClick={()=>tab('home')}><div className="logo-mark">P</div><div className="logo-name">PRI<em>S</em>M</div></div>
    <div className="topbar-tabs">
      <button className={'tab-btn '+(page==='home'?'active':'')} onClick={()=>tab('home')}>All</button>
      <button className={'tab-btn '+(page==='images'?'active':'')} onClick={()=>tab('images')}><FiImage/> Images</button>
      <button className={'tab-btn '+(page==='videos'?'active':'')} onClick={()=>tab('videos')}><FiVideo/> Videos</button>
    </div>
    <div className="topbar-search"><FiSearch className="search-ico"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search media…"/></div>
    <div className="topbar-right">
      <button className="icon-btn" onClick={()=>tab('watch-later')} title="Watch Later"><FiClock/>{badges.later>0&&<span className="badge" style={{display:'flex'}}>{badges.later}</span>}</button>
      <button className="icon-btn" onClick={()=>tab('favorites')} title="Favorites"><FiStar/></button>
      <button className="icon-btn" onClick={()=>tab('liked')} title="Liked"><FiHeart/></button>
      <button className="icon-btn" onClick={()=>tab('settings')} title="Settings"><FiSettings/></button>
    </div>
  </header>
}
