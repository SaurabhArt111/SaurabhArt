import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import { projects } from './data/projects';
import CharacterSequence from './components/CharacterSequence';
import Reveal from './components/Reveal';

function ThemeToggle({ dark, setDark }) {
  return <button className="theme-toggle" onClick={() => setDark(v => !v)} aria-label="Toggle theme">
    <span>{dark ? 'LIGHT' : 'DARK'}</span><i aria-hidden="true" />
  </button>;
}

function Nav({ dark, setDark }) {
  return <nav className="nav">
    <a className="nav-mark" href=""><img src="/icons/favicon.svg" alt="S." /></a>
    <div className="nav-links"><a href="#about">About</a><a href="#work">Work</a><a href="#skills">Skills</a><a href="#contact">Contact</a></div>
    <div className="nav-right"><ThemeToggle dark={dark} setDark={setDark} /><a className="resume" href="#contact">Resume ↗</a></div>
  </nav>;
}

function Hero() {
  useEffect(() => {
    const hero = document.querySelector('.hero');
    let raf = 0;
    const update = () => {
      const rect = hero.getBoundingClientRect();
      const range = Math.max(hero.offsetHeight - window.innerHeight, 1);
      const p = Math.min(Math.max(-rect.top / range, 0), 1);
      hero.style.setProperty('--hero-p', p.toFixed(6));
      raf = 0;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);
  return <section className="hero" id="top">
    <CharacterSequence />
    <div className="hero-vignette" />
    <div className="hero-meta"><span>PORTFOLIO / 2026</span><span className="INDIA">INDIA</span></div>
    <div className="hero-title-wrap">
      {/* <div className="hero-echo echo-one">SAURABH</div> */}
      <h1 className="hero-title" aria-label="Saurabh">SAURABH<br /><span>MAURYA</span></h1>
      <br />
      <div className="hero-sub-title"><span>ARTIST</span><b>·</b><span>DESIGNER</span><b>·</b><span>DEVELOPER</span></div>
    </div>
    <div className="hero-copy">
      <div className="roles" aria-label="Artist, Designer, Developer"><span>ARTIST</span><b>·</b><span>DESIGNER</span><b>·</b><span>DEVELOPER</span></div>
      <p>I design visuals, build interfaces, and turn ideas into working digital experiences.</p>
      <a className="scroll-cue" href="#about"><span>SCROLL</span><i>↓</i></a>
    </div>
    <div className="hero-bottom-note"><span>SCROLL-DRIVEN CHARACTER STUDY</span><span>01—04</span></div>
  </section>;
}

function SplitText({ children, accent = false }) {
  return <span className={`split-text ${accent ? 'accent' : ''}`}>{children}</span>;
}

function About() {
  return <section className="section about" id="about">
    <Reveal className="section-index"><span>01 / ABOUT</span><em>THE PERSON BEHIND THE WORK</em></Reveal>
    <div className="about-content">
      <Reveal><h2><SplitText>Somewhere</SplitText> <SplitText>between</SplitText> <SplitText accent>pixels</SplitText> <SplitText>and</SplitText> <SplitText accent>code.</SplitText></h2></Reveal>
      <div className="about-grid">
        <Reveal delay={80}><p className="lead">I'm Saurabh Maurya — an artist, graphic designer, and developer who enjoys turning ideas into visual experiences and functional web applications.</p></Reveal>
        <Reveal delay={160}><p>I work across design and development, combining visual craft with React, Vite, Node.js and the MERN stack. From a single visual to a complete product, I like taking things from the first idea to something people can actually use.</p></Reveal>
      </div>
    </div>
  </section>;
}

function ProjectCard({ project, onOpen }) {
  return <article className={`project-card ${project.featured ? 'featured' : ''}`}>
    <button className="project-visual" onClick={() => onOpen(project)} aria-label={`Open ${project.name}`}>
      <span className="project-number">{project.index}</span>
      <span className="project-visual-title">{project.name}</span>
      <span className="project-open">VIEW ↗</span>
    </button>
    <div className="project-details">
      <div><span className="project-category">{project.category}</span><h3>{project.name}</h3><p>{project.description}</p></div>
      <div className="project-side"><div className="tags">{project.tags?.map(tag => <span key={tag}>{tag}</span>)}</div><button onClick={() => onOpen(project)}>View project ↗</button></div>
    </div>
  </article>;
}

function ProjectModal({ project, close }) {
  if (!project) return null;
  return <div className="modal-shell" onClick={close}>
    <div className="modal" onClick={e => e.stopPropagation()}>
      <div className="modal-top"><span>{project.index} / {project.category}</span><button className="modal-close" onClick={close}>CLOSE ×</button></div>
      <h2>{project.name}</h2>
      <p>{project.description}</p>
      <div className="preview-frame">
        <div className="browser-bar"><i /><i /><i /><span>{project.live || 'Preview unavailable'}</span></div>
        {project.live ? <iframe src={project.live} title={`${project.name} live preview`} /> : <div className="preview-empty">No live URL added yet.<br /><code>src/data/projects.js</code></div>}
      </div>
      <div className="modal-actions">{project.live && <a href={project.live} target="_blank" rel="noreferrer">Open live site ↗</a>}{project.github && <a href={project.github} target="_blank" rel="noreferrer">GitHub ↗</a>}</div>
    </div>
  </div>;
}

function Work({ onOpen }) {
  return <section className="section work" id="work">
    <Reveal className="section-index"><span>02 / SELECTED WORK</span><em>{String(projects.length).padStart(2, '0')} PROJECTS</em></Reveal>
    <div className="work-heading"><Reveal><h2><SplitText>Things</SplitText><SplitText>I've</SplitText><SplitText accent>built.</SplitText></h2></Reveal><Reveal delay={100}><p>Selected experiments, products and systems — design meeting development.</p></Reveal></div>
    <div className="projects-list">{projects.map((project, i) => <Reveal key={project.id} delay={Math.min(i * 45, 260)}><ProjectCard project={project} onOpen={onOpen} /></Reveal>)}</div>
  </section>;
}

function Skills() {
  const groups = [
    ['Development', 'React · Vite · JavaScript · HTML · CSS · Node.js · Express · MongoDB · REST APIs'],
    ['Design', 'CorelDRAW · Adobe Photoshop · Graphic Design · Visual Design · Image Editing'],
    ['Tools', 'Git · GitHub · VS Code · Vercel · Modern Web Applications']
  ];
  return <section className="section skills" id="skills">
    <Reveal className="section-index"><span>03 / TOOLKIT</span><em>CRAFT + CODE</em></Reveal>
    <div className="skill-grid">{groups.map(([title, copy], i) => <Reveal key={title} delay={i * 90}><div className="skill-card"><span>0{i + 1}</span><h3>{title}</h3><p>{copy}</p></div></Reveal>)}</div>
  </section>;
}

function Contact() {
  return <section className="section contact" id="contact">
    <Reveal className="section-index"><span>04 / CONTACT</span><em>LET'S MAKE SOMETHING</em></Reveal>
    <div className="contact-main"><Reveal><h2><SplitText>Let's</SplitText><SplitText>build</SplitText><SplitText accent>something.</SplitText></h2></Reveal><Reveal delay={120}><div className="contact-links"><a href="https://github.com/SaurabhArt111" target="_blank" rel="noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/saurabh-maurya-55a66433b/" target="_blank" rel="noreferrer">LinkedIn ↗</a><a href="https://www.instagram.com/saurabh_art__111/" target="_blank" rel="noreferrer">Instagram ↗</a></div></Reveal></div>
  </section>;
}

function Footer() { return <footer><span>SAURABH MAURYA</span><span>ARTIST · DESIGNER · DEVELOPER</span><span>© 2026</span></footer>; }

function App() {
  const [dark, setDark] = useState(() => localStorage.getItem('saurabh-theme') === 'dark');
  const [selected, setSelected] = useState(null);
  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('saurabh-theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => { document.body.classList.add('loaded'); }, []);
  return <><Nav dark={dark} setDark={setDark} /><main><Hero /><About /><Work onOpen={setSelected} /><Skills /><Contact /></main><Footer />{selected && <ProjectModal project={selected} close={() => setSelected(null)} />}</>;
}

createRoot(document.getElementById('root')).render(<App />);
