/* Original canvas field: a warped wave palette, pointer wakes, and tile-based pane reveals. */
(() => {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (v) => v * v * (3 - 2 * v);
  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  class ColorField {
    constructor(canvas, reader) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.reader = reader;
      this.motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
      this.paused = this.motionPreference.matches;
      this.palette = ['#b7d3cc', '#4a829d', '#a3c4cf', '#d6dda9', '#dbaa7f', '#be7b70'].map(rgb);
      this.targetPalette = this.palette.map((c) => [...c]);
      this.homePalette = this.palette.map((c) => [...c]);
      this.time = 6;
      this.last = performance.now();
      this.trails = [];
      this.transition = null;
      this.frame = this.frame.bind(this);
      this.motionPreference.addEventListener('change', () => {
        this.setPaused(this.motionPreference.matches);
        window.dispatchEvent(new Event('fieldmotionchange'));
      });
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(document.getElementById('workspace'));
      window.addEventListener('resize', () => this.resize());
      window.addEventListener('pointermove', (event) => this.pointer(event), {passive:true});
      window.addEventListener('pointerdown', (event) => this.pointer(event, true), {passive:true});
      window.addEventListener('scroll', () => this.request(), {passive:true});
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(this.raf);
        else { this.raf = 0; this.last = performance.now(); this.request(); }
      });
      this.resize();
    }

    resize() {
      const rect = this.canvas.getBoundingClientRect();
      this.width = rect.width;
      this.height = rect.height;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.step = innerWidth <= 760 ? 16 : 20;
      this.request();
    }

    request() {
      if (!this.raf && !document.hidden) this.raf = requestAnimationFrame(this.frame);
    }

    setPaused(value) {
      this.paused = value;
      if (value) this.trails = [];
      this.request();
    }

    setPalette(colors) {
      this.targetPalette = colors ? colors.map(rgb) : this.homePalette.map((c) => [...c]);
      this.paletteFrames = 75;
      this.request();
    }

    pointer(event, click = false) {
      if (this.paused || this.motionPreference.matches || document.querySelector('dialog[open]') || event.target.closest('a,button,.reader,.directory,dialog,.field-controls')) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const last = this.trails.at(-1);
      if (!click && last && Math.hypot(last.x-x,last.y-y) < 16) return;
      this.trails.push({x,y,at:performance.now(),strength:click ? 1.5 : 0.8});
      if (this.trails.length > 14) this.trails.shift();
      this.request();
    }

    animate(kind, callback, complete) {
      if (this.transition) this.transition.complete?.();
      if (this.motionPreference.matches) {
        callback?.(1); complete?.(); this.transition = null; this.request(); return;
      }
      this.transition = {kind, start:performance.now(), duration:kind === 'switch' ? 180 : 240, callback, complete};
      this.request();
    }

    cancelTransition() {
      const old = this.transition;
      this.transition = null;
      old?.complete?.();
    }

    frame(now) {
      this.raf = 0;
      const delta = Math.min((now-this.last)/1000, .08);
      this.last = now;
      if (!this.paused) this.time += delta;
      if (!this.ctx) return;
      if (this.paletteFrames > 0) {
        for (let i=0;i<this.palette.length;i++) for(let c=0;c<3;c++) this.palette[i][c] += (this.targetPalette[i][c]-this.palette[i][c])*.08;
        this.paletteFrames--;
      }
      const trans = this.transition;
      const p = trans ? clamp((now-trans.start)/trans.duration,0,1) : 1;
      trans?.callback?.(smooth(p));
      const ctx = this.ctx;
      const w = this.width, h = this.height, step = this.step;
      const dark = document.documentElement.dataset.theme === 'dark';
      const left = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--sidebar')) || 0;
      const base = dark ? '#1b2526' : '#e1e6df';
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle = base;
      ctx.fillRect(left,12,w-left-12,h-24);
      this.trails = this.trails.filter((t) => now-t.at < 2000);
      const cache = new Map();
      const tiles = [];
      const t = this.time;

      for (let y=12;y<h-12;y+=step) {
        for (let x=left;x<w-12;x+=step) {
          const u = (x-left)*.0048, v = y*.0048;
          const warpX = u + .85*Math.sin(v*1.25+t*.12);
          const warpY = v + .7*Math.cos(u*1.05-t*.1);
          let value = .47 + .25*Math.sin(warpX*1.2+warpY*.7+t*.12) + .19*Math.cos(warpY*1.65-warpX*.75-t*.085) + .1*Math.sin(warpX*2.9+warpY*2.4+t*.11);
          let glow = 0;
          for(const trail of this.trails) {
            const age = (now-trail.at)/1000;
            const distance = Math.hypot(x+step/2-trail.x,y+step/2-trail.y);
            const ring = distance-age*75;
            const fade = Math.pow(1-age/2,2)*trail.strength;
            glow += Math.exp(-(ring*ring)/1800)*fade*.22;
          }
          value += glow*.55;
          const key = Math.round(clamp(value,0,.999)*255);
          const brightKey = Math.round(clamp(glow,0,.5)*20);
          const colorKey = key*16+brightKey;
          let fill = cache.get(colorKey);
          if (!fill) {
            const f = key/255*(this.palette.length-1);
            const index = Math.floor(f), mix = smooth(f-index);
            const a = this.palette[index], b = this.palette[Math.min(index+1,this.palette.length-1)];
            const color = a.map((v,c) => {
              const tone = v*(1-mix)+b[c]*mix;
              return Math.round(clamp(tone*(dark?.76:1)+(brightKey/20)*100,0,255));
            });
            fill = `rgb(${color.join(',')})`;
            cache.set(colorKey,fill);
          }
          ctx.fillStyle = fill;
          const tw = Math.min(step-1.1,w-12-x), th = Math.min(step-1.1,h-12-y);
          ctx.fillRect(x,y,tw,th);
          tiles.push({x,y,w:tw,h:th,fill});
        }
      }

      if (!this.reader.hidden) {
        const canvasRect = this.canvas.getBoundingClientRect();
        const r = this.reader.getBoundingClientRect();
        const rect = {x:r.left-canvasRect.left,y:r.top-canvasRect.top,w:r.width,h:r.height};
        ctx.clearRect(rect.x,rect.y,rect.w,rect.h);
        if (trans) {
          ctx.save(); ctx.beginPath(); ctx.rect(rect.x,rect.y,rect.w,rect.h); ctx.clip();
          for (const tile of tiles) {
            if (tile.x+step<rect.x || tile.x>rect.x+rect.w || tile.y+step<rect.y || tile.y>rect.y+rect.h) continue;
            let cover = false;
            if (trans.kind === 'switch') {
              const band = -90+smooth(p)*(rect.h+180);
              const edge = tile.y-rect.y-band+Math.sin(tile.x*.05)*14;
              cover = Math.abs(edge)<45;
            } else {
              const cut = (trans.kind === 'close' ? 1-smooth(p) : smooth(p))*(rect.w+80)-40;
              const edge = tile.x-rect.x+Math.sin(tile.y*.07)*16;
              cover = edge>cut;
            }
            if (cover) {ctx.fillStyle=base;ctx.fillRect(tile.x,tile.y,step,step);ctx.fillStyle=tile.fill;ctx.fillRect(tile.x,tile.y,tile.w,tile.h);}
          }
          ctx.restore();
        }
      }
      if (trans && p === 1 && this.transition === trans) {this.transition=null;trans.complete?.();}
      if (!this.paused || this.transition || this.paletteFrames > 0) this.request();
    }
  }
  window.ColorField = ColorField;
})();
