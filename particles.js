(() => {
  const canvas = document.querySelector(".svp-particles");
  const context = canvas?.getContext("2d");
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const particles = [];
  let width = 0;
  let height = 0;
  let frame = 0;
  let lastFrame = 0;

  function createParticle(initialProgress = 0) {
    const lifetime = 6 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    const speed = 4 + Math.random() * 9;
    const size = 8 + Math.floor(Math.random() * 5);
    return {
      x: Math.random(),
      y: Math.random(),
      velocityX: Math.cos(angle) * speed,
      velocityY: Math.sin(angle) * speed,
      font: `500 ${size}px Geist, system-ui, sans-serif`,
      opacity: .20 + Math.random() * .17,
      lifetime,
      age: initialProgress * lifetime,
    };
  }

  function draw(elapsed) {
    context.clearRect(0, 0, width, height);
    for (let index = 0; index < particles.length; index++) {
      let particle = particles[index];
      particle.age += elapsed;
      if (particle.age >= particle.lifetime) {
        particle = createParticle();
        particles[index] = particle;
      }

      const progress = particle.age / particle.lifetime;
      context.globalAlpha = particle.opacity * Math.sin(Math.PI * progress);
      context.font = particle.font;
      context.fillText(
        "svp",
        particle.x * width + particle.velocityX * particle.age,
        particle.y * height + particle.velocityY * particle.age,
      );
    }
  }

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#e4e4e4";

    const count = Math.min(144, Math.max(16, Math.round(width * height / 9800)));
    particles.length = Math.min(particles.length, count);
    while (particles.length < count) {
      particles.push(createParticle(Math.random()));
    }
    draw(0);
  }

  function animate(now) {
    const elapsed = now - lastFrame;
    if (elapsed >= 30) {
      draw(Math.min(elapsed / 1000, .08));
      lastFrame = now;
    }
    frame = requestAnimationFrame(animate);
  }

  function syncAnimation() {
    cancelAnimationFrame(frame);
    if (reducedMotion.matches || document.hidden) return;
    lastFrame = performance.now();
    frame = requestAnimationFrame(animate);
  }

  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", syncAnimation);
  reducedMotion.addEventListener("change", syncAnimation);
  resize();
  syncAnimation();
})();
