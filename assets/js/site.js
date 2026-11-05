/* =========================================================
   YICHAO'S LAB — interactions
   Vanilla JS. No dependencies.
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */

  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");

  if (menuToggle && nav) {
    const closeMenu = () => {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "打开菜单");
      nav.classList.remove("is-open");
      document.body.classList.remove("is-locked");
    };

    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") === "true";
      if (open) {
        closeMenu();
      } else {
        menuToggle.setAttribute("aria-expanded", "true");
        menuToggle.setAttribute("aria-label", "关闭菜单");
        nav.classList.add("is-open");
        document.body.classList.add("is-locked");
        const firstLink = nav.querySelector("a");
        if (firstLink) window.setTimeout(() => firstLink.focus(), 120);
      }
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        menuToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 820) closeMenu();
    });
  }

  /* ---------- circular dials ---------- */

  const SVG_NS = "http://www.w3.org/2000/svg";

  function polar(cx, cy, radius, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(cx, cy, radius, startAngle, endAngle) {
    const start = polar(cx, cy, radius, endAngle);
    const end = polar(cx, cy, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  }

  function buildDial(stage) {
    let segments;
    try {
      segments = JSON.parse(stage.getAttribute("data-dial") || "[]");
    } catch (error) {
      return;
    }
    if (!segments.length) return;

    const size = 400;
    const cx = 200;
    const cy = 200;
    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", "一个 24 小时时间圆盘，被分配给四位合作者");

    const outerRing = document.createElementNS(SVG_NS, "circle");
    outerRing.setAttribute("cx", cx);
    outerRing.setAttribute("cy", cy);
    outerRing.setAttribute("r", "177");
    outerRing.setAttribute("fill", "none");
    outerRing.setAttribute("stroke", "rgba(241,238,228,.16)");
    outerRing.setAttribute("stroke-width", "1");
    svg.appendChild(outerRing);

    const totalHours = segments.reduce((sum, item) => sum + Number(item.hours || 0), 0) || 24;
    for (let i = 0; i < 24; i += 1) {
      const angle = (i / 24) * 360;
      const major = i % 6 === 0;
      const inner = polar(cx, cy, major ? 164 : 169, angle);
      const outer = polar(cx, cy, major ? 178 : 176, angle);
      const tick = document.createElementNS(SVG_NS, "line");
      tick.setAttribute("x1", inner.x);
      tick.setAttribute("y1", inner.y);
      tick.setAttribute("x2", outer.x);
      tick.setAttribute("y2", outer.y);
      tick.setAttribute("class", major ? "dial-tick dial-tick--major" : "dial-tick");
      svg.appendChild(tick);
    }

    let cursor = 0;
    segments.forEach((segment, index) => {
      const sweep = (Number(segment.hours) / totalHours) * 360;
      const gap = Math.min(2.2, sweep * 0.09);
      const path = document.createElementNS(SVG_NS, "path");
      path.setAttribute("d", arcPath(cx, cy, 148, cursor + gap / 2, cursor + sweep - gap / 2));
      path.setAttribute("class", "dial-arc");
      path.setAttribute("stroke", segment.color || "#d4f36b");
      path.style.setProperty("--delay", `${0.45 + index * 0.16}s`);
      svg.appendChild(path);
      cursor += sweep;
    });

    stage.insertBefore(svg, stage.firstChild);

    const legend = stage.parentElement.querySelector(".dial-legend");
    if (legend) {
      legend.textContent = "";
      segments.forEach((segment) => {
        const item = document.createElement("li");
        const name = document.createElement("span");
        name.className = "name";
        const dot = document.createElement("span");
        dot.className = "dot";
        dot.style.setProperty("--dot", segment.color || "#d4f36b");
        const label = document.createElement("span");
        label.textContent = segment.name;
        name.append(dot, label);
        const hours = document.createElement("span");
        hours.className = "hours";
        hours.textContent = `${segment.hours}h`;
        item.append(name, hours);
        legend.appendChild(item);
      });
    }
  }

  document.querySelectorAll("[data-dial]").forEach(buildDial);

  /* ---------- reveal on scroll ---------- */

  const revealItems = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-in"));
  }

  /* ---------- reading progress + toc ---------- */

  const article = document.querySelector(".story-article");
  const progressBar = document.querySelector(".reading-progress span");
  const tocLinks = Array.from(document.querySelectorAll(".toc-list a"));
  const chapters = Array.from(document.querySelectorAll(".chapter[id]"));
  const tocPercent = document.querySelector("[data-toc-percent]");

  if (article && progressBar) {
    let ticking = false;

    const updateReading = () => {
      const articleTop = article.getBoundingClientRect().top + window.scrollY;
      const articleHeight = article.offsetHeight;
      const viewport = Math.min(window.innerHeight, 1000);
      const start = articleTop - viewport * 0.35;
      const end = articleTop + articleHeight - viewport * 0.72;
      const raw = (window.scrollY - start) / Math.max(1, end - start);
      const progress = Math.min(1, Math.max(0, raw));
      progressBar.style.transform = `scaleX(${progress})`;
      if (tocPercent) tocPercent.textContent = `${Math.round(progress * 100)}%`;

      if (chapters.length) {
        let activeId = chapters[0].id;
        chapters.forEach((chapter) => {
          if (chapter.getBoundingClientRect().top <= 170) activeId = chapter.id;
        });
        tocLinks.forEach((link) => {
          const isActive = link.getAttribute("href") === `#${activeId}`;
          link.classList.toggle("is-active", isActive);
          if (isActive) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      }
      ticking = false;
    };

    const requestUpdate = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateReading);
      }
    };

    updateReading();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
  }

  /* ---------- lightbox ---------- */

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;
  let lightboxOpener = null;

  if (lightbox && lightboxImg && lightboxClose) {
    const openLightbox = (button) => {
      const full = button.getAttribute("data-full");
      const caption = button.getAttribute("data-caption") || "";
      const image = button.querySelector("img");
      if (!full) return;
      lightboxOpener = button;
      lightboxImg.src = full;
      lightboxImg.alt = image ? image.alt : "";
      if (lightboxCaption) lightboxCaption.textContent = caption;
      lightbox.hidden = false;
      lightbox.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-locked");
      window.setTimeout(() => lightboxClose.focus(), 30);
    };

    const closeLightbox = () => {
      lightbox.hidden = true;
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.removeAttribute("src");
      document.body.classList.remove("is-locked");
      if (lightboxOpener) lightboxOpener.focus();
    };

    document.querySelectorAll("[data-lightbox]").forEach((button) => {
      button.addEventListener("click", () => openLightbox(button));
    });

    lightboxClose.addEventListener("click", closeLightbox);

    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (lightbox.hidden) return;
      if (event.key === "Escape") {
        closeLightbox();
      } else if (event.key === "Tab") {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  }

  /* ---------- the 24-hour allocation lab ---------- */

  const timeLab = document.getElementById("time-lab");
  if (timeLab) {
    const clock = timeLab.querySelector("#clock");
    const clockTotal = timeLab.querySelector("[data-clock-total]");
    const clockKey = timeLab.querySelector("#clock-key");
    const remainingNode = timeLab.querySelector("[data-remaining]");
    const allocatedNode = timeLab.querySelector("[data-allocated]");
    const status = timeLab.querySelector("#time-status");
    const requestCard = timeLab.querySelector("#request-card");
    const requestTitle = timeLab.querySelector("[data-request-title]");
    const requestCopy = timeLab.querySelector("[data-request-copy]");
    const acceptButton = timeLab.querySelector("#accept-request");
    const resetButton = timeLab.querySelector("#reset-time");
    const rows = Array.from(timeLab.querySelectorAll(".alloc-row"));
    const paperColor = "#f1eee4";

    const state = rows.map((row) => {
      const input = row.querySelector("input[type='range']");
      return {
        id: row.getAttribute("data-id"),
        name: row.getAttribute("data-name"),
        color: row.getAttribute("data-color"),
        move: row.getAttribute("data-move"),
        hours: Number(input.value),
        max: Number(input.max),
        input,
      };
    });

    const initial = state.map((item) => item.hours);
    let mira = 0;
    let joined = false;

    const setStatus = (message, kind) => {
      if (!status) return;
      status.textContent = message;
      status.classList.toggle("is-ok", kind === "ok");
    };

    const currentTotal = () => state.reduce((sum, item) => sum + item.hours, 0) + mira;
    const remaining = () => 24 - currentTotal();

    const paintClock = () => {
      if (!clock) return;
      const total = currentTotal();
      const segments = state
        .filter((item) => item.hours > 0)
        .map((item) => ({ color: item.color, hours: item.hours, name: item.name }));

      if (mira > 0) segments.push({ color: "#8661c9", hours: mira, name: "Mira" });

      if (!segments.length) {
        clock.style.background = "conic-gradient(#ded8c9 0deg 360deg)";
      } else {
        const stops = [];
        let cursor = 0;
        segments.forEach((segment) => {
          const sweep = (segment.hours / 24) * 360;
          const end = cursor + sweep;
          const gap = sweep > 6 ? 1.1 : 0;
          stops.push(`${segment.color} ${cursor}deg ${Math.max(cursor, end - gap)}deg`);
          if (gap) stops.push(`${paperColor} ${Math.max(cursor, end - gap)}deg ${end}deg`);
          cursor = end;
        });
        if (cursor < 359.95) stops.push(`#ded8c9 ${cursor}deg 360deg`);
        clock.style.background = `conic-gradient(${stops.join(",")})`;
      }

      if (clockTotal) clockTotal.textContent = String(total);
      if (allocatedNode) allocatedNode.textContent = `${total} h`;
      if (remainingNode) remainingNode.textContent = `${remaining()} h`;

      if (clockKey) {
        clockKey.textContent = "";
        const items = state
          .filter((item) => item.hours > 0)
          .map((item) => ({ name: item.name, color: item.color, hours: item.hours }));
        if (mira > 0) items.push({ name: "Mira", color: "#8661c9", hours: mira });
        items.forEach((item) => {
          const span = document.createElement("span");
          const dot = document.createElement("i");
          dot.style.setProperty("--dot", item.color);
          span.append(dot, document.createTextNode(`${item.name} ${item.hours}h`));
          clockKey.appendChild(span);
        });
      }
    };

    const updateRow = (item) => {
      const percent = item.max > 0 ? (item.hours / item.max) * 100 : 0;
      item.input.value = String(item.hours);
      item.input.style.setProperty("--fill", `${percent}%`);
      item.input.style.background = `linear-gradient(to right, ${item.color} 0 ${percent}%, var(--line) ${percent}% 100%) center / 100% 3px no-repeat`;
      item.input.setAttribute("aria-valuetext", `${item.name} ${item.hours} 小时`);
      const valueNode = timeLab.querySelector(`[data-value-for="${item.id}"]`);
      if (valueNode) valueNode.innerHTML = `${item.hours}<small>h</small>`;
    };

    const render = () => {
      state.forEach(updateRow);
      paintClock();
    };

    state.forEach((item, index) => {
      item.input.addEventListener("input", () => {
        const requested = Number(item.input.value);
        const others = currentTotal() - item.hours;
        const maxAvailable = Math.max(0, 24 - others - mira);
        const capped = Math.min(requested, item.max, maxAvailable);
        item.hours = capped;
        if (requested > capped) {
          setStatus("一天只有 24 小时。先把某段协作调低，才能腾出时间。", "warn");
        } else {
          setStatus("", "warn");
        }
        item.input.value = String(capped);
        render();
        if (joined) {
          requestCopy.textContent = "Mira 已经在你的日程里。你仍然可以重新分配其他人的时间。";
        }
      });
    });

    if (acceptButton) {
      acceptButton.addEventListener("click", () => {
        if (joined) return;
        if (remaining() >= 2) {
          mira = 2;
          joined = true;
          render();
          requestCard.classList.add("is-done");
          requestTitle.textContent = "Mira 加入了这一天";
          requestCopy.textContent = "你把最后的 2 小时给了新伙伴。现在，一天又满了——下一次请求，仍然需要你先做出取舍。";
          acceptButton.textContent = "已接受";
          acceptButton.disabled = true;
          setStatus("接受成功：新关系占用了 2 小时，其他关系的时间没有变多。", "ok");
        } else {
          timeLab.classList.add("is-shaking");
          window.setTimeout(() => timeLab.classList.remove("is-shaking"), 400);
          setStatus("没有 2 小时了。时间不会变多，只能重新分配。", "warn");
          requestCopy.textContent = "Mira 还在等。先把某位伙伴的时间调低，再试一次。";
        }
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        state.forEach((item, index) => {
          item.hours = initial[index];
        });
        mira = 0;
        joined = false;
        if (requestCard) requestCard.classList.remove("is-done");
        if (requestTitle) requestTitle.textContent = "新请求：Mira · 2 小时";
        if (requestCopy) requestCopy.textContent = "一位新伙伴想加入今天的协作。你的日程已经排满了吗？";
        if (acceptButton) {
          acceptButton.textContent = "接受这 2 小时";
          acceptButton.disabled = false;
        }
        setStatus("", "warn");
        render();
      });
    }

    render();
  }

  /* ---------- current year ---------- */

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });
})();
