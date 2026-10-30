/* "Um dia na casa da Luma": four illustrated scenes, each brought to life by a small image-warp rig,
   joined by whip pans that follow her through the house. Every frame is a pure function of t. */
(function () {
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
  const pulse = (t, t0, d) => { const u = (t - t0) / d; return u > 0 && u < 1 ? Math.sin(u * Math.PI) : 0; };
  const hash = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

  // ---------- the four scenes (coordinates in each picture's own pixels) ----------
  // cam: [time, centre x, centre y, view height]; times are local to the scene
  const SCENES = [
    {
      id: "quarto", src: "assets/quarto.jpg", size: [941, 1672],
      cam: [[0, 470, 836, 1672], [2.9, 478, 800, 1560]],
      head: { c: [575, 640], r: [330, 300], pivot: [590, 925] },
      eyes: [{ c: [449, 706], r: [62, 52], fur: [0.83, 0.37, 0.13] }, { c: [676, 640], r: [56, 58], fur: [0.95, 0.48, 0.15] }],
      tail: { c: [270, 1150], r: [230, 270], pivot: [455, 1235] },
      ears: [{ base: [360, 565], tip: [115, 340] }, { base: [640, 470], tip: [720, 140] }],
      tuft: { c: [470, 380], r: 60 },
      breath: { y0: 880, y1: 1505 },
      flora: [[525, 0, 700, 430, 3], [250, 0, 505, 340, 3], [0, 1330, 270, 1672, 4]],
      glows: [[165, 55, 95, 1.0, 0.82, 0.5], [905, 150, 75, 1.0, 0.8, 0.45]],
      perform: (t) => ({
        lookX: tr([[0, 0], [1.6, 0], [1.85, 9], [3, 9]], t), lookY: 0,
        headRot: 0.018 * Math.sin(t * 1.1) + tr([[0, 0], [1.5, 0], [1.95, 0.035], [3, 0.04]], t),
        turn: tr([[0, 0], [1.6, 0], [2.0, 6], [3, 6]], t),
        blink: blinkAt(t, [0.55]),
        earL: 0.012 * Math.sin(t * 1.3), earR: -0.07 * pulse(t, 1.0, 0.4) + 0.012 * Math.sin(t * 1.5),
        tail: 0.05 * Math.sin(t * 2.2), breath: 0.006 * Math.sin(t * 2.1),
      }),
    },
    {
      id: "mesa", src: "assets/mesa.jpg", size: [724, 543],
      cam: [[0, 412, 271.5, 543], [2.9, 404, 262, 505]],
      head: { c: [405, 175], r: [210, 175], pivot: [410, 330] },
      eyes: [{ c: [350, 222], r: [30, 28], fur: [0.9, 0.45, 0.13] }, { c: [440, 195], r: [26, 28], fur: [0.93, 0.49, 0.15] }],
      tail: { c: [255, 400], r: [110, 120], pivot: [330, 430] },
      ears: [{ base: [270, 150], tip: [195, 45] }, { base: [440, 110], tip: [495, 5] }],
      tuft: { c: [365, 75], r: 30 },
      breath: { y0: 290, y1: 470 },
      flora: [[600, 60, 724, 230, 2]],
      glows: [[255, 40, 40, 1.0, 0.8, 0.45]],
      perform: (t) => ({
        // a happy little wiggle with her paws on her cheeks
        lookX: 0, lookY: 0,
        headRot: 0.04 * Math.sin(t * 9.5) * tr([[0, 0.2], [0.3, 1], [1.6, 1], [2.1, 0.25], [3, 0.2]], t) + 0.02,
        turn: 0,
        blink: blinkAt(t, [1.75]),
        earL: 0.05 * Math.sin(t * 9.5 + 0.6) * 0.6, earR: -0.04 * Math.sin(t * 9.5 + 0.9) * 0.6,
        tail: 0.08 * Math.sin(t * 5.5), breath: 0.01 * Math.sin(t * 9.5 + 1.2),
      }),
    },
    {
      id: "queixo", src: "assets/queixo.jpg", size: [627, 627],
      cam: [[0, 392, 313.5, 627], [2.9, 398, 320, 585]],
      head: { c: [400, 290], r: [230, 210], pivot: [420, 470] },
      eyes: [{ c: [325, 335], r: [44, 33], fur: [0.89, 0.38, 0.07] }, { c: [462, 300], r: [34, 36], fur: [0.97, 0.51, 0.11] }],
      tail: { c: [100, 330], r: [120, 200], pivot: [200, 470] },
      ears: [{ base: [250, 250], tip: [125, 120] }, { base: [440, 190], tip: [465, 40] }],
      tuft: { c: [340, 160], r: 35 },
      breath: { y0: 400, y1: 540 },
      flora: [],
      glows: [],
      perform: (t) => ({
        // daydreaming: a slow, sleepy blink and a soft sway
        lookX: tr([[0, 0], [1.4, 0], [1.7, -5], [3, -5]], t), lookY: tr([[0, 0], [1.4, 0], [1.7, -4], [3, -4]], t),
        headRot: 0.03 * Math.sin(t * 1.4 - 0.5),
        turn: 0,
        blink: blinkAt(t, [0.6], 0.6),
        earL: 0.015 * Math.sin(t * 1.2), earR: 0.08 * pulse(t, 2.0, 0.35) * Math.sin((t - 2.0) * 25),
        tail: 0.05 * Math.sin(t * 1.8), breath: 0.008 * Math.sin(t * 1.9),
      }),
    },
    {
      id: "porsol", src: "assets/porsol.jpg", size: [627, 627],
      cam: [[0, 300, 313.5, 627], [0.6, 300, 313.5, 627], [2.9, 392, 312, 610]],
      head: { c: [270, 250], r: [140, 160], pivot: [290, 340] },
      eyes: [],
      tail: { c: [190, 470], r: [130, 110], pivot: [300, 500] },
      ears: [{ base: [205, 230], tip: [175, 165] }, { base: [295, 200], tip: [295, 135] }],
      tuft: { c: [245, 170], r: 32 },
      breath: { y0: 350, y1: 545 },
      flora: [[0, 0, 400, 80, 2.5], [0, 480, 627, 627, 3], [0, 240, 120, 480, 2]],
      glows: [[577, 228, 120, 1.0, 0.85, 0.55], [60, 215, 40, 1.0, 0.8, 0.45]],
      perform: (t) => ({
        lookX: 0, lookY: 0,
        headRot: 0.015 * Math.sin(t * 1.0) + tr([[0, 0], [1.0, 0], [1.6, 0.03], [3, 0.03]], t),
        turn: 0, blink: 0,
        earL: 0.02 * Math.sin(t * 1.3), earR: 0.07 * pulse(t, 0.9, 0.35) * Math.sin((t - 0.9) * 25),
        tail: 0.06 * Math.sin(t * 1.9), breath: 0.007 * Math.sin(t * 1.8),
      }),
    },
  ];
  // when each scene is on screen (global seconds) and how it leaves
  const START = [0, 2.5, 5.0, 7.5];
  const WHIP = 0.42; // whip pan length, centred on the cut

  const VS = `attribute vec2 p; varying vec2 vUv; void main(){ vUv=vec2(p.x*.5+.5,.5-p.y*.5); gl_Position=vec4(p,0.,1.); }`;
  const FS = `
precision highp float;
uniform sampler2D uTex; uniform vec2 uSize; uniform vec3 uCam; uniform float uT, uBlur, uSeed;
uniform vec4 uHead; uniform vec2 uHeadPivot; uniform float uHeadRot, uTurn;
uniform vec4 uEye0, uEye1; uniform vec3 uFur0, uFur1; uniform float uEyes, uBlink; uniform vec2 uLook;
uniform vec4 uTail; uniform vec2 uTailPivot; uniform float uTailRot;
uniform vec4 uEar0, uEar1; uniform float uEarL, uEarR;
uniform vec3 uTuft; uniform vec2 uBreathY; uniform float uBreath;
uniform vec4 uFl0, uFl1, uFl2; uniform vec3 uFlA;
uniform vec3 uG0, uG1; uniform vec3 uGc0, uGc1; uniform vec2 uGlow;
varying vec2 vUv;
vec2 rot(vec2 v,float a){ float c=cos(a),s=sin(a); return vec2(c*v.x-s*v.y,s*v.x+c*v.y); }
vec3 tex(vec2 q){ return texture2D(uTex, clamp(q/uSize,vec2(.0005),vec2(.9995))).rgb; }
float ell(vec2 q, vec4 e){ return 1.-smoothstep(.7,1.,length((q-e.xy)/e.zw)); }
float rect(vec2 q, vec4 r){ float f=20.; return smoothstep(r.x-f,r.x+f,q.x)*(1.-smoothstep(r.z-f,r.z+f,q.x))*smoothstep(r.y-f,r.y+f,q.y)*(1.-smoothstep(r.w-f,r.w+f,q.y)); }
vec2 ear(vec2 q, vec4 e, float a){
  vec2 base=e.xy, d=e.zw-e.xy; float L2=dot(d,d); float t=dot(q-base,d)/L2;
  float lat=abs(d.x*(q.y-base.y)-d.y*(q.x-base.x))/sqrt(L2);
  float w=smoothstep(0.,1.,clamp(t,0.,1.25))*(1.-smoothstep(.35,.6,lat/sqrt(L2)));
  return base+rot(q-base,-a*w);
}
float h21(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y); }
vec2 eyeLook(vec2 q, vec4 e){ float wl=1.-smoothstep(.4,.97,length((q-e.xy)/e.zw)); return q-uLook*(e.z/60.)*wl; }
vec3 lid(vec2 q, vec4 e, vec3 furCol, float b, out float m){
  m=0.; if(b<.01) return vec3(0.);
  vec2 c=e.xy, rr=e.zw*1.05; float k=rr.y/40.;
  float dx=(q.x-c.x)/rr.x; if(abs(dx)>=1.) return vec3(0.);
  float sq=sqrt(1.-dx*dx);
  float yTop=c.y-rr.y*sq;
  float edge=mix(yTop-4.*k,c.y+rr.y*.86*sq,b);
  float top=yTop-6.*k*smoothstep(0.,.35,b);
  if(q.y<top-10.*k||q.y>edge+3.*k) return vec3(0.);
  m=smoothstep(top-10.*k,top+10.*k,q.y)*(1.-smoothstep(edge-1.*k,edge+1.5*k,q.y));
  float ly=clamp((q.y-top)/max(edge-top,1.),0.,1.);
  float strands=vnoise(vec2(q.x*.45,q.y*.12)/k)*.6+vnoise(vec2(q.x*1.1,q.y*.3)/k)*.4;
  vec3 fur=furCol*(.9+.18*strands);
  fur*=1.02+.06*(1.-ly)-.25*smoothstep(.6,1.,ly)-.1*dx*dx;
  float lash=1.-smoothstep(1.4*k,3.6*k,abs(q.y-edge+1.*k));
  float lb=lash*smoothstep(.15,.5,b);
  m=max(m,lb*step(q.y,edge+3.*k));
  return mix(fur,vec3(.1,.05,.03),lb);
}
vec3 shade(vec2 p){
  vec2 q=p;
  // flora in the breeze
  q.x-=sin(uT*1.3+q.y*.02)*uFlA.x*rect(p,uFl0);
  q.x-=sin(uT*1.1+q.y*.015+1.)*uFlA.y*rect(p,uFl1);
  q.x-=sin(uT*1.6+q.y*.03+2.)*uFlA.z*rect(p,uFl2);
  // breathing: the body rises a touch from the ground line
  float bw=smoothstep(uBreathY.x-40.,uBreathY.x+40.,p.y)*(1.-smoothstep(uBreathY.y-20.,uBreathY.y+10.,p.y));
  q.y=uBreathY.y+(q.y-uBreathY.y)/(1.+uBreath*bw);
  // tail
  float tw=ell(p,uTail); float td=clamp(length(q-uTailPivot)/length(uTail.zw),0.,1.);
  q=uTailPivot+rot(q-uTailPivot,-uTailRot*tw*td);
  q+=vec2(sin(q.y*.08+uT*4.),sin(q.x*.06+uT*5.))*tw*td*1.2*(uHead.z/300.);
  // head
  float hw=ell(p,uHead);
  q=uHeadPivot+rot(q-uHeadPivot,-uHeadRot*hw);
  q.x-=uTurn*(1.-smoothstep(.3,.75,length((q-uHead.xy)/uHead.zw)));
  q=ear(q,uEar0,uEarL); q=ear(q,uEar1,uEarR);
  // tuft
  float tuw=1.-smoothstep(.4,1.,length(q-uTuft.xy)/uTuft.z);
  q.x-=tuw*sin(uT*3.6+q.y*.08)*uTuft.z*.06;
  vec2 q0=q;
  if(uEyes>.5){
    if(length((q-uEye0.xy)/uEye0.zw)<1.3) q=eyeLook(q,uEye0);
    else if(length((q-uEye1.xy)/uEye1.zw)<1.3) q=eyeLook(q,uEye1);
  }
  vec3 c=tex(q);
  if(uEyes>.5){
    float mk; vec3 lc=lid(q0,uEye0,uFur0,uBlink,mk); if(mk>0.) c=mix(c,lc,mk);
    lc=lid(q0,uEye1,uFur1,uBlink,mk); if(mk>0.) c=mix(c,lc,mk);
  }
  // lights: warm glows that flicker (lanterns, the sun)
  float g0=exp(-pow(length(p-uG0.xy)/uG0.z,2.)); float g1=exp(-pow(length(p-uG1.xy)/uG1.z,2.));
  c+=g0*uGc0*uGlow.x*.35+g1*uGc1*uGlow.y*.35;
  return c;
}
void main(){
  vec2 px=vUv*vec2(1080.,1920.);
  float s=uCam.z/1920.;
  vec3 col=vec3(0.);
  // motion blur along the whip direction
  if(uBlur>.5){
    for(int i=0;i<16;i++){ float o=(float(i)/15.-.5)*uBlur; col+=shade(uCam.xy+(px+vec2(o,0.)-vec2(540.,960.))*s); }
    col/=16.;
  } else col=shade(uCam.xy+(px-vec2(540.,960.))*s);
  // fine film grain unifies the four pictures
  float gr=h21(px+vec2(uSeed*37.,uSeed*91.))-.5;
  col+=gr*.035;
  gl_FragColor=vec4(col,1.);
}`;

  const views = [];
  function initScene(sc, img, canvas) {
    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, antialias: false });
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog); gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const U = {};
    const n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(prog, i).name; U[name] = gl.getUniformLocation(prog, name); }
    // the texture is stored at 2x; uniforms stay in source pixels and are scaled here
    const k = img.width / sc.size[0];
    const S = (v) => v.map((x) => x * k);
    gl.uniform2f(U.uSize, img.width, img.height);
    gl.uniform4f(U.uHead, ...S([...sc.head.c, ...sc.head.r])); gl.uniform2f(U.uHeadPivot, ...S(sc.head.pivot));
    const e = sc.eyes;
    gl.uniform1f(U.uEyes, e.length ? 1 : 0);
    if (e.length) {
      gl.uniform4f(U.uEye0, ...S([...e[0].c, ...e[0].r])); gl.uniform4f(U.uEye1, ...S([...e[1].c, ...e[1].r]));
      gl.uniform3f(U.uFur0, ...e[0].fur); gl.uniform3f(U.uFur1, ...e[1].fur);
    }
    gl.uniform4f(U.uTail, ...S([...sc.tail.c, ...sc.tail.r])); gl.uniform2f(U.uTailPivot, ...S(sc.tail.pivot));
    gl.uniform4f(U.uEar0, ...S([...sc.ears[0].base, ...sc.ears[0].tip])); gl.uniform4f(U.uEar1, ...S([...sc.ears[1].base, ...sc.ears[1].tip]));
    gl.uniform3f(U.uTuft, ...S([...sc.tuft.c, sc.tuft.r]));
    gl.uniform2f(U.uBreathY, ...S([sc.breath.y0, sc.breath.y1]));
    const fl = [0, 1, 2].map((i) => sc.flora[i] || [0, 0, 0, 0, 0]);
    gl.uniform4f(U.uFl0, ...S(fl[0].slice(0, 4))); gl.uniform4f(U.uFl1, ...S(fl[1].slice(0, 4))); gl.uniform4f(U.uFl2, ...S(fl[2].slice(0, 4)));
    gl.uniform3f(U.uFlA, fl[0][4] * k, fl[1][4] * k, fl[2][4] * k);
    const gs = [0, 1].map((i) => sc.glows[i] || [-9999, -9999, 1, 0, 0, 0]);
    gl.uniform3f(U.uG0, ...S(gs[0].slice(0, 3))); gl.uniform3f(U.uGc0, ...gs[0].slice(3));
    gl.uniform3f(U.uG1, ...S(gs[1].slice(0, 3))); gl.uniform3f(U.uGc1, ...gs[1].slice(3));
    gl.viewport(0, 0, canvas.width, canvas.height);
    return { gl, U, k, sc, canvas };
  }

  function camAt(sc, t) {
    const K = sc.cam;
    const pick = (i) => tr(K.map((r) => [r[0], r[i]]), t);
    return [pick(1), pick(2), pick(3)];
  }

  function drawScene(v, lt, blurPx, gt) {
    const { gl, U, k, sc } = v;
    const f = sc.perform(lt);
    const [cx, cy, vh] = camAt(sc, lt);
    gl.uniform3f(U.uCam, cx * k, cy * k, vh * k);
    gl.uniform1f(U.uT, lt); gl.uniform1f(U.uBlur, blurPx); gl.uniform1f(U.uSeed, Math.floor(gt * 30) % 97);
    gl.uniform1f(U.uHeadRot, f.headRot); gl.uniform1f(U.uTurn, f.turn * k);
    gl.uniform1f(U.uBlink, f.blink); gl.uniform2f(U.uLook, f.lookX * k, f.lookY * k);
    gl.uniform1f(U.uTailRot, f.tail); gl.uniform1f(U.uEarL, f.earL); gl.uniform1f(U.uEarR, f.earR);
    gl.uniform1f(U.uBreath, f.breath);
    gl.uniform2f(U.uGlow, 0.8 + 0.12 * Math.sin(gt * 9.1) + 0.08 * Math.sin(gt * 23.3), 0.8 + 0.1 * Math.sin(gt * 7.7 + 2) + 0.08 * Math.sin(gt * 19.1));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // whip pan: the outgoing scene slides left, the next arrives from the right, blurred at speed
  function whip(t, cut) {
    const u = clamp((t - (cut - WHIP / 2)) / WHIP, 0, 1);
    const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
    const speed = Math.sin(u * Math.PI);
    return { x: e * 1080, blur: speed * 260, active: u > 0 && u < 1 };
  }

  let els, ready = false;
  function render(t) {
    if (!els) return;
    t = clamp(t, 0, 10);
    const cuts = [2.5, 5.0];
    const show = [false, false, false, false], off = [0, 0, 0, 0], blur = [0, 0, 0, 0], alpha = [1, 1, 1, 1];
    // which scene owns the frame
    let cur = t < 2.5 ? 0 : t < 5 ? 1 : t < 7.5 ? 2 : 3;
    show[cur] = true;
    for (let i = 0; i < cuts.length; i++) {
      const w = whip(t, cuts[i]);
      if (w.active) {
        show[i] = show[i + 1] = true;
        off[i] = -w.x; off[i + 1] = 1080 - w.x; blur[i] = blur[i + 1] = w.blur;
      }
    }
    // evening: a slow warm dissolve into the sunset
    const dis = clamp((t - 7.3) / 0.4, 0, 1);
    if (dis > 0 && dis < 1) { show[2] = show[3] = true; alpha[3] = smooth(dis); }
    if (ready) {
      views.forEach((v, i) => {
        v.canvas.style.visibility = show[i] ? "visible" : "hidden";
        v.canvas.style.transform = `translateX(${off[i].toFixed(1)}px)`;
        v.canvas.style.opacity = alpha[i].toFixed(3);
        if (!show[i]) return;
        // incoming scenes start a beat into their action so the whip lands on live motion
        const lt = clamp(t - START[i] + (i ? 0.3 : 0), 0, 3.2);
        drawScene(v, lt, blur[i], t);
      });
    }
    // light leak over the dissolve
    els.leak.style.opacity = (Math.sin(dis * Math.PI) * 0.9).toFixed(3);
    els.flash.style.opacity = (Math.pow(Math.sin(dis * Math.PI), 2) * 0.92).toFixed(3);
    // dust motes everywhere, a few more in the sunlit scenes
    const ctx = els.parts.getContext("2d");
    ctx.clearRect(0, 0, 1080, 1920);
    for (let i = 0; i < 60; i++) {
      const h1 = hash(i), h2 = hash(i + 50), h3 = hash(i + 150);
      const y = (((h2 * 2100 - t * (12 + 16 * h3)) % 2100) + 2100) % 2100 - 90;
      const x = 60 + h1 * 960 + 20 * Math.sin(t * (0.4 + h3) + i);
      const a = (0.12 + 0.3 * h3) * (0.5 + 0.5 * Math.sin(t * (1.3 + 2 * h1) + i));
      const r = 1.2 + 2.4 * h3;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 2.6);
      g.addColorStop(0, `rgba(255,236,200,${a})`); g.addColorStop(1, "rgba(255,220,160,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * 2.6, 0, 7); ctx.fill();
    }
  }

  function boot() {
    const $ = (id) => document.getElementById(id);
    els = { parts: $("dia-parts"), leak: $("dia-leak"), flash: $("dia-flash") };
    const load = (src) => new Promise((res) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
    const p = Promise.all(SCENES.map((s) => load(s.src))).then((imgs) => {
      imgs.forEach((img, i) => { if (img) views[i] = initScene(SCENES[i], img, $("cv-" + SCENES[i].id)); });
      ready = views.filter(Boolean).length === SCENES.length;
      render(window.__diaT || 0);
    });
    window.__hf = window.__hf || {};
    window.__hf.buildReady = window.__hf.buildReady || {};
    window.__hf.buildReady.dia = p;
    render(0);
  }
  window.LumaDia = { render: (t) => { window.__diaT = t; render(t); } };
  boot();
})();
