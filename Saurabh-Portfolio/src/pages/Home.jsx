import Nav from "../components/layout/Nav";
import Scene from "../components/layout/Scene";
import AmbientParticles from "../components/fx/AmbientParticles";
import ScrollProgressRing from "../components/fx/ScrollProgressRing";
import SvgFlourish from "../components/fx/SvgFlourish";
import CharacterHero from "../components/sections/CharacterHero/CharacterHero";
import Hero from "../components/sections/Hero/Hero";
import About from "../components/sections/About/About";
import DesignStack from "../components/sections/Stack/DesignStack";
import Work from "../components/sections/Work/Work";
import Interlude from "../components/sections/Interlude/Interlude";
import Gallery from "../components/sections/Gallery/Gallery";
import Services from "../components/sections/Services/Services";
import Process from "../components/sections/Process/Process";
import FAQ from "../components/sections/FAQ/FAQ";
import Connect from "../components/sections/Connect/Connect";

export default function Home() {
  return (
    <>
      <Nav />

      {/* one dust field for the whole page, over the stacked scenes and under
          the nav — every scene paints an opaque background, so a layer behind
          them would never be seen */}
      <AmbientParticles />
      <ScrollProgressRing />

      <main>
        <CharacterHero />

        <Scene order={1} id="hero">
          <Hero />
        </Scene>

        <Scene order={2} id="about">
          <About />
        </Scene>

        <Scene order={3} id="stack">
          <DesignStack />
        </Scene>

        <Scene order={4} runway={4.5} id="work">
          <Work />
        </Scene>

        <Scene order={5} runway={1} id="loop">
          <Interlude />
        </Scene>

        <div className="finalFrame">
          <Gallery />
          <SvgFlourish variant="thread" className="fx-divider" />
          <Services />
          <Process />
          <SvgFlourish variant="thread" className="fx-divider" />
          <FAQ />
          <Connect />
        </div>
      </main>
    </>
  );
}
