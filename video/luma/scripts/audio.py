import numpy as np, soundfile as sf, json
SR=48000; DUR=18.0
rng=np.random.default_rng(7)
def env(n, a, r):
    t=np.arange(n)/SR; return np.minimum(1, t/a)*np.exp(-t/r)
def tone(f, d, a=0.004, r=0.6, harm=((1,1),(2,.35),(3,.12),(4.2,.08))):
    n=int(d*SR); t=np.arange(n)/SR
    s=sum(g*np.sin(2*np.pi*f*h*t)*np.exp(-t*h*1.3) for h,g in harm)
    return s*env(n,a,r)
def put(buf, sig, at, gain=1.0):
    i=int(at*SR); j=min(len(buf), i+len(sig)); buf[i:j]+=sig[:j-i]*gain
def midi(m): return 440*2**((m-69)/12)
mus=np.zeros(int(DUR*SR))
# music box melody (C major, gentle, 100 bpm)
beat=0.6
mel=[(76,0),(79,1),(84,2),(83,3),(79,4),(81,5),(79,6),(76,7),
     (77,8),(81,9),(84,10),(83,11),(81,12),(79,13.5),
     (76,16),(79,17),(84,18),(86,19),(88,20),(86,21),(84,22),(83,23),
     (81,24),(83,25),(84,26),(88,26.5),(91,27)]
for m,b in mel:
    put(mus, tone(midi(m), 2.0, r=0.7), 0.3+b*beat, 0.10)
# soft pad chords
chords=[(0,[48,55,64]),(4.8,[53,60,69]),(9.6,[45,52,60,64]),(14.4,[48,55,64,67])]
for st,ns in chords:
    d=4.9; n=int(d*SR); t=np.arange(n)/SR
    e=np.minimum(1,t/1.2)*np.minimum(1,(d-t)/1.2)
    s=sum(np.sin(2*np.pi*midi(k)*t+0.3*np.sin(2*np.pi*0.2*t))+0.3*np.sin(2*np.pi*midi(k)*2.003*t) for k in ns)
    put(mus, s*e, st, 0.025)
sfx=np.zeros_like(mus)
def shimmer(at, d=1.2, g=0.08, seed=1, base=84):
    r=np.random.default_rng(seed)
    for k in range(18):
        put(sfx, tone(midi(base+r.choice([0,2,4,7,9,12,14,16,19])), 0.8, r=0.25, harm=((1,1),(2.76,.3))), at+k*d/18, g*(1-k/22))
shimmer(5.35, 1.1, 0.06, 1)             # box appears
# lid pop: soft click + wooden knock
n=int(0.15*SR); t=np.arange(n)/SR
put(sfx, np.sin(2*np.pi*220*t*(1-t*2))*np.exp(-t*40)+0.3*rng.standard_normal(n)*np.exp(-t*90), 10.4, 0.25)
# magic rise 10.45 -> 12.4 (filtered noise + rising tone)
d=2.2; n=int(d*SR); t=np.arange(n)/SR
f=300+900*(t/d)**2; ph=2*np.pi*np.cumsum(f)/SR
rise=(np.sin(ph)*0.5+np.sin(ph*1.5)*0.3)*np.minimum(1,t/1.5)*np.minimum(1,(d-t)/0.3)
put(sfx, rise, 10.45, 0.05)
shimmer(10.5, 1.8, 0.07, 3, 88)
shimmer(12.0, 0.8, 0.05, 5, 91)
put(sfx, tone(midi(96),1.2,r=0.3,harm=((1,1),(2.76,.4))), 16.0, 0.12)  # wink ting
for k,m in enumerate([84,88,91,96]): put(sfx, tone(midi(m),2.0,r=0.8), 16.35+k*0.09, 0.09) # title chime
mix=np.stack([mus,mus],1)
# simple stereo widen for sfx
sl=np.convolve(sfx,np.r_[1,np.zeros(240)],'same'); mix[:,0]+=sfx; mix[:,1]+=sl*0.9
fade=np.ones(len(mus)); k=int(1.0*SR); fade[-k:]=np.linspace(1,0,k); mix*=fade[:,None]
mix/= max(1,np.abs(mix).max()/0.7)
sf.write('assets/audio/trilha.wav', mix.astype(np.float32), SR)
# lip sync envelopes
fps=30; out={}
for name,start in [('voz1',0.9),('voz2',6.4),('voz3',12.9)]:
    s,sr=sf.read(f'assets/audio/{name}.wav'); hop=sr//fps; fr=[]; rd=[]
    for i in range(0,len(s)-hop,hop):
        w=s[i:i+hop*2] if i+hop*2<=len(s) else s[i:]
        fr.append(float(np.sqrt(np.mean(w**2))))
        sp=np.abs(np.fft.rfft(w*np.hanning(len(w)))); fq=np.fft.rfftfreq(len(w),1/sr)
        rd.append(float((sp*fq).sum()/(sp.sum()+1e-9)))
    fr=np.array(fr); fr=np.clip((fr/np.percentile(fr,95))**0.8,0,1.15)
    rd=np.array(rd); rd=np.clip(1-(rd-700)/1800,0,1)  # low centroid -> rounder
    out[name]={'start':start,'open':[round(x,3) for x in fr],'round':[round(x,3) for x in rd]}
json.dump(out,open('assets/lipsync.json','w'))
print({k:len(v['open']) for k,v in out.items()})
