const header = document.querySelector(".site-header");
const glow = document.querySelector(".cursor-glow");
const revealItems = document.querySelectorAll(".reveal");
const liquidItems = document.querySelectorAll(".liquid");
const tabButtons = document.querySelectorAll(".vertical-tabs button");
const marketPills = document.querySelectorAll(".market-pill");
const liveSpread = document.querySelector("[data-live-spread]");
const motionHosts = document.querySelectorAll(".hero, .page-hero, .access-hero");

const updateHeader = () => {
  if (header) {
    header.classList.toggle("is-scrolled", window.scrollY > 34);
  }
};

window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

if (glow) {
  window.addEventListener(
    "pointermove",
    (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    },
    { passive: true }
  );

  window.addEventListener("pointerleave", () => {
    glow.style.opacity = "0";
  });

  window.addEventListener("pointerenter", () => {
    glow.style.opacity = "0.09";
  });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

liquidItems.forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    item.style.setProperty("--mx", `${x}%`);
    item.style.setProperty("--my", `${y}%`);
  });
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    tabButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    const panel = button.closest(".insight-layout, .signal-board")?.querySelector(".market-panel");

    if (!panel) {
      return;
    }

    const values = {
      Markets: ["$812M", "24h institutional movement"],
      Treasury: ["$426M", "active treasury rotation"],
      Risk: ["0.74", "composite volatility score"],
    };
    const [value, label] = values[button.textContent.trim()] || values.Markets;
    panel.querySelector("strong").textContent = value;
    panel.querySelector("small").textContent = label;
  });
});

const activateMarketPill = (pill) => {
  marketPills.forEach((item) => item.classList.remove("active"));
  pill.classList.add("active");

  if (liveSpread && pill.dataset.spread) {
    liveSpread.textContent = pill.dataset.spread;
    liveSpread.animate(
      [
        { opacity: 0.35, transform: "translateY(4px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "ease-out" }
    );
  }
};

window.activateMarket = activateMarketPill;

marketPills.forEach((pill) => {
  pill.addEventListener("pointerdown", () => activateMarketPill(pill));
  pill.addEventListener("click", () => activateMarketPill(pill));
});

if (marketPills.length) {
  let tick = 0;

  window.setInterval(() => {
    tick += 1;
    marketPills.forEach((pill, index) => {
      const base = [2.4, 1.8, 3.1][index] || 1.2;
      const next = (base + Math.sin(tick * 0.65 + index) * 0.18).toFixed(1);
      const value = pill.querySelector("span");

      if (value) {
        value.textContent = `+${next}%`;
      }
    });
  }, 1800);
}

const canAnimate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener("click", (event) => {
  const pill = event.target.closest(".market-pill");

  if (!pill) {
    return;
  }

  activateMarketPill(pill);
});

if (canAnimate) {
  motionHosts.forEach((host, hostIndex) => {
    const canvas = document.createElement("canvas");
    canvas.className = "motion-canvas";
    canvas.setAttribute("aria-hidden", "true");
    host.prepend(canvas);

    const context = canvas.getContext("2d");
    const points = Array.from({ length: host.classList.contains("hero") ? 34 : 48 }, (_, index) => ({
      seed: index + hostIndex * 17,
      x: Math.random(),
      y: Math.random(),
      speed: 0.00018 + Math.random() * 0.0002,
      size: 1 + Math.random() * 1.8,
    }));

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
      canvas.width = Math.max(1, Math.floor(rect.width * ratio));
      canvas.height = Math.max(1, Math.floor(rect.height * ratio));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize, { passive: true });

    const draw = (time) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const dark = !host.classList.contains("hero");

      context.clearRect(0, 0, width, height);
      context.lineWidth = 1;

      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, dark ? "rgba(185,242,236,0.03)" : "rgba(10,11,11,0.018)");
      gradient.addColorStop(0.55, dark ? "rgba(214,255,127,0.07)" : "rgba(10,11,11,0.035)");
      gradient.addColorStop(1, dark ? "rgba(183,167,255,0.05)" : "rgba(10,11,11,0.014)");
      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      context.beginPath();
      for (let x = -40; x < width + 60; x += 32) {
        const y = height * 0.58 + Math.sin((x + time * 0.018) * 0.012) * 34;
        if (x === -40) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = dark ? "rgba(185,242,236,0.14)" : "rgba(10,11,11,0.065)";
      context.stroke();

      points.forEach((point) => {
        point.x = (point.x + point.speed * 16) % 1;
        const x = point.x * width;
        const y = (0.18 + point.y * 0.64 + Math.sin(time * 0.0008 + point.seed) * 0.018) * height;
        context.beginPath();
        context.arc(x, y, point.size, 0, Math.PI * 2);
        context.fillStyle = dark ? "rgba(214,255,127,0.34)" : "rgba(10,11,11,0.11)";
        context.fill();
      });

      const barBase = height * 0.76;
      for (let index = 0; index < 18; index += 1) {
        const x = width * 0.54 + index * 16;
        if (x > width - 18) break;
        const pulse = Math.sin(time * 0.002 + index * 0.85);
        const barHeight = 18 + Math.abs(pulse) * 54;
        context.fillStyle = pulse > 0 ? "rgba(214,255,127,0.24)" : dark ? "rgba(185,242,236,0.18)" : "rgba(10,11,11,0.075)";
        context.fillRect(x, barBase - barHeight, 3, barHeight);
      }

      requestAnimationFrame(draw);
    };

    requestAnimationFrame(draw);
  });
}

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
