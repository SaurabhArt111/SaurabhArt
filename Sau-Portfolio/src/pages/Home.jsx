import Nav from "../components/layout/Nav";
import Scene from "../components/layout/Scene";
import CharacterHero from "../components/sections/CharacterHero/CharacterHero";
import Hero from "../components/sections/Hero/Hero";
import About from "../components/sections/About/About";
import DesignStack from "../components/sections/Stack/DesignStack";
import Work from "../components/sections/Work/Work";
import Connect from "../components/sections/Connect/Connect";

export default function Home() {
  return (
    <>
      <Nav />
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

        <div className="finalFrame">
          <Connect />
        </div>
      </main>
    </>
  );
}
