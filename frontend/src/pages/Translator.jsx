import { useState } from "react";
import { api } from "@/api/client";
import { toast } from "sonner";
import { Volume2, Star, ArrowRightLeft } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

const LANGS = [
  { v: "en", l: "Inglês" }, { v: "pt", l: "Português" }, { v: "es", l: "Espanhol" },
  { v: "fr", l: "Francês" }, { v: "de", l: "Alemão" }, { v: "it", l: "Italiano" },
];

export default function Translator() {
  const [source, setSource] = useState("pt");
  const [target, setTarget] = useState("en");
  const [text, setText] = useState("");
  const [out, setOut] = useState("");
  const [loading, setLoading] = useState(false);

  const translate = async () => {
    if (!text.trim()) return;
    if (text.length > 1000) return toast.error("Texto muito longo (máx 1000)");
    setLoading(true);
    try {
      const { data } = await api.post("/translate", { text, source, target });
      setOut(data.translation);
    } catch (e) { toast.error("Falha ao traduzir"); }
    finally { setLoading(false); }
  };

  const speak = (txt, lang) => {
    if (!txt) return;
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = lang;
    window.speechSynthesis.speak(u);
  };

  const saveFav = async () => {
    if (!out) return;
    try {
      await api.post("/favorites", { text, translation: out, source, target });
      toast.success("Adicionado aos favoritos");
    } catch { toast.error("Falha ao salvar"); }
  };

  const swap = () => { setSource(target); setTarget(source); setText(out); setOut(text); };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Tradutor</h1>
      <p className="text-slate-500 mb-6">Tradução automática gratuita via MyMemory. Use o botão de áudio para ouvir a pronúncia.</p>

      <div className="card p-6 space-y-4">
        <div className="grid sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          <select className="input" value={source} onChange={(e) => setSource(e.target.value)}>
            {LANGS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
          </select>
          <button className="btn-ghost" onClick={swap} aria-label="Inverter"><ArrowRightLeft size={16} /></button>
          <select className="input" value={target} onChange={(e) => setTarget(e.target.value)}>
            {LANGS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
          </select>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <textarea rows={6} className="input resize-none" placeholder="Digite o texto..." value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <button onClick={() => speak(text, source)} className="inline-flex items-center gap-1 hover:text-brand-600"><Volume2 size={14} /> Ouvir</button>
              <span>{text.length}/1000</span>
            </div>
          </div>
          <div>
            <textarea rows={6} className="input resize-none bg-slate-50 dark:bg-slate-800" readOnly value={out} placeholder="Tradução..." />
            <div className="flex justify-between text-xs text-slate-500 mt-1">
              <button onClick={() => speak(out, target)} className="inline-flex items-center gap-1 hover:text-brand-600"><Volume2 size={14} /> Ouvir</button>
              <button onClick={saveFav} className="inline-flex items-center gap-1 hover:text-amber-600"><Star size={14} /> Favoritar</button>
            </div>
          </div>
        </div>
        <button className="btn-primary w-full sm:w-auto" disabled={loading} onClick={translate}>
          {loading ? <Spinner /> : "Traduzir"}
        </button>
      </div>
    </div>
  );
}
