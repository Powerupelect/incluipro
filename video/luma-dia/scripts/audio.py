# Sound for "Um dia na casa da Luma": a soft music box, room air, little paw steps and a
# whoosh on each whip pan, birds by the window, an evening breeze with crickets, a chime on the title.
import numpy as np, soundfile as sf
SR=48000; DUR=10.0; N=int(SR*DUR); t=np.arange(N)/SR
rng=np.random.default_rng(5)
def lp(x, fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.empty_like(x); s=0.0
    for i,v in enumerate(x): s=(1-a)*v+a*s; y[i]=s
    return y
def bp(x, lo, hi): return lp(x,hi)-lp(x,lo)
def put(buf, sig, at, g):
    i=int(at*SR); j=min(len(buf), i+len(sig)); buf[i:j]+=sig[:j-i]*g
def midi(m): return 440*2**((m-69)/12)
def tone(f, d, r=0.6, harm=((1,1),(2,.35),(3,.12),(4.2,.08))):
    n=int(d*SR); tt=np.arange(n)/SR
    s=sum(g*np.sin(2*np.pi*f*h*tt)*np.exp(-tt*h*1.3) for h,g in harm)
    return s*np.minimum(1,tt/0.004)*np.exp(-tt/r)
L=np.zeros(N); R=np.zeros(N)
# music box, gentle, 96 bpm
beat=0.625
mel=[(76,0),(79,1),(83,2),(84,3),(83,4),(79,5),(81,6),(79,7),(76,8),(77,9),(81,10),(84,11),(83,12),(81,13),(79,14),(84,15.5)]
for m,b in mel:
    s=tone(midi(m),2.0,r=0.7); put(L,s,0.15+b*beat,0.07); put(R,s,0.16+b*beat,0.07)
for st,ns in [(0,[48,55,64]),(2.5,[53,60,69]),(5,[45,52,60,64]),(7.5,[48,55,64,67])]:
    d=2.6; n=int(d*SR); tt=np.arange(n)/SR; e=np.minimum(1,tt/0.8)*np.minimum(1,(d-tt)/0.8)
    s=sum(np.sin(2*np.pi*midi(k)*tt)+0.3*np.sin(2*np.pi*midi(k)*2.003*tt) for k in ns)*e
    put(L,s,st,0.018); put(R,s,st,0.018)
# room air
room=lp(rng.standard_normal(N),400); room/=np.abs(room).max(); L+=room*0.03; R+=np.roll(room,700)*0.03
# whip pans: little paw steps under a soft whoosh
def whoosh(d):
    n=int(d*SR); x=bp(rng.standard_normal(n),300,3000); e=np.sin(np.pi*np.arange(n)/n)**2
    return x/np.abs(x).max()*e
def step():
    n=int(0.06*SR); tt=np.arange(n)/SR
    return (np.sin(2*np.pi*140*tt)*np.exp(-tt*60)+0.25*lp(rng.standard_normal(n),1500)*np.exp(-tt*90))
for cut in (2.5,5.0):
    w=whoosh(0.5); put(L,w,cut-0.27,0.12); put(R,w,cut-0.23,0.12)
    for k in range(5):
        s=step(); at=cut-0.32+k*0.12; put(L if k%2 else R,s,at,0.18); put(R if k%2 else L,s,at,0.08)
# birds by the window (first three scenes)
def chirp(f0,f1,d):
    n=int(d*SR); tt=np.arange(n)/SR; f=np.linspace(f0,f1,n)+60*np.sin(2*np.pi*28*tt)
    return np.sin(2*np.pi*np.cumsum(f)/SR)*np.sin(np.pi*tt/d)**2
for at,f0,f1,d in [(0.8,3400,4200,.07),(0.92,3600,4400,.07),(3.3,4200,3100,.12),(5.9,3000,3900,.06),(6.02,3100,4000,.06)]:
    c=chirp(f0,f1,d); put(R,c,at,0.02); put(L,c,at,0.008)
# evening: breeze and crickets fade in with the sunset
ev=np.clip((t-7.2)/0.8,0,1)
br=bp(rng.standard_normal(N),200,1500); br/=np.abs(br).max()
L+=br*ev*0.05*(0.7+0.3*np.sin(2*np.pi*t/3.1)); R+=np.roll(br,400)*ev*0.05*(0.7+0.3*np.sin(2*np.pi*t/2.7))
cr=np.sin(2*np.pi*4300*t)*(np.sin(2*np.pi*28*t)>0.3)*(np.sin(2*np.pi*1.6*t)>0)
L+=lp(cr,6000)*ev*0.006; R+=lp(np.roll(cr,9000),6000)*ev*0.008
# title chime
for k,m in enumerate([84,88,91,96]):
    s=tone(midi(m),2.0,r=0.8); put(L,s,8.0+k*0.09,0.06); put(R,s,8.02+k*0.09,0.06)
mix=np.stack([L,R],1)
f=int(0.15*SR); ramp=np.ones(N); ramp[:f]=np.linspace(0,1,f); k=int(0.8*SR); ramp[-k:]=np.linspace(1,0,k)
mix*=ramp[:,None]; mix/=np.abs(mix).max()/0.7
sf.write('assets/audio/trilha.wav',mix.astype(np.float32),SR); print('ok')
