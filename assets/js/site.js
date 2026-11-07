(() => {
  const root = document.documentElement;
  const animated = root.classList.contains("obi-ready");

  const topbar = document.querySelector("[data-topbar]");
  const markers = document.querySelectorAll("[data-rail], .nowbar");
  if (topbar && markers.length) {
    const visible = new Set();
    const observer = new IntersectionObserver((entries) => {
      for (const { target, isIntersecting } of entries) {
        if (isIntersecting) visible.add(target);
        else visible.delete(target);
      }
      topbar.classList.toggle("is-on", visible.size === 0);
    });
    markers.forEach((marker) => observer.observe(marker));
  }

  const sleeve = document.querySelector("[data-script]");
  if (sleeve && animated) sleeve.dataset.script = "jp";

  const wordBoxes = document.querySelectorAll(".words");
  const measureWords = () =>
    wordBoxes.forEach((box) => {
      box.querySelectorAll(".swap").forEach((slot) => {
        const [jp, en] = slot.children;
        slot.style.setProperty("--w-jp", `${jp.getBoundingClientRect().width}px`);
        slot.style.setProperty("--w-en", `${en.getBoundingClientRect().width}px`);
      });
      box.style.minHeight = "";
      const heights = ["jp", "en"].map((script) => {
        box.dataset.measure = script;
        return box.getBoundingClientRect().height;
      });
      box.dataset.measure = "";
      box.style.minHeight = `${Math.max(...heights)}px`;
      box.getBoundingClientRect();
      delete box.dataset.measure;
    });
  if (wordBoxes.length) {
    measureWords();
    document.fonts.ready.then(measureWords);
    addEventListener("resize", measureWords);
  }

  const tracks = document.querySelector(".obi__tracks");
  if (tracks) [...tracks.children].forEach((li, i) => li.style.setProperty("--i", i));

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
    if (animated && sleeve && sleeve.contains(obi)) {
      setTimeout(() => {
        sleeve.dataset.script = "en";
        sleeve.dataset.settled = "";
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
