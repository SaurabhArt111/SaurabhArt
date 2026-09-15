/* Shared 0–1 scroll progress through the opening character sequence.
   CharacterHero writes this every scroll frame (the same value that drives
   its canvas frame and the particle title's formation). Nav reads it to
   decide when to reveal itself — tying the two together directly is more
   reliable than a second, independent ScrollTrigger watching a nested
   sticky element several layers down. */
const heroProgress = { current: 0 };

export default heroProgress;
