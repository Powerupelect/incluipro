import soundfile as sf, sys
from kokoro_onnx import Kokoro
k = Kokoro("kokoro-v1.0.onnx", "voices-v1.0.bin")
lines = {
 "l1": "Oi! Eu sou a Luma! E sabe de uma coisa? Eu adoro descobrir coisas novas!",
 "l2": "Hummm... O que será que tem aqui? Nunca vi algo assim!",
 "l3": "Uau! Acho que minha primeira aventura acabou de começar!",
}
for n,t in lines.items():
    s, sr = k.create(t, voice="pf_dora", speed=float(sys.argv[1]) if len(sys.argv)>1 else 1.1, lang="pt-br")
    sf.write(n+".wav", s, sr); print(n, len(s)/sr)
