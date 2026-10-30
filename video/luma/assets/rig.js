/* Luma rig: a 2.5D puppet built from one illustration.
   Everything drawn is a pure function of t (seconds), so any frame can be seeked. */
(function () {
  // ---------- base mapping: source-image px -> base frame px ----------
  const K = 1.32, XOFF = 180, YOFF = 280, YTOP = 260; // world div holds src y from -260
  const B = (x, y) => [(x - XOFF) * K, YOFF + y * K];
  const worldCss = `translate(${-XOFF * K}px, ${YOFF - YTOP * K}px) scale(${K})`;

  // ---------- tiny animation helpers ----------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const lerp = (a, b, u) => a + (b - a) * u;
  function tr(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1, ez] = keys[i + 1];
      if (t < t1) {
        let u = (t - t0) / (t1 - t0);
        u = ez === "lin" ? u : ez === "out" ? 1 - Math.pow(1 - u, 3) : ez === "back" ? backOut(u) : smooth(u);
        return lerp(v0, v1, u);
      }
    }
    return keys[keys.length - 1][1];
  }
  function backOut(u) { const c = 1.9; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); }
  function blinkAt(t, times, dur = 0.24) {
    let b = 0;
    for (const t0 of times) {
      const u = (t - t0) / dur;
      if (u < 0 || u > 1) continue;
      b = Math.max(b, u < 0.3 ? smooth(u / 0.3) : u < 0.45 ? 1 : 1 - smooth((u - 0.45) / 0.55));
    }
    return b;
  }
  function hash(i) { let x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  // ---------- lip sync ----------
  function lip(t) {
    let o = 0, r = 0;
    for (const k in window.LIPSYNC) {
      const v = window.LIPSYNC[k], f = (t - v.start) * 30;
      if (f < 0 || f >= v.open.length - 1) continue;
      const i = Math.floor(f), u = f - i;
      o = lerp(v.open[i], v.open[i + 1], u);
      r = lerp(v.round[i], v.round[i + 1], u);
    }
    // a little hold so the jaw doesn't chatter
    return [clamp(o * 1.1, 0, 1.1), r];
  }

  // ---------- the performance ----------
  const TALK = [[0.9, 4.69], [6.4, 8.76], [12.9, 15.69]];
  function talking(t) { for (const [a, b] of TALK) if (t > a && t < b) return 1; return 0; }

  function state(t) {
    const s = {};
    // eyes: look around, find the camera, find the box, back to camera
    s.lookX = tr([[0, -10], [0.35, -10], [0.6, 10, "out"], [0.85, 10], [1.1, 0], [3.0, 0], [3.15, 3], [3.5, 3], [3.65, 0],
      [5.35, 0], [5.55, 7, "out"], [10.35, 7], [10.45, 5], [12.0, 3], [12.55, 0], [18, 0]], t);
    s.lookY = tr([[0, -1], [0.85, -1], [1.1, 0], [5.35, 0], [5.55, 8, "out"], [10.35, 8], [10.5, 3], [12.0, 3], [12.55, 0], [18, 0]], t);
    s.turn = tr([[0, -13], [0.4, -13], [0.75, 12], [0.95, 12], [1.25, 0], [5.4, 0], [5.8, 7], [10.3, 9], [10.6, 2], [12, 0], [18, 0]], t);
    s.turnY = tr([[0, 0], [5.4, 0], [5.8, 5], [10.3, 6], [10.6, 0], [18, 0]], t);
    s.headRot = tr([[0, 0.05], [0.5, -0.06], [1.0, 0.0], [1.4, 0.06], [2.5, 0.025], [3.6, 0.07], [4.8, 0.01],
      [5.5, -0.01], [6.1, 0.1], [8.0, 0.13], [9.4, 0.06], [10.35, 0.08], [10.55, -0.02, "out"],
      [12, -0.01], [12.5, -0.04], [14.0, 0.05], [15.5, 0.07], [15.95, 0.1], [16.5, 0.04], [18, 0.05]], t);
    s.lean = tr([[0, 0], [5.6, 0], [6.5, 20], [9.2, 24], [10.3, 34], [10.55, 14, "out"], [12, 4], [18, 2]], t);
    s.slide = tr([[0, 0], [5.6, 0], [6.6, 10], [10.3, 16], [10.6, 8], [12, 0], [18, 0]], t);
    s.breath = 0.009 * Math.sin((t / 3.1) * Math.PI * 2);
    // talking nods ride on the voice
    const [open, round] = lip(t);
    const tk = talking(t);
    s.headOffY = -2.5 * Math.sin(t * 9.0) * open * tk + 3 * Math.sin(t * 1.7);
    s.headOffX = 2 * Math.sin(t * 1.1);
    // ears: idle drift, twitches, perk at the box and the light
    const tw = (t0, a) => { const u = (t - t0) / 0.35; return u > 0 && u < 1 ? a * Math.sin(u * Math.PI) * (1 - u) * 2 : 0; };
    const perk = tr([[0, 0], [5.4, 0], [5.65, 1, "back"], [10.3, 1], [10.5, 1.6, "out"], [12.6, 1.4], [16, 0.8], [18, 0.6]], t);
    s.earL = 0.02 * Math.sin(t * 1.3) + tw(2.6, 0.14) + tw(9.6, 0.1) + perk * 0.05;
    s.earR = 0.02 * Math.sin(t * 1.5 + 1) - tw(2.75, 0.12) - tw(12.3, 0.1) - perk * 0.05;
    // tail wags more once the box opens
    const wag = tr([[0, 0.07], [10.4, 0.07], [11.0, 0.15], [15.5, 0.13], [18, 0.1]], t);
    s.tail = wag * Math.sin(t * Math.PI * 2 * 0.6) + 0.02;
    s.wind = tr([[0, 1], [10.3, 1], [10.6, 2.6, "out"], [13, 1.8], [18, 1.3]], t);
    // eyes widen with wonder
    s.widen = tr([[0, 0], [5.4, 0], [5.6, 0.07, "back"], [6.3, 0.02], [10.35, 0.02], [10.6, 0.16, "out"], [12.0, 0.08],
      [12.25, 0.26, "back"], [15.6, 0.22], [16.1, 0.12], [18, 0.12]], t);
    const blinks = [1.02, 2.3, 4.05, 6.15, 8.35, 9.85, 12.08, 14.5];
    s.blinkL = blinkAt(t, blinks);
    s.blinkR = blinkAt(t, blinks);
    // the wink (her left eye, viewer's right) with a squint on the other eye
    const wink = tr([[0, 0], [15.75, 0], [15.87, 1, "out"], [16.15, 1], [16.33, 0], [18, 0]], t);
    s.blinkR = Math.max(s.blinkR, wink);
    s.blinkL = Math.max(s.blinkL, wink * 0.28);
    // mouth: voice, a gasp, a closing smile
    const gasp = tr([[0, 0], [10.42, 0], [10.55, 0.55, "out"], [10.9, 0.3], [11.6, 0.1], [12.15, 0.1], [12.3, 0.5, "out"], [12.8, 0.3], [12.9, 0], [18, 0]], t);
    const grin = tr([[0, 0], [15.6, 0], [15.85, 0.22], [18, 0.2]], t);
    s.open = Math.max(open * tk, gasp, grin);
    s.round = tk ? round : gasp > 0.2 ? 0.8 : 0.2;
    // light
    s.boxLight = tr([[0, 0], [5.2, 0], [5.45, 0.35, "out"], [6, 0.2], [10.35, 0.3], [10.55, 1.35, "out"], [12, 1.4], [12.2, 1.7], [16, 1.5], [18, 1.35]], t)
      * (1 + 0.06 * Math.sin(t * 7.3) + 0.04 * Math.sin(t * 13.1));
    s.rim = 0.55 + 0.25 * s.boxLight;
    return s;
  }

  function camera(t) {
    // [time, scale, focus x, focus y, screen x, screen y]
    const K_ = [
      [0, 1.0, 540, 900, 540, 900],
      [4.95, 1.05, 560, 860, 560, 860],
      [6.4, 1.1, 598, 1110, 500, 1060],
      [10.3, 1.16, 600, 1110, 490, 1060],
      [11.95, 1.22, 600, 1110, 490, 1050],
      // the light carries us into a close-up
      [12.0, 1.38, 590, 834, 470, 800],
      [15.7, 1.46, 590, 834, 470, 790],
      [16.8, 1.0, 540, 760, 540, 640],
      [18, 0.99, 540, 760, 540, 640],
    ];
    let a = K_[0], b = K_[0], u = 0;
    for (let i = 0; i < K_.length - 1; i++) if (t >= K_[i][0] && t < K_[i + 1][0]) { a = K_[i]; b = K_[i + 1]; u = (t - a[0]) / (b[0] - a[0]); }
    if (t >= K_[K_.length - 1][0]) { a = b = K_[K_.length - 1]; }
    // the 11.95 -> 12.0 step is a cut; everything else eases
    const e = b[0] - a[0] < 0.1 ? 1 : smooth(u);
    const c = a.map((v, i) => lerp(v, b[i], e));
    // lid pop shake
    const sh = t > 10.4 && t < 10.9 ? (1 - (t - 10.4) / 0.5) * 5 : 0;
    c[4] += sh * Math.sin(t * 90); c[5] += sh * Math.cos(t * 77);
    // handheld drift
    c[4] += 3 * Math.sin(t * 0.7); c[5] += 3 * Math.sin(t * 0.53 + 1);
    return { S: c[1], fx: c[2], fy: c[3], gx: c[4], gy: c[5] };
  }

  // ---------- WebGL fox ----------
  const VS = `attribute vec2 p; varying vec2 vUv; void main(){ vUv=vec2(p.x*.5+.5, .5-p.y*.5); gl_Position=vec4(p,0.,1.); }`;
  const FS = `
precision highp float;
uniform sampler2D uTex; uniform vec2 uRes, uOrig; uniform float uT;
uniform float uLean, uSlide, uBreath, uHeadRot, uTurn, uTurnY, uEarL, uEarR, uTail, uWind;
uniform vec2 uHeadOff, uLook, uBox;
uniform float uWiden, uBlinkL, uBlinkR, uOpen, uRound, uBoxLight, uRim;
varying vec2 vUv;
vec2 rot(vec2 v, float a){ float c=cos(a), s=sin(a); return vec2(c*v.x-s*v.y, s*v.x+c*v.y); }
vec4 tex(vec2 q){ vec2 uv=(q-uOrig)/uRes; if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.) return vec4(0.); return texture2D(uTex, uv); }
vec2 ear(vec2 q, vec2 base, vec2 tip, float a){
  vec2 d=tip-base; float L2=dot(d,d); float t=dot(q-base,d)/L2;
  float lat=abs(d.x*(q.y-base.y)-d.y*(q.x-base.x))/sqrt(L2);
  float w=smoothstep(0.,1.,clamp(t,0.,1.25))*(1.-smoothstep(90.,150.,lat));
  return base+rot(q-base,-a*w);
}
vec2 eyeWarp(vec2 q, vec2 c, vec2 r){
  float e=length((q-c)/r); float wz=1.-smoothstep(.8,1.55,e);
  q=c+(q-c)/(1.+uWiden*wz);
  e=length((q-c)/r); float wl=1.-smoothstep(.4,.97,e);
  return q-uLook*(r.x/46.)*wl;
}
// eyelid: returns (mask, lashline) and lid colour
vec4 lid(vec2 q, vec2 c, vec2 r, float b, out float m){
  m=0.; if(b<.01) return vec4(0.);
  vec2 rr=r*(1.+uWiden*.4)*1.03;
  float dx=(q.x-c.x)/rr.x; if(abs(dx)>=1.) return vec4(0.);
  float sq=sqrt(1.-dx*dx);
  float yTop=c.y-rr.y*sq, yBot=c.y+rr.y*sq;
  float edge=mix(yTop-4., c.y+rr.y*.62*sq, b);
  float top=yTop-9.*smoothstep(0.,.35,b);
  if(q.y<top-2.||q.y>edge+3.) return vec4(0.);
  m=smoothstep(top-2.,top+3.,q.y)*(1.-smoothstep(edge-1.,edge+1.5,q.y));
  vec3 fur=vec3(0.); float yy=c.y-rr.y-22.;
  for(int i=-2;i<=2;i++){ for(int j=0;j<2;j++){ fur+=tex(vec2(q.x+float(i)*7., yy-float(j)*8.)).rgb; } }
  fur/=10.;
  float ly=clamp((q.y-top)/max(edge-top,1.),0.,1.);
  fur*=.78+.16*sin(ly*3.1416)-.12*smoothstep(.75,1.,ly);
  float lash=1.-smoothstep(1.2,3.2,abs(q.y-edge+1.));
  vec3 col=mix(fur, vec3(.12,.05,.03), lash*smoothstep(.15,.5,b));
  m=max(m, lash*smoothstep(.15,.5,b)*step(q.y,edge+3.));
  return vec4(col,1.);
}
void main(){
  vec2 p=uOrig+vUv*uRes;
  vec2 q=p;
  // body: slide, lean, breathing
  q.x-=uSlide;
  float hgt=clamp((785.-q.y)/700.,0.,1.3);
  q.x-=uLean*pow(hgt,1.3);
  q.y=785.+(q.y-785.)/(1.+uBreath);
  // tail swing + fur in the breeze
  vec2 tb=vec2(470.,690.);
  float tailM=(1.-smoothstep(430.,520.,q.x))*smoothstep(470.,520.,q.y);
  float td=clamp(length(q-tb)/280.,0.,1.); float tw=tailM*td*td;
  q=tb+rot(q-tb,-uTail*tw);
  q+=vec2(sin(q.y*.07+uT*5.)*1.6, sin(q.x*.05+uT*7.)*2.)*tw*uWind;
  // head
  float hw=(1.-smoothstep(470.,575.,q.y))*(1.-(1.-smoothstep(380.,470.,q.x))*smoothstep(460.,520.,q.y));
  vec2 hc=vec2(615.,540.);
  q-=uHeadOff*hw;
  q=hc+rot(q-hc,-uHeadRot*hw);
  // face slides inside the head outline: a cheap head turn
  float fe=length((q-vec2(632.,415.))/vec2(215.,165.)); float fw=1.-smoothstep(.45,1.05,fe);
  q-=vec2(uTurn,uTurnY)*fw;
  // ears
  q=ear(q,vec2(440.,250.),vec2(335.,25.),uEarL);
  q=ear(q,vec2(745.,245.),vec2(830.,25.),uEarR);
  // tuft of hair and ear-fur in the breeze
  float tuw=smoothstep(185.,95.,q.y)*(1.-smoothstep(30.,75.,abs(q.x-605.)));
  q.x-=tuw*sin(uT*4.3+q.y*.06)*3.5*uWind;
  float earTip=smoothstep(140.,40.,q.y);
  q.x-=earTip*sin(uT*3.1+q.y*.09)*1.2*uWind;
  // vest flutters
  float vw=smoothstep(528.,556.,q.y)*(1.-smoothstep(600.,650.,q.y))*(1.-smoothstep(85.,115.,abs(q.x-615.)));
  vw+=smoothstep(640.,690.,q.y)*(1.-smoothstep(700.,720.,q.y))*(1.-smoothstep(90.,110.,abs(q.x-615.)));
  q+=vec2(sin(q.y*.15-uT*9.),cos(q.x*.12-uT*8.)*.6)*1.3*vw*uWind;
  // eyes
  vec2 cL=vec2(547.,386.), rL=vec2(46.,38.), cR=vec2(707.,384.), rR=vec2(33.,37.);
  vec2 q0=q;
  if(length((q-cL)/rL)<1.7) q=eyeWarp(q,cL,rL);
  else if(length((q-cR)/rR)<1.7) q=eyeWarp(q,cR,rR);
  // mouth: open the jaw along the smile curve
  float cx=636., hwm=74.*(1.-.28*uRound);
  float yl=500.2-.0096055*(q.x-635.6)*(q.x-635.6);
  float dx=(q.x-cx)/hwm;
  float d=uOpen*18.*pow(max(0.,1.-dx*dx),.75);
  bool inMouth=false; float mY=0.;
  if(d>.3 && q.y>yl+.5 && q.y<yl+d){ inMouth=true; mY=(q.y-yl)/d; }
  else if(q.y>=yl+d && q.y<yl+d+75.){ q.y-=d*(1.-smoothstep(0.,75.,q.y-yl-d)); }
  vec4 c=tex(q);
  if(inMouth){
    vec3 m=mix(vec3(.18,.02,.04),vec3(.42,.08,.1),mY);
    vec2 tq=vec2((q0.x-cx)/(hwm*.55),(mY-.95)/.55);
    float tongue=1.-smoothstep(.85,1.,length(tq));
    m=mix(m,vec3(.92,.42,.45),tongue);
    m=mix(m,vec3(.97,.94,.9),(1.-smoothstep(.12,.22,mY))*(1.-smoothstep(.25,.35,abs(dx)))*step(.35,uOpen));
    c=vec4(m,1.);
  }
  // eyelids drawn in head space
  float mk; vec4 lc=lid(q0,cL,rL,uBlinkL,mk); if(mk>0.) c.rgb=mix(c.rgb,lc.rgb,mk);
  lc=lid(q0,cR,rR,uBlinkR,mk); if(mk>0.) c.rgb=mix(c.rgb,lc.rgb,mk);
  // light: warm rim from the window, glow from the box
  float a=c.a;
  float aR=tex(q+vec2(9.,-4.)).a;
  float rim=clamp(a-aR,0.,1.);
  vec3 col=c.rgb;
  col+=rim*uRim*vec3(1.,.82,.55);
  float bd=length((p-uBox)*vec2(1.,.8));
  float bl=uBoxLight*exp(-bd/330.);
  float under=smoothstep(330.,520.,p.y)*(1.-smoothstep(560.,720.,p.y));
  col+=col*bl*vec3(.8,.55,.25)*(.35+.45*under);
  col+=bl*.04*vec3(1.,.8,.45);
  col=clamp(col,0.,1.);
  gl_FragColor=vec4(col*a,a);
}`;

  let gl, prog, U = {}, ready = false, imgFox;
  function initGL() {
    const cv = document.getElementById("fox");
    gl = cv.getContext("webgl", { premultipliedAlpha: true, preserveDrawingBuffer: true, antialias: false });
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imgFox);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    for (const n of ["uTex", "uRes", "uOrig", "uT", "uLean", "uSlide", "uBreath", "uHeadRot", "uTurn", "uTurnY", "uEarL", "uEarR", "uTail", "uWind",
      "uHeadOff", "uLook", "uBox", "uWiden", "uBlinkL", "uBlinkR", "uOpen", "uRound", "uBoxLight", "uRim"]) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uTex, 0);
    gl.uniform2f(U.uRes, 730, 890);
    gl.uniform2f(U.uOrig, 160, -60);
    gl.uniform2f(U.uBox, 640, 850);
    gl.viewport(0, 0, cv.width, cv.height);
    ready = true;
  }

  // ---------- DOM refs ----------
  const $ = (id) => document.getElementById(id);
  let els;
  function setup() {
    els = {
      cam: $("cam"), bgPar: $("bg-par"), wbg: $("world-bg"), wfg: $("world-fg"), bloomBg: $("bloom-bg"),
      rays: [1, 2, 3, 4].map((i) => $("ray" + i)), shadow: $("shadow"),
      fox: $("fox"), foxBloom: $("fox-bloom"), box: $("box-in"), lid: $("lid"), beam: $("beam"), glow: $("box-glow"),
      inside: document.querySelector(".f-inside"), parts: $("parts"), faceLight: $("face-light"), flash: $("flash"),
    };
    els.wbg.style.transform = worldCss;
    els.wfg.style.transform = worldCss;
    // god rays from the window, in world (source) coordinates
    const rays = [[1000, 120, 128, 150, 0.9], [1020, 260, 134, 110, 0.7], [960, 40, 124, 90, 0.6], [1050, 380, 140, 130, 0.5]];
    rays.forEach(([x, y, ang, h, o], i) => {
      const r = els.rays[i];
      r.style.left = x + "px"; r.style.top = y - h / 2 + "px"; r.style.height = h + "px";
      r.dataset.base = o; r.style.transform = `rotate(${ang}deg)`;
    });
  }

  // ---------- particles ----------
  function drawParticles(t, cam, s) {
    const cv = els.parts, ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    const toScreen = (bx, by) => [cam.gx + cam.S * (bx - cam.fx), cam.gy + cam.S * (by - cam.fy)];
    // dust floating in the window light
    for (let i = 0; i < 70; i++) {
      const h1 = hash(i), h2 = hash(i + 100), h3 = hash(i + 200);
      const span = 1300;
      const by = ((h2 * span - t * (14 + 18 * h3)) % span + span) % span + 150;
      const bx = 380 + h1 * 900 + 26 * Math.sin(t * (0.4 + h3) + i);
      const [x, y] = toScreen(bx, by);
      const inBeam = clamp(1 - Math.abs((bx - 1100) * 0.6 + (by - 500) * 0.8) / 520, 0, 1);
      const a = (0.15 + 0.6 * inBeam) * (0.5 + 0.5 * Math.sin(t * (1.5 + h1 * 2) + i));
      const r = (1.2 + 2.6 * h3) * cam.S;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 3);
      g.addColorStop(0, `rgba(255,236,190,${a})`); g.addColorStop(1, "rgba(255,220,150,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill();
    }
    // magic: twinkles around the box once it appears, a fountain once it opens
    const [bx0, by0] = [650, 1340];
    const appear = clamp((t - 5.2) / 0.3, 0, 1);
    if (appear > 0) {
      const n = t < 10.4 ? 22 : 90;
      for (let i = 0; i < n; i++) {
        const h1 = hash(i * 3 + 7), h2 = hash(i * 5 + 11), h3 = hash(i * 7 + 13);
        let x, y, a, r;
        if (t < 10.4 || i < 22) {
          // orbiting twinkles
          const ang = h1 * 6.283 + t * (0.8 + h2);
          const rad = 50 + 70 * h2 + 30 * Math.sin(t * 2 + i);
          x = bx0 + Math.cos(ang) * rad; y = by0 - 20 + Math.sin(ang) * rad * 0.5 - 30 * h3;
          a = appear * (0.5 + 0.5 * Math.sin(t * (6 + 5 * h3) + i * 2)) * (t < 10.4 ? 0.8 : 1);
          r = 2 + 4 * h3;
          // burst when it first appears
          const bu = (t - 5.2) / 0.8;
          if (bu > 0 && bu < 1) { x = bx0 + (x - bx0) * (0.3 + bu * 1.4); a *= 1.5; }
        } else {
          // fountain rising from the open box, cycling every 2.2 s
          const period = 2.2, t0 = 10.45 + h1 * period;
          let age = t - t0; if (age < 0) continue;
          age = age % period; const u = age / period;
          x = bx0 + (h2 - 0.5) * 60 + (h2 - 0.5) * 260 * u + 20 * Math.sin(u * 8 + i);
          y = by0 - 20 - u * (420 + 300 * h3);
          a = Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(t * 9 + i));
          r = 2 + 5 * h3 * (1 - u * 0.5);
        }
        const [sx, sy] = toScreen(x, y);
        const R = r * cam.S;
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 4);
        g.addColorStop(0, `rgba(255,252,230,${a})`); g.addColorStop(0.3, `rgba(255,214,120,${a * 0.6})`); g.addColorStop(1, "rgba(255,170,60,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, R * 4, 0, 7); ctx.fill();
        // star cross on the brightest
        if (h3 > 0.7 && a > 0.4) {
          ctx.strokeStyle = `rgba(255,248,220,${a * 0.8})`; ctx.lineWidth = 1.2;
          ctx.beginPath(); ctx.moveTo(sx - R * 5, sy); ctx.lineTo(sx + R * 5, sy); ctx.moveTo(sx, sy - R * 5); ctx.lineTo(sx, sy + R * 5); ctx.stroke();
        }
      }
    }
  }

  function render(t) {
    if (!els) return;
    t = clamp(t, 0, 18);
    const s = state(t), cam = camera(t);
    els.cam.style.transform = `translate(${cam.gx - cam.S * cam.fx}px, ${cam.gy - cam.S * cam.fy}px) scale(${cam.S})`;
    // background sits deeper: it scales a touch less than the camera
    const ps = 1 / (1 + 0.12 * (cam.S - 1));
    els.bgPar.style.transformOrigin = `${cam.fx}px ${cam.fy}px`;
    els.bgPar.style.transform = `scale(${ps})`;
    els.bloomBg.style.opacity = (0.35 + 0.08 * Math.sin(t * 0.9)).toFixed(3);
    els.rays.forEach((r, i) => { r.style.opacity = (r.dataset.base * (0.55 + 0.25 * Math.sin(t * (0.6 + i * 0.23) + i * 2))).toFixed(3); });
    els.shadow.style.transform = `translateX(${s.slide + s.lean * 0.15}px)`;

    if (ready) {
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uLean, s.lean); gl.uniform1f(U.uSlide, s.slide); gl.uniform1f(U.uBreath, s.breath);
      gl.uniform1f(U.uHeadRot, s.headRot); gl.uniform1f(U.uTurn, s.turn); gl.uniform1f(U.uTurnY, s.turnY);
      gl.uniform2f(U.uHeadOff, s.headOffX, s.headOffY);
      gl.uniform1f(U.uEarL, s.earL); gl.uniform1f(U.uEarR, s.earR); gl.uniform1f(U.uTail, s.tail); gl.uniform1f(U.uWind, s.wind);
      gl.uniform2f(U.uLook, s.lookX, s.lookY); gl.uniform1f(U.uWiden, s.widen);
      gl.uniform1f(U.uBlinkL, s.blinkL); gl.uniform1f(U.uBlinkR, s.blinkR);
      gl.uniform1f(U.uOpen, s.open); gl.uniform1f(U.uRound, s.round);
      gl.uniform1f(U.uBoxLight, s.boxLight); gl.uniform1f(U.uRim, s.rim);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // bloom: a soft, bright copy of the fox screened on top
      const bc = els.foxBloom.getContext("2d");
      bc.clearRect(0, 0, 365, 445);
      bc.filter = "blur(7px) brightness(1.15) contrast(1.5) saturate(1.3)";
      bc.drawImage(els.fox, 0, 0, 365, 445);
      bc.filter = "none";
      els.foxBloom.style.opacity = (0.2 + 0.08 * clamp(s.boxLight, 0, 1.5)).toFixed(3);
    }

    // box: pops into existence, trembles, opens
    const ap = tr([[0, 0], [5.2, 0], [5.55, 1, "back"], [18, 1]], t);
    const jit = t > 9.5 && t < 10.38 ? Math.sin(t * 60) * 2.2 * (t - 9.5) : 0;
    const hop = t > 10.38 && t < 10.7 ? -Math.sin(((t - 10.38) / 0.32) * Math.PI) * 10 : 0;
    els.box.style.opacity = clamp(ap * 3, 0, 1).toFixed(3);
    els.box.style.transform = `translateY(${hop}px) scale(${Math.max(0.001, ap * 1.75)}) rotate(${jit}deg)`;
    const lidA = tr([[0, 0], [10.38, 0], [10.6, 112, "out"], [10.85, 96], [11.1, 102], [18, 100]], t);
    els.lid.style.transform = `rotateX(${lidA}deg)`;
    const op = clamp((lidA - 10) / 90, 0, 1);
    els.beam.style.opacity = (op * (0.85 + 0.1 * Math.sin(t * 11))).toFixed(3);
    els.beam.style.transform = `scaleX(${0.6 + 0.4 * op}) scaleY(${0.3 + 0.7 * op})`;
    const glowA = ap * (0.35 + 0.15 * Math.sin(t * 4)) + op * 0.6;
    els.glow.style.opacity = clamp(glowA, 0, 1).toFixed(3);
    els.glow.style.transform = `scale(${0.42 + 0.22 * op + 0.03 * Math.sin(t * 6)})`;

    // warm light washing over her face from below (screen space)
    const fl = els.faceLight.getContext("2d");
    fl.clearRect(0, 0, 540, 960);
    const L = clamp((s.boxLight - 0.3) / 1.2, 0, 1);
    if (L > 0) {
      const fxs = (cam.gx + cam.S * (590 - cam.fx)) / 2, fys = (cam.gy + cam.S * (930 - cam.fy)) / 2;
      const g = fl.createRadialGradient(fxs, fys, 0, fxs, fys, 260 * cam.S);
      g.addColorStop(0, `rgba(255,200,120,${0.4 * L})`); g.addColorStop(1, "rgba(255,180,90,0)");
      fl.fillStyle = g; fl.fillRect(0, 0, 540, 960);
    }
    // light flash that carries the cut into the close-up
    const flash = Math.max(tr([[0, 0], [10.38, 0], [10.48, 0.55, "out"], [10.9, 0], [18, 0]], t), tr([[0, 0], [11.7, 0], [11.98, 0.9], [12.0, 0.9], [12.45, 0, "out"], [18, 0]], t));
    els.flash.style.opacity = flash.toFixed(3);

    drawParticles(t, cam, s);
  }

  function boot() {
    setup();
    imgFox = new Image();
    const p = new Promise((res) => {
      imgFox.onload = () => { initGL(); render(window.__lastT || 0); res(); };
      imgFox.onerror = () => res();
    });
    imgFox.src = "assets/fox.png";
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady.luma = p;
    render(0);
  }
  window.LumaRig = { render: (t) => { window.__lastT = t; render(t); }, state, camera };
  boot();
})();
