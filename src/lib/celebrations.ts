import confetti from 'canvas-confetti';

export function firePassGOCelebration() {
  confetti({
    particleCount: 60,
    spread: 60,
    origin: { y: 0.8 },
    colors: ['#10B981', '#34D399', '#FBBF24', '#FFFFFF'],
  });
}

export function fireSkyscraperCelebration() {
  // Dual cannon firework explosion for Skyscraper
  const count = 200;
  const defaults = {
    origin: { y: 0.7 },
    colors: ['#0284C7', '#38BDF8', '#60A5FA', '#F59E0B', '#FFFFFF'],
  };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export function fireAuctionWonCelebration() {
  confetti({
    particleCount: 80,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#A855F7', '#C084FC', '#FBBF24', '#FFFFFF'],
  });
}
