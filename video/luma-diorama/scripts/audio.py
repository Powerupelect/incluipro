# Ambient ASMR bed for the 8 s diorama: room tone, breeze through the window,
# distant birds outside, soft fur swishes on the tail moves, faint lantern crackle.
import numpy as np, soundfile as sf
SR=48000; DUR=8.0; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(11)
def lp(x, fc):  # one-pole low-pass
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i,v in enumerate(x): s=(1-a)*v+a*s; y[i]=s
    return y
def bp(x, lo, hi): return lp(x,hi)-lp(x,lo)
def put(buf, sig, at, g):
    i=int(at*SR); j=min(len(buf), i+len(sig)); buf[i:j]+=sig[:j-i]*g
L=np.zeros(N); R=np.zeros(N)
# room tone: warm, very quiet
room=lp(rng.standard_normal(N),400); room/=np.abs(room).max()
L+=room*0.05; R+=np.roll(room,700)*0.05
# breeze from the window (right side), slow swells
br=bp(rng.standard_normal(N),250,1800); br/=np.abs(br).max()
sw=0.55+0.45*np.sin(2*np.pi*t/5.3+0.4)*np.sin(2*np.pi*t/2.9+1.1)
L+=br*sw*0.035; R+=np.roll(br,300)*sw*0.06
# distant birds outside (right channel heavier, soft)
def chirp(f0, f1, d, vib=0):
    n=int(d*SR); tt=np.arange(n)/SR; f=np.linspace(f0,f1,n)+vib*np.sin(2*np.pi*28*tt)
    ph=2*np.pi*np.cumsum(f)/SR; e=np.sin(np.pi*tt/d)**2
    return np.sin(ph)*e
birds=[(0.7,[(3400,4200,.07),(3600,4400,.07)]),(2.2,[(4200,3100,.12)]),(3.9,[(3000,3900,.06),(3100,4000,.06),(3200,4100,.06)]),
       (5.8,[(4400,3600,.1),(3700,4300,.08)]),(7.1,[(3300,4000,.07)])]
for at,notes in birds:
    tt=at
    for f0,f1,d in notes:
        c=chirp(f0,f1,d,vib=60); put(R,c,tt,0.022); put(L,c,tt+0.003,0.009); tt+=d+0.05
# soft fur swishes synced to the tail (peaks of its sway) and the happy swish at 5.3 s
def swish(d, g):
    n=int(d*SR); x=bp(rng.standard_normal(n),900,5000); e=np.sin(np.pi*np.arange(n)/n)**3
    return x/np.abs(x).max()*e*g
for at,g in [(0.9,0.045),(2.6,0.04),(4.1,0.04),(5.25,0.07),(6.9,0.04)]:
    s=swish(0.45,g); put(L,s,at,1.0); put(R,s,at,0.6)
# lantern: faint candle crackles
for k in range(14):
    at=0.3+k*0.55+rng.uniform(-.15,.15); n=int(0.006*SR)
    c=rng.standard_normal(n)*np.exp(-np.arange(n)/(SR*0.0015))
    put(L,c,at,0.02*rng.uniform(.4,1)); put(R,c,at,0.006)
mix=np.stack([L,R],1)
f=int(0.25*SR); ramp=np.ones(N); ramp[:f]=np.linspace(0,1,f); ramp[-f:]=np.linspace(1,0,f)
mix*=ramp[:,None]; mix/=np.abs(mix).max()/0.33
sf.write('assets/audio/ambiente.wav', mix.astype(np.float32), SR)
print('ok', mix.shape)
