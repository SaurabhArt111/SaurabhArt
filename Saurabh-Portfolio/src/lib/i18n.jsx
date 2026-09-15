
import { createContext, useContext } from "react";

/* Copy dictionary — English only. The site previously shipped an EN | FR
   switch; French has been removed in favor of a light/dark theme toggle
   (see lib/theme.jsx), so every entry below is now a single string. The
   t(key) call signature is unchanged so every consuming component works
   without modification. */
export const DICT = {
  /* ---------------- nav ---------------- */
  "nav.home": "Home",
  "nav.about": "About",
  "nav.work": "Work",
  "nav.skills": "Skills",
  "nav.gallery": "Gallery",
  "nav.contact": "Contact",
  "nav.menu": "Open menu",
  "nav.close": "Close menu",

  /* ---------------- hero ---------------- */
  "hero.kicker": "Artist, Designer & Developer",
  "hero.h1a": "Interfaces that feel",
  "hero.h1aEm": "obvious.",
  "hero.h1b": "Code that",
  "hero.h1bEm": "just works.",
  "hero.sub":
    "I design visuals, build interfaces, and turn ideas into working digital experiences — from the first sketch to a shipped product.",
  "hero.cta1": "View My Work",
  "hero.cta2": "See How I Work",
  "hero.scroll": "Scroll to Explore",
  "stat.projects": "Projects Built",
  "stat.disciplines": "Core Disciplines",
  "stat.tools": "Tools & Technologies",
  "stat.selfdriven": "Self-Driven Builds",

  /* ---------------- about ---------------- */
  "about.eyebrow": "About",
  "about.h2a": "Somewhere between",
  "about.h2b": "pixels and",
  "about.h2Em": "code.",
  "about.h2c": "",
  "about.m1": "Projects built and shipped",
  "about.m2": "Core disciplines — dev, design, tools",
  "about.m3": "Tools & technologies in daily use",
  "about.m4": "Primary stack",
  "about.edu":
    "I'm Saurabh Maurya — an artist, graphic designer, and developer who enjoys turning ideas into visual experiences and functional web applications. I work across design and development, combining visual craft with React, Vite, Node.js and the MERN stack — taking things from the first idea to something people can actually use.",
  "about.cta": "Explore My Work",

  /* ---------------- design stack ---------------- */
  "stack.eyebrow": "Toolkit",
  "stack.h2": "My Design",
  "stack.h2Em": "Stack.",
  "stack.lede":
    "The tools I use to research, design, prototype, collaborate and ship — from the first rough sketch to production code.",
  "stack.count": "tools",
  "stack.disciplines": "disciplines",

  /* ---------------- work ---------------- */
  "work.eyebrow": "Featured Work",
  "work.h2a": "Selected projects,",
  "work.h2b": "designed to",
  "work.h2Em": "ship.",
  "work.lede":
    "Full-stack builds, browser-based tools and real working products — React, Node.js, MongoDB and a bit of PHP along the way.",
  "work.open": "Open case study",
  "work.hint": "SCROLL TO BROWSE",
  "work.live": "Live preview",
  "work.details": "View details",
  "work.close": "Close preview",
  "work.visit": "Open live site",
  "work.repo": "View source",
  "work.noPreview": "A live preview isn't available for this one yet.",
  "work.previewNote": "If the preview doesn't load below, open it directly instead.",

  /* ---------------- gallery ---------------- */
  "gallery.eyebrow": "Art & Design",
  "gallery.h2a": "Off the",
  "gallery.h2Em": "clock.",
  "gallery.lede":
    "Illustration, branding and UI explorations made outside of client work — the things I make when I'm making for myself.",

  /* ---------------- services ---------------- */
  "services.eyebrow": "What I Do",
  "services.h2a": "Where design",
  "services.h2Em": "meets code.",
  "services.lede":
    "Four ways I can help — from the first wireframe to a deployed, working product.",
  "services.design.title": "Product Design",
  "services.design.desc":
    "Wireframes, prototypes and interface design that hold up once real content and edge cases hit them.",
  "services.frontend.title": "Frontend Development",
  "services.frontend.desc":
    "React interfaces that feel considered — animation, responsiveness and performance included, not bolted on after.",
  "services.fullstack.title": "Full-Stack Builds",
  "services.fullstack.desc":
    "End-to-end products — Node.js, MongoDB and the APIs in between — taken from idea to something people can log into.",
  "services.brand.title": "Brand & Visual Design",
  "services.brand.desc":
    "Identity, illustration and layout work for when a project needs a visual language, not just a UI.",

  /* ---------------- process ---------------- */
  "process.eyebrow": "How I Work",
  "process.h2a": "Same process,",
  "process.h2Em": "every time.",
  "process.lede":
    "No two projects are identical, but the shape of the work usually looks like this.",
  "process.discover.title": "Discover",
  "process.discover.desc": "Understand the problem, the users and the constraints before opening a design tool.",
  "process.design.title": "Design",
  "process.design.desc": "Wireframe, prototype and refine — testing ideas against real content early.",
  "process.build.title": "Build",
  "process.build.desc": "Turn the approved design into a working, responsive, production-ready interface.",
  "process.ship.title": "Ship",
  "process.ship.desc": "Deploy, test in the real world, and keep iterating based on what's actually happening.",

  /* ---------------- faq ---------------- */
  "faq.eyebrow": "Good to Know",
  "faq.h2a": "Frequently",
  "faq.h2Em": "asked.",
  "faq.lede": "The questions that come up most before a project kicks off.",
  "faq.scope.q": "What kind of projects do you take on?",
  "faq.scope.a":
    "Mostly full-stack web apps and product UI — dashboards, booking systems, chat apps and the odd browser-based tool, like the ones in the Work section above. If it involves a browser and a database, it's probably in scope.",
  "faq.stack.q": "What's your usual tech stack?",
  "faq.stack.a":
    "React and Vite on the frontend, Node.js and MongoDB on the backend — the MERN stack, essentially — with the odd PHP project in the mix. Tools and details vary by project.",
  "faq.availability.q": "Are you available for freelance or full-time work?",
  "faq.availability.a":
    "It depends on timing — the best way to find out is to reach out via the Contact section below with a bit of detail on what you're building.",
  "faq.collab.q": "Do you work solo or as part of a team?",
  "faq.collab.a":
    "Both — solo end-to-end on smaller builds, or embedded in a team for larger ones, handling design, frontend, or full-stack depending on what's needed.",
  "faq.timeline.q": "How long does a typical project take?",
  "faq.timeline.a":
    "It scales with scope — a focused tool can take days, a full product with a real backend takes longer. Happy to give a realistic estimate once I know what you're building.",
  "faq.code.q": "Can I see the code behind your projects?",
  "faq.code.a":
    "Most projects link to a live demo, a GitHub repo, or both — check the card in the Work section above, or the GitHub link in Connect.",

  /* ---------------- connect ---------------- */
  "connect.eyebrow": "Let’s Connect",
  "connect.h2a": "Let’s create what’s",
  "connect.h2Em": "next.",
  "connect.lede":
    "I'm open to design & development roles, collaborations and good conversations — if you're building something worth shipping, I'd like to hear about it.",
  "connect.cta": "Start a Conversation",
  "connect.credit": "Designed & Developed by",
  "connect.top": "Back to top",

  /* ---------------- case study (/work/[slug]) ---------------- */
  "case.back": "← Back to work",
  "case.kicker": "Case Study",
  "case.role": "Role",
  "case.timeline": "Timeline",
  "case.focus": "Focus",
  "case.site": "Live product",
  "case.repo": "Source",
  "case.cover": "COVER",
  "case.context": "Context",
  "case.problem": "The Problem",
  "case.process": "Process",
  "case.decisions": "Design Decisions",
  "case.outcome": "Outcome",
  "case.reflection": "Reflection",
  "case.all": "← All projects",
  "case.next": "Next project",

  /* ---------------- lab (/tunnel) ---------------- */
  "lab.back": "← PORTFOLIO",
  "lab.hint": "LAB · TUNNEL TYPE — SCROLL TO TRAVEL · MOVE THE MOUSE",

  /* ---------------- 404 ---------------- */
  "nf.label": "404 — NOT FOUND",
  "nf.h1": "This page went",
  "nf.h1Em": "off the grid.",
  "nf.cta": "Back to the portfolio →",
};

const LanguageContext = createContext({
  t: (k) => DICT[k] ?? k,
});

export function LanguageProvider({ children }) {
  return (
    <LanguageContext.Provider value={{ t: (k) => DICT[k] ?? k }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLang = () => useContext(LanguageContext);
