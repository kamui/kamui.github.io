(() => {
  const root = document.documentElement;
  const animated = root.classList.contains("obi-ready");

  const topbar = document.querySelector("[data-topbar]");
  const rail = document.querySelector("[data-rail]");
  if (topbar && rail) {
    new IntersectionObserver(([entry]) => {
      topbar.classList.toggle("is-on", !entry.isIntersecting);
    }).observe(rail);
  }

  const sleeve = document.querySelector("[data-script]");
  const toggle = document.querySelector("[data-script-toggle]");
  let chosen = false;
  const setScript = (script) => {
    sleeve.dataset.script = script;
    sleeve.dataset.settled = "";
    toggle.setAttribute("aria-pressed", String(script === "jp"));
  };

  const tracks = document.querySelector(".obi__tracks");
  if (tracks) [...tracks.children].forEach((li, i) => li.style.setProperty("--i", i));

  if (sleeve && toggle) {
    if (animated) {
      sleeve.dataset.script = "jp";
      toggle.setAttribute("aria-pressed", "true");
    }
    toggle.hidden = false;
    toggle.addEventListener("click", () => {
      chosen = true;
      setScript(sleeve.dataset.script === "jp" ? "en" : "jp");
    });
  }

  const player = document.querySelector("[data-player]");
  if (player) {
    const controls = document.querySelectorAll("[data-play]");
    const tracks = JSON.parse(player.dataset.tracks);
    const audio = new Audio();
    audio.preload = "none";
    audio.loop = tracks.length === 1;
    const trackTitle = document.querySelector("[data-track-title]");
    let current = 0;
    const load = (i) => {
      current = i;
      const { title, artist, src } = tracks[i];
      audio.src = src;
      player.title = `“${title}” by ${artist}`;
      player.setAttribute("aria-label", `Music: ${player.title}`);
      trackTitle.textContent = `${title} · ${artist}`;
    };
    const sync = () => {
      root.classList.toggle("is-playing", !audio.paused);
      controls.forEach((c) => c.setAttribute("aria-pressed", String(!audio.paused)));
    };
    ["play", "pause", "error"].forEach((type) => audio.addEventListener(type, sync));
    audio.addEventListener("ended", () => {
      load((current + 1) % tracks.length);
      audio.play();
    });
    const toggle = () => {
      if (!audio.src) load(current);
      if (audio.paused) audio.play().catch(sync);
      else audio.pause();
    };
    controls.forEach((c) => {
      c.addEventListener("click", toggle);
      c.disabled = false;
    });
  }

  const obis = document.querySelectorAll("[data-obi]");
  obis.forEach((obi) => {
    [...obi.querySelectorAll(".obi__cols > *")].forEach((col, i) => col.style.setProperty("--i", i));
  });

  const wrapped = (obi) => {
    obi.classList.add("is-wrapped");
    if (animated && sleeve && obi.contains(sleeve)) {
      setTimeout(() => {
        if (!chosen) setScript("en");
      }, 2200);
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        wrapped(entry.target);
      });
    },
    { rootMargin: "0px 0px -15% 0px" },
  );
  obis.forEach((obi) => io.observe(obi));
})();
