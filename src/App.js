import React, {useState} from 'react';
import {useSprings, animated, interpolate} from 'react-spring';
import {useGesture} from 'react-use-gesture';
import './App.css';

const cards = [
  'https://lh3.googleusercontent.com/pBgi0FN3Hjq6AynyUQgp1ios6zwLKKa1AX2GveCsQ3r3eJ7m9V7N5iRYtR9SH2RYuqi3TOD2blDYx_Sa66aRKhvdxKz4kSo=s2560',
  'https://lh3.googleusercontent.com/iP3-lTuiiKHIZ2J3POGM2Or6CjR2u3SnfaE3bU3d-SIBavSCmgW0o5GQUDrwY4ck5OK4EuP0rCL67VvvSHHTxLIBKSX2eXeo=s2560',
  'https://lh3.googleusercontent.com/Kn7H0Z0od643JKiDthj6L2ysXgkaUV6XEQ-aEXCjL9btnSCpLyOUOLDjG2DjMpHSvSCqd1blPoqi7ohKkgq2yANnWQeiPOI=s2560',
  'https://lh3.googleusercontent.com/y98gGAZoahHrjqCKUM9uDTgeHEcDpBgpT2JRqe3a3iKevdFPVs39UbGhQE3vhzo4etmZTk4srJzj_DEERCaK-R3YFxtoBMZ7=s2560',
  'https://lh3.googleusercontent.com/DDPCEm9NQ0bghTkW49o-E16shFYuV4hXRYmA-mgDFiRZ0X5_H1m2g0aCEdgUbYQnAz3jofCa_vWm__05hbDtTC_9RkFN9f2H=s2560',
  'https://lh3.googleusercontent.com/TDobZvrDnnfeZVDGvz8BRIo8DxUNnbJHo7iRgAsWrAPcUwEqdOQBMvL1jZy5MX3eDgO7a9YKGR_x9EBQcHsimqGViozBD0k=s2560',
];

// These two are just helpers, they curate spring data, values that are later being interpolated into css
const to = (i) => ({x: 0, y: i * -4, scale: 1, rot: -10 + Math.random() * 20, delay: i * 100});
const from = (i) => ({x: 0, rot: 0, scale: 1.5, y: -1000});
// This is being used down there in the view, it interpolates rotation and scale into a css transform
const trans = (r, s) => `perspective(1500px) rotateX(0deg) rotateY(${r / 10}deg) rotateZ(${r}deg) scale(${s})`;

const App = () => {
  const [gone] = useState(() => new Set()); // The set flags all the cards that are flicked out
  const [props, set] = useSprings(cards.length, (i) => ({...to(i), from: from(i)})); // Create a bunch of springs using the helpers above
  // Create a gesture, we're interested in down-state, delta (current-pos - click-pos), direction and velocity
  const bind = useGesture(({args: [index], down, delta: [xDelta], distance, direction: [xDir], velocity}) => {
    const trigger = velocity > 0.2; // If you flick hard enough it should trigger the card to fly out
    const dir = xDir < 0 ? -1 : 1; // Direction should either point left or right
    if (!down && trigger) gone.add(index); // If button/finger's up and trigger velocity is reached, we flag the card ready to fly out
    set((i) => {
      if (index !== i) return; // We're only interested in changing spring-data for the current spring
      const isGone = gone.has(index);
      const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0; // When a card is gone it flys out left or right, otherwise goes back to zero
      const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0); // How much the card tilts, flicking it harder makes it rotate faster
      const scale = down ? 1.1 : 1; // Active cards lift up a bit
      return {x, rot, scale, delay: undefined, config: {friction: 50, tension: down ? 800 : isGone ? 200 : 500}};
    });
    if (!down && gone.size === cards.length) setTimeout(() => gone.clear() || set((i) => to(i)), 600);
  });

  return props.map(({x, y, rot, scale}, i) => (
    <animated.div key={i} style={{transform: interpolate([x, y], (x, y) => `translate3d(${x}px,${y}px,0)`)}}>
      {/* This is the card itself, we're binding our gesture to it (and inject its index so we know which is which) */}
      <animated.div style={{transform: interpolate([rot, scale], trans)}}><img {...bind(i)} src={cards[i]} alt={''}/></animated.div>
    </animated.div>
  ));
};

export default App;
