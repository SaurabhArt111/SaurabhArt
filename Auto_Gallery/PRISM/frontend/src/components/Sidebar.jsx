import {FiClock,FiHeart,FiHome,FiImage,FiSettings,FiStar,FiTrendingUp,FiVideo} from 'react-icons/fi';
export default function Sidebar({page,setPage,counts,open}){
  const item=(p,ico,label,count)=><button className={'nav-item '+(page===p?'active':'')} onClick={()=>setPage(p)}><span className="nav-ico">{ico}</span><span style={{flex:1}}>{label}</span>{count!==undefined&&<span className="nav-count">{count}</span>}</button>;
  return <nav className={'sidebar '+(open?'open':'')}>
    <div className="nav-section">Browse</div>
    {item('home',<FiHome/>,'Home')}{item('trending',<FiTrendingUp/>,'Trending')}{item('images',<FiImage/>,'Images',counts.images)}{item('videos',<FiVideo/>,'Videos',counts.videos)}
    <div className="nav-div"/><div className="nav-section">Library</div>
    {item('watch-later',<FiClock/>,'Watch Later',counts.later)}{item('favorites',<FiStar/>,'Favorites',counts.favorites)}{item('liked',<FiHeart/>,'Liked',counts.liked)}{item('history',<FiClock/>,'History',counts.history)}
    <div className="nav-div"/><div className="nav-section">System</div>{item('settings',<FiSettings/>,'Settings')}
  </nav>
}
