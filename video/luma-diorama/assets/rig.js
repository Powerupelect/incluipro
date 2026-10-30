/* Luma diorama rig: the reference picture brought to life with a fixed camera.
   One full-frame WebGL pass warps the room and Luma separately; every frame is a pure function of t. */
(function () {
  const SW = 941, SH = 1672; // source picture size; the canvas is 1080x1920
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (u) => u * u * u * (u * (u * 6 - 15) + 10);
  const lerp = (a, b, u) => a + (b - a) * u;
  function tr(keys, t) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
      if (t < t1) return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
    }
    return keys[keys.length - 1][1];
  }
  function blinkAt(t, times, dur = 0.26) {
    let b = 0;
    for (const t0 of times) {
      const u = (t - t0) / dur;
      if (u < 0 || u > 1) continue;
      b = Math.max(b, u < 0.32 ? smooth(u / 0.32) : u < 0.44 ? 1 : 1 - smooth((u - 0.44) / 0.56));
    }
    return b;
  }
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const pulse = (t, t0, d) => { const u = (t - t0) / d; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };

  // ---------- the performance: small, natural reactions ----------
  function state(t) {
    const s = {};
    // she glances toward the window, then back to us
    s.lookX = tr([[0, 0], [2.3, 0], [2.6, 7], [3.5, 7], [3.85, 0], [8, 0]], t);
    s.lookY = tr([[0, 0], [2.3, 0], [2.6, -2], [3.5, -2], [3.85, 0], [8, 0]], t);
    s.turn = tr([[0, 0], [2.35, 0], [2.75, 5], [3.5, 5], [3.95, 0], [8, 0]], t);
    s.headRot = 0.018 * Math.sin(t * 0.9) + tr([[0, 0], [2.4, 0], [2.8, 0.02], [3.6, 0.02], [4.0, 0], [4.9, 0], [5.4, 0.05], [6.6, 0.045], [7.3, 0.01], [8, 0]], t);
    s.headOffX = 1.5 * Math.sin(t * 0.7 + 0.5);
    s.headOffY = 1.6 * Math.sin(t * 1.55) - 2.5 * pulse(t, 5.0, 1.4);
    // weight shift and breathing
    s.sway = 3.0 * Math.sin(t * 0.78 + 0.3);
    s.breath = 0.006 * Math.sin((t / 3.0) * Math.PI * 2);
    // ears: idle drift, a twitch toward the window, a happy flick
    s.earL = 0.015 * Math.sin(t * 1.2) + 0.09 * pulse(t, 5.55, 0.32) * Math.sin((t - 5.55) * 20);
    s.earR = 0.015 * Math.sin(t * 1.4 + 1) - 0.07 * pulse(t, 2.45, 0.5) + 0.05 * pulse(t, 6.4, 0.3) * Math.sin((t - 6.4) * 22);
    // tail: slow sway with a happier swish when she smiles
    s.tail = 0.05 * Math.sin(t * 2.1 - 0.6) + 0.06 * pulse(t, 5.0, 1.0) * Math.sin((t - 5.0) * 7);
    s.wind = 1;
    // eyes and mouth
    const blinks = [1.35, 4.15, 4.45, 7.0];
    s.blinkL = blinkAt(t, blinks);
    s.blinkR = blinkAt(t, blinks);
    s.widen = 0.03 * pulse(t, 2.4, 1.3) + 0.02 * pulse(t, 5.0, 1.6);
    s.open = 0.1 + 0.08 * Math.sin(t * 1.1) * 0.5 + 0.22 * pulse(t, 5.0, 1.6);
    // light: lanterns flicker, window light breathes
    s.lanternA = 0.75 + 0.12 * Math.sin(t * 9.1) + 0.08 * Math.sin(t * 23.7 + 1) + 0.05 * Math.sin(t * 4.3);
    s.lanternB = 0.7 + 0.1 * Math.sin(t * 8.3 + 2) + 0.07 * Math.sin(t * 19.9) + 0.05 * Math.sin(t * 3.7 + 1);
    s.sun = 0.85 + 0.15 * Math.sin(t * 0.8 + 0.7);
    return s;
  }

  const VS = `attribute vec2 p; varying vec2 vUv; void main(){ vUv=vec2(p.x*.5+.5,.5-p.y*.5); gl_Position=vec4(p,0.,1.); }`;
  const FS = `
precision highp float;
uniform sampler2D uFox, uBg; uniform vec2 uSrc; uniform float uT;
uniform float uSway, uBreath, uHeadRot, uTurn, uEarL, uEarR, uTail, uWind;
uniform vec2 uHeadOff, uLook;
uniform float uWiden, uBlinkL, uBlinkR, uOpen, uSun;
varying vec2 vUv;
vec2 rot(vec2 v,float a){ float c=cos(a),s=sin(a); return vec2(c*v.x-s*v.y,s*v.x+c*v.y); }
vec4 fox(vec2 q){ return texture2D(uFox, q/uSrc); }
vec3 bg(vec2 q){ return texture2D(uBg, clamp(q/uSrc,vec2(.0005),vec2(.9995))).rgb; }
float box(vec2 q, vec4 r, float f){ return smoothstep(r.x-f,r.x+f,q.x)*(1.-smoothstep(r.z-f,r.z+f,q.x))*smoothstep(r.y-f,r.y+f,q.y)*(1.-smoothstep(r.w-f,r.w+f,q.y)); }
vec2 ear(vec2 q, vec2 base, vec2 tip, float a){
  vec2 d=tip-base; float L2=dot(d,d); float t=dot(q-base,d)/L2;
  float lat=abs(d.x*(q.y-base.y)-d.y*(q.x-base.x))/sqrt(L2);
  float w=smoothstep(0.,1.,clamp(t,0.,1.25))*(1.-smoothstep(110.,190.,lat));
  return base+rot(q-base,-a*w);
}
vec2 eyeWarp(vec2 q, vec2 c, vec2 r){
  float e=length((q-c)/r); float wz=1.-smoothstep(.8,1.5,e);
  q=c+(q-c)/(1.+uWiden*wz);
  e=length((q-c)/r); float wl=1.-smoothstep(.4,.97,e);
  return q-uLook*(r.x/60.)*wl;
}
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y); }
// eyelid painted in the fur colour around that eye, with fine strands and a rounded shading
vec3 lid(vec2 q, vec2 c, vec2 r, vec3 furCol, float b, out float m){
  m=0.; if(b<.01) return vec3(0.);
  vec2 rr=r*1.05;
  float dx=(q.x-c.x)/rr.x; if(abs(dx)>=1.) return vec3(0.);
  float sq=sqrt(1.-dx*dx);
  float yTop=c.y-rr.y*sq;
  float edge=mix(yTop-4.,c.y+rr.y*.86*sq,b);
  float top=yTop-6.*smoothstep(0.,.35,b);
  if(q.y<top-10.||q.y>edge+3.) return vec3(0.);
  m=smoothstep(top-10.,top+10.,q.y)*(1.-smoothstep(edge-1.,edge+1.5,q.y));
  float ly=clamp((q.y-top)/max(edge-top,1.),0.,1.);
  float strands=vnoise(vec2(q.x*.45,q.y*.12))*.6+vnoise(vec2(q.x*1.1,q.y*.3))*.4;
  vec3 fur=furCol*(.9+.18*strands);
  fur*=1.02+.06*(1.-ly)-.25*smoothstep(.6,1.,ly)-.1*dx*dx;
  float lash=1.-smoothstep(1.4,3.6,abs(q.y-edge+1.));
  float lb=lash*smoothstep(.15,.5,b);
  m=max(m,lb*step(q.y,edge+3.));
  return mix(fur,vec3(.1,.05,.03),lb);
}
void main(){
  vec2 p=vUv*uSrc;
  // ---------------- the room ----------------
  vec2 qb=p;
  // curtain behind her, rippling in the breeze from the window
  float cw=box(p,vec4(525.,0.,700.,430.),18.)*smoothstep(0.,260.,p.y);
  qb.x-=sin(p.y*.022-uT*1.7)*3.*cw*uWind; qb.y-=sin(p.x*.05-uT*1.3)*1.2*cw;
  // hanging plant leaves (top)
  float pw=box(p,vec4(250.,0.,505.,340.),20.)*smoothstep(40.,330.,p.y);
  qb.x-=sin(uT*1.15+p.y*.012)*3.2*pw;
  // hanging lantern on the right: a gentle pendulum
  float lw=box(p,vec4(860.,0.,941.,215.),10.);
  vec2 piv=vec2(905.,0.); qb=mix(qb,piv+rot(qb-piv,-.012*sin(uT*1.25)),lw);
  // window flowers and left shelf plants
  float fw=box(p,vec4(830.,455.,941.,620.),14.)+box(p,vec4(0.,470.,120.,610.),14.);
  qb.x-=sin(uT*1.6+p.y*.04)*1.8*fw;
  // blurred foreground flowers (bottom left)
  float ffw=box(p,vec4(0.,1330.,270.,1672.),30.);
  qb+=vec2(sin(uT*1.05+p.y*.006)*4.,cos(uT*.9)*1.5)*ffw;
  vec3 room=bg(qb);
  // ---------------- Luma ----------------
  vec2 q=p;
  float hgt=clamp((1505.-q.y)/1100.,0.,1.2);
  q.x-=uSway*pow(hgt,1.4);
  q.y=1505.+(q.y-1505.)/(1.+uBreath);
  float chest=box(q,vec4(430.,900.,780.,1200.),60.);
  q.x=600.+(q.x-600.)/(1.+uBreath*1.2*chest);
  // tail
  vec2 tb=vec2(455.,1235.);
  float tailM=(1.-smoothstep(400.,470.,q.x))*smoothstep(880.,930.,q.y)*(1.-smoothstep(1390.,1430.,q.y));
  float td=clamp(length(q-tb)/360.,0.,1.); float tw=tailM*td*td;
  q=tb+rot(q-tb,-uTail*tw);
  q+=vec2(sin(q.y*.06+uT*4.)*1.4,sin(q.x*.05+uT*5.)*1.6)*tw*uWind;
  // head
  float hw=(1.-smoothstep(850.,935.,q.y))*(1.-(1.-smoothstep(280.,360.,q.x))*smoothstep(820.,880.,q.y));
  vec2 hc=vec2(590.,925.);
  q-=uHeadOff*hw;
  q=hc+rot(q-hc,-uHeadRot*hw);
  float fe=length((q-vec2(575.,700.))/vec2(235.,190.)); float fwt=1.-smoothstep(.45,1.05,fe);
  q.x-=uTurn*fwt;
  q=ear(q,vec2(360.,565.),vec2(115.,340.),uEarL);
  q=ear(q,vec2(640.,470.),vec2(720.,140.),uEarR);
  // tuft and ear fur in the breeze
  float tuw=smoothstep(445.,345.,q.y)*(1.-smoothstep(40.,85.,abs(q.x-470.)));
  q.x-=tuw*sin(uT*3.6+q.y*.06)*2.6*uWind;
  q.x-=smoothstep(330.,150.,q.y)*sin(uT*2.7+q.y*.08)*1.*uWind;
  // vest collar and hem
  float vw=box(q,vec4(455.,875.,735.,945.),25.)+box(q,vec4(470.,1110.,760.,1170.),20.);
  q+=vec2(sin(q.y*.14-uT*5.),cos(q.x*.1-uT*4.)*.5)*.9*vw*uWind;
  // eyes
  vec2 cL=vec2(449.,706.), rL=vec2(62.,52.), cR=vec2(676.,640.), rR=vec2(56.,58.);
  vec2 q0=q;
  if(length((q-cL)/rL)<1.6) q=eyeWarp(q,cL,rL);
  else if(length((q-cR)/rR)<1.6) q=eyeWarp(q,cR,rR);
  // mouth: a soft, small opening along the smile
  float cx=584., hwm=86.;
  float yl=824.9-.0080413*(q.x-565.7)*(q.x-565.7);
  float dx=(q.x-cx)/hwm;
  float d=uOpen*11.*pow(max(0.,1.-dx*dx),.8);
  bool inM=false; float mY=0.;
  if(d>.3&&q.y>yl+.5&&q.y<yl+d){ inM=true; mY=(q.y-yl)/d; }
  else if(q.y>=yl+d&&q.y<yl+d+60.){ q.y-=d*(1.-smoothstep(0.,60.,q.y-yl-d)); }
  vec4 c=fox(q);
  if(inM){
    vec3 m=mix(vec3(.2,.03,.05),vec3(.45,.1,.12),mY);
    float tongue=1.-smoothstep(.8,1.,length(vec2((q0.x-cx-10.)/(hwm*.5),(mY-.95)/.6)));
    m=mix(m,vec3(.9,.45,.48),tongue);
    c=vec4(m,1.);
  }
  float mk; vec3 lc=lid(q0,cL,rL,vec3(.83,.37,.13),uBlinkL,mk); if(mk>0.) c.rgb=mix(c.rgb,lc,mk);
  lc=lid(q0,cR,rR,vec3(.95,.48,.15),uBlinkR,mk); if(mk>0.) c.rgb=mix(c.rgb,lc,mk);
  // warm rim from the window on her right edge, breathing with the sun
  float aR=fox(q+vec2(10.,-5.)).a;
  c.rgb+=clamp(c.a-aR,0.,1.)*vec3(1.,.8,.5)*.35*uSun;
  vec3 col=mix(room,c.rgb,c.a);
  // where she has not moved, show the original picture untouched (keeps soft fur edges exact)
  float still=1.-smoothstep(.25,1.5,length(q-p));
  float eyeZone=1.-smoothstep(1.2,1.5,min(length((p-cL)/rL),length((p-cR)/rR)));
  still*=1.-eyeZone*step(.01,max(uBlinkL,uBlinkR));
  if(!inM) col=mix(col,fox(p).rgb,still);
  gl_FragColor=vec4(col,1.);
}`;

  let gl, U = {}, ready = false, els;
  function tex(unit, img) {
    const t = gl.createTexture(); gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  function initGL(imgFox, imgBg) {
    const cv = els.gl;
    gl = cv.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    tex(0, imgFox); tex(1, imgBg);
    for (const n of ["uFox", "uBg", "uSrc", "uT", "uSway", "uBreath", "uHeadRot", "uTurn", "uEarL", "uEarR", "uTail", "uWind",
      "uHeadOff", "uLook", "uWiden", "uBlinkL", "uBlinkR", "uOpen", "uSun"]) U[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(U.uFox, 0); gl.uniform1i(U.uBg, 1); gl.uniform2f(U.uSrc, SW, SH);
    gl.viewport(0, 0, cv.width, cv.height);
    ready = true;
  }

  // dust and tiny bokeh drifting through the window light (canvas px)
  function drawParticles(t) {
    const cv = els.parts, ctx = cv.getContext("2d");
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < 90; i++) {
      const h1 = hash(i), h2 = hash(i + 50), h3 = hash(i + 150), h4 = hash(i + 250);
      const span = 2100;
      const y = (((h2 * span - t * (10 + 16 * h3)) % span) + span) % span - 90;
      const x = 120 + h1 * 960 + 22 * Math.sin(t * (0.3 + h3 * 0.5) + i) + t * 6 * (h4 - 0.5);
      // brighter inside the shaft of light falling from the window (top right to lower left)
      const shaft = clamp(1 - Math.abs((x - 860) * 0.75 + (y - 600) * 0.45) / 430, 0, 1);
      const tw = 0.5 + 0.5 * Math.sin(t * (1.2 + 2 * h1) + i * 1.7);
      const big = h4 > 0.93;
      const a = (big ? 0.12 : 0.1 + 0.55 * shaft) * tw;
      const r = big ? 7 + 8 * h3 : 1.1 + 2.2 * h3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
      g.addColorStop(0, `rgba(255,238,200,${a})`); g.addColorStop(1, "rgba(255,220,160,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 7); ctx.fill();
    }
  }

  function render(t) {
    if (!els) return;
    t = clamp(t, 0, 8);
    const s = state(t);
    if (ready) {
      gl.uniform1f(U.uT, t);
      gl.uniform1f(U.uSway, s.sway); gl.uniform1f(U.uBreath, s.breath); gl.uniform1f(U.uHeadRot, s.headRot);
      gl.uniform1f(U.uTurn, s.turn); gl.uniform2f(U.uHeadOff, s.headOffX, s.headOffY);
      gl.uniform1f(U.uEarL, s.earL); gl.uniform1f(U.uEarR, s.earR); gl.uniform1f(U.uTail, s.tail); gl.uniform1f(U.uWind, s.wind);
      gl.uniform2f(U.uLook, s.lookX, s.lookY); gl.uniform1f(U.uWiden, s.widen);
      gl.uniform1f(U.uBlinkL, s.blinkL); gl.uniform1f(U.uBlinkR, s.blinkR); gl.uniform1f(U.uOpen, s.open); gl.uniform1f(U.uSun, s.sun);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    els.lanternA.style.opacity = clamp(s.lanternA, 0, 1).toFixed(3);
    els.lanternB.style.opacity = clamp(s.lanternB, 0, 1).toFixed(3);
    els.bloom.style.opacity = (0.32 * s.sun).toFixed(3);
    els.rays.style.opacity = (0.55 * s.sun).toFixed(3);
    drawParticles(t);
  }

  function boot() {
    const $ = (id) => document.getElementById(id);
    els = { gl: $("dio-gl"), parts: $("dio-parts"), lanternA: $("lantern-a"), lanternB: $("lantern-b"), bloom: $("dio-bloom"), rays: $("dio-rays") };
    const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    const p = Promise.all([load("assets/fox.png"), load("assets/plate.jpg")]).then(([f, b]) => { if (f && b) initGL(f, b); render(window.__dioT || 0); });
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady.diorama = p;
    render(0);
  }
  window.LumaDiorama = { render: (t) => { window.__dioT = t; render(t); }, state };
  boot();
})();
