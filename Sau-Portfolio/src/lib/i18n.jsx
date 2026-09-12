
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
