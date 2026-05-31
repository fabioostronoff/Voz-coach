import { useState, useEffect, useRef } from "react";

const CATEGORIAS = {
  dicao:     { label: "Dicção",           emoji: "🗣️", cor: "#E8C547" },
  publico:   { label: "Falar em Público", emoji: "🎤", cor: "#E87C47" },
  smalltalk: { label: "Small Talk",      emoji: "💬", cor: "#47B8E8" },
  simulacao: { label: "Simulação",       emoji: "🎭", cor: "#B847E8" },
};

const EXERCICIOS = [
  { id:1, categoria:"dicao",     titulo:"Trava-língua progressivo",  instrucao:"Grave-se repetindo 3 vezes, acelerando a cada rodada.", prompt:"O rato roeu a roupa do rei de Roma", dica:"Clareza antes de velocidade. Cada sílaba deve ser distinta.", duracao:5 },
  { id:2, categoria:"dicao",     titulo:"Leitura com pausas",        instrucao:"Leia em voz alta, pausando em cada vírgula e ponto.", prompt:"O mercado financeiro, assim como a natureza, opera em ciclos. Quem aprende a identificá-los, age com calma quando os outros entram em pânico.", dica:"Respire antes de frases longas. Não acelere no final.", duracao:5 },
  { id:3, categoria:"dicao",     titulo:"Vogais abertas",            instrucao:"Fale cada palavra bem devagar, exagerando as vogais.", prompt:"Extraordinário • Oportunidade • Autoridade • Elaborado • Inevitável", dica:"Abra bem a boca. Sinta a diferença entre cada vogal.", duracao:5 },
  { id:4, categoria:"publico",   titulo:"Ponto de vista em 60s",     instrucao:"Grave-se por 60 segundos defendendo uma posição clara.", prompt:'"O trabalho remoto é mais produtivo do que o presencial."', dica:"Estruture: Posição → 2 argumentos → Conclusão.", duracao:7 },
  { id:5, categoria:"publico",   titulo:"Abertura impactante",       instrucao:"Grave uma abertura de 30s para uma apresentação.", prompt:"Como o Brasil pode liderar o agronegócio sustentável global", dica:"Comece com pergunta, dado surpreendente ou história. Nunca com 'Bom dia, meu nome é...'", duracao:5 },
  { id:6, categoria:"publico",   titulo:"Improviso PREP",            instrucao:"Grave 90s usando: Ponto → Razão → Exemplo → Ponto.", prompt:'"Por que comunicação clara vale mais do que qualquer planilha."', dica:"O método PREP é a base de todo bom improviso.", duracao:10 },
  { id:7, categoria:"smalltalk", titulo:"Pergunta aberta",           instrucao:"Grave como você iniciaria a conversa com uma pergunta aberta.", prompt:"Você está num evento e encontra um colega recém-chegado de Portugal.", dica:"Perguntas abertas começam com 'Como', 'O que', 'Me conta'.", duracao:5 },
  { id:8, categoria:"smalltalk", titulo:"Técnica FORD",              instrucao:"Grave 4 perguntas usando: Família, Ocupação, Recreação, Desejos.", prompt:"Jantar de negócios com um investidor que você acabou de conhecer.", dica:"FORD cria conversas naturais sem parecer interrogatório.", duracao:7 },
  { id:9, categoria:"smalltalk", titulo:"Saída elegante",            instrucao:"Grave como você encerraria essa conversa de forma calorosa.", prompt:"Você está numa conversa de 20min num coquetel e precisa circular.", dica:"Resume algo positivo da conversa e deixa a porta aberta.", duracao:5 },
];

const SIMULACOES = [
  { id:"s1", titulo:"Pitch de 2 minutos",    cenario:"Você tem 2 minutos para convencer um investidor a ouvir mais sobre sua ideia. O investidor é cético mas aberto.",   papel:"investidor cético mas curioso", cor:"#B847E8" },
  { id:"s2", titulo:"Reunião difícil",       cenario:"Você precisa dar um feedback negativo a um colega sobre sua performance, mantendo o relacionamento.",                 papel:"colega que recebe o feedback", cor:"#E87C47" },
  { id:"s3", titulo:"Small talk executivo",  cenario:"Você está num elevador com um CEO que admira. Tem 60 segundos antes do andar dele.",                                 papel:"CEO ocupado mas receptivo", cor:"#47B8E8" },
  { id:"s4", titulo:"Entrevista de emprego", cenario:"Primeira pergunta da entrevista: 'Me conta um pouco sobre você e por que quer essa posição.'",                       papel:"entrevistador experiente", cor:"#E8C547" },
  { id:"s5", titulo:"Apresentação de dados", cenario:"Você precisa explicar resultados ruins do trimestre para o board sem soar na defensiva.",                             papel:"board member questionador", cor:"#47E8B8" },
];

const VICIOSPT = ["né","tipo","assim","então","daí","aí","hmm","bom","certo","ok","tá","cara","sabe","entendeu","na verdade","basicamente","literalmente","obviamente","enfim"];

const DICAS = [
  { titulo:"Respiração diafragmática", texto:"Inspire pelo nariz por 4s, segure 4s, expire pela boca por 6s. Faça antes de qualquer fala importante.", categoria:"dicao" },
  { titulo:"A regra dos 3 pontos",     texto:"Nunca tente passar mais de 3 mensagens numa fala. Escolha os 3 mais importantes e desenvolva cada um.", categoria:"publico" },
  { titulo:"Escuta ativa",             texto:"Em small talks, use 70% do tempo ouvindo e 30% falando. Faça perguntas sobre o que a pessoa acabou de dizer.", categoria:"smalltalk" },
  { titulo:"Pausas estratégicas",      texto:"Uma pausa de 2 segundos antes de um ponto importante aumenta o impacto percebido em até 40%.", categoria:"publico" },
  { titulo:"Espelhamento",             texto:"Repita as últimas 3-4 palavras da pessoa em forma de pergunta. Ela vai continuar falando e sentirá que você é um ótimo ouvinte.", categoria:"smalltalk" },
];

function analisarTexto(texto) {
  if (!texto || texto.length < 5) return null;
  const palavras = texto.toLowerCase().split(/\s+/).filter(Boolean);
  const total = palavras.length;
  const vic = {};
  palavras.forEach(p => {
    const l = p.replace(/[^a-záéíóúãõâêîôûç]/g, "");
    if (VICIOSPT.includes(l)) vic[l] = (vic[l] || 0) + 1;
  });
  const tv = Object.values(vic).reduce((a, b) => a + b, 0);
  const score = Math.max(0, Math.round(100 - (tv / Math.max(total, 1)) * 200));
  return { total, vic, tv, score };
}

function Badge({ texto, cor }) {
  return <span style={{ background: cor + "22", color: cor, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", padding: "3px 10px", borderRadius: 20 }}>{texto}</span>;
}

function PBar({ valor, cor, label }) {
  return (
    <div style={{ marginBottom: 12 }}>
      {label && <div style={{ fontSize: 11, color: "#666", marginBottom: 5 }}>{label}</div>}
      <div style={{ background: "#1A1A1A", borderRadius: 20, height: 6, overflow: "hidden" }}>
        <div style={{ width: `${Math.min(valor, 100)}%`, height: "100%", background: cor, borderRadius: 20, transition: "width 0.8s ease" }} />
      </div>
    </div>
  );
}

function Cronometro({ duracao }) {
  const [seg, setSeg] = useState(duracao * 60);
  const [ativo, setAtivo] = useState(false);
  const ref = useRef();
  useEffect(() => {
    if (ativo && seg > 0) ref.current = setInterval(() => setSeg(s => s - 1), 1000);
    else clearInterval(ref.current);
    return () => clearInterval(ref.current);
  }, [ativo, seg]);
  const mm = String(Math.floor(seg / 60)).padStart(2, "0");
  const ss = String(seg % 60).padStart(2, "0");
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 34, fontFamily: "monospace", color: seg < 30 ? "#E87C47" : "#F0EDE6", letterSpacing: 4 }}>{mm}:{ss}</div>
      <div style={{ background: "#1A1A1A", borderRadius: 20, height: 4, margin: "6px 0 10px" }}>
        <div style={{ width: `${(1 - seg / (duracao * 60)) * 100}%`, height: "100%", background: seg < 30 ? "#E87C47" : "#E8C547", borderRadius: 20, transition: "width 1s linear" }} />
      </div>
      <button onClick={() => setAtivo(a => !a)} style={{ background: ativo ? "#1A1A1A" : "#E8C547", color: ativo ? "#888" : "#0F0F0F", border: "1px solid #2A2A2A", borderRadius: 20, padding: "6px 18px", fontSize: 12, fontFamily: "inherit", cursor: "pointer" }}>
        {ativo ? "⏸ Pausar" : seg === duracao * 60 ? "▶ Iniciar" : "▶ Continuar"}
      </button>
    </div>
  );
}

// ── GRAVADOR DE VOZ ──────────────────────────────────────────────────────────
function GravadorVoz({ onTranscricao, cor }) {
  const [estado, setEstado] = useState("idle");
  const [transcricao, setTranscricao] = useState("");
  const [tempo, setTempo] = useState(0);
  const [nivelAudio, setNivelAudio] = useState(new Array(20).fill(4));
  const [erro, setErro] = useState("");
  const [analise, setAnalise] = useState(null);

  const recRef = useRef(null);
  const tempoRef = useRef(null);
  const animRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const textoFinalRef = useRef("");

  const suportado = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const iniciarVisualizador = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const analyser = ctx.createAnalyser();
      analyserRef.current = analyser;
      analyser.fftSize = 64;
      ctx.createMediaStreamSource(stream).connect(analyser);
      const buf = new Uint8Array(analyser.frequencyBinCount);
      const BARS = 20;
      const loop = () => {
        analyser.getByteFrequencyData(buf);
        const barras = Array.from({ length: BARS }, (_, i) => {
          const idx = Math.floor((i / BARS) * buf.length);
          return Math.max(4, Math.min(44, buf[idx] * 0.5));
        });
        setNivelAudio(barras);
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { console.warn("Visualizador:", e); }
  };

  const pararVisualizador = () => {
    cancelAnimationFrame(animRef.current);
    ctxRef.current?.close().catch(() => {});
    streamRef.current?.getTracks().forEach(t => t.stop());
    setNivelAudio(new Array(20).fill(4));
  };

  const iniciar = () => {
    if (!suportado) { setErro("Use Chrome para gravação de voz."); return; }
    setErro(""); setTranscricao(""); setAnalise(null);
    textoFinalRef.current = "";

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = e => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) textoFinalRef.current += e.results[i][0].transcript + " ";
        else interim = e.results[i][0].transcript;
      }
      setTranscricao(textoFinalRef.current + interim);
    };
    rec.onerror = e => {
      const msg = e.error === "not-allowed" ? "Permissão de microfone negada. Habilite nas configurações do browser." : "Erro: " + e.error;
      setErro(msg); setEstado("idle"); pararVisualizador();
    };
    rec.onend = () => { try { if (recRef.current === rec) rec.start(); } catch {} };

    recRef.current = rec;
    rec.start();
    setEstado("gravando");
    setTempo(0);
    tempoRef.current = setInterval(() => setTempo(t => t + 1), 1000);
    iniciarVisualizador();
  };

  const parar = () => {
    recRef.current = null;
    recRef.current?.stop?.();
    clearInterval(tempoRef.current);
    pararVisualizador();
    const texto = textoFinalRef.current.trim();
    setTranscricao(texto);
    const a = analisarTexto(texto);
    setAnalise(a);
    onTranscricao?.(texto, a);
    setEstado("pronto");
  };

  const resetar = () => { setEstado("idle"); setTranscricao(""); setAnalise(null); setErro(""); setTempo(0); textoFinalRef.current = ""; };

  const mm = String(Math.floor(tempo / 60)).padStart(2, "0");
  const ss = String(tempo % 60).padStart(2, "0");

  return (
    <div style={{ background: "#0A0A0A", border: "1px solid #1E1E1E", borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>🎙 Gravação de voz</div>

      {/* Visualizador de áudio */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: 52, marginBottom: 14 }}>
        {nivelAudio.map((h, i) => (
          <div key={i} style={{ width: 5, height: h, background: estado === "gravando" ? cor : "#222", borderRadius: 3, transition: estado === "gravando" ? "height 0.08s ease" : "height 0.4s ease, background 0.3s" }} />
        ))}
      </div>

      {/* Tempo */}
      {estado === "gravando" && (
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <span style={{ fontFamily: "monospace", fontSize: 22, color: "#E87C47" }}>{mm}:{ss}</span>
          <span style={{ fontSize: 10, color: "#666", marginLeft: 8 }}>● gravando</span>
        </div>
      )}

      {/* Controles */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 14 }}>
        {estado === "idle" && (
          <button onClick={iniciar} style={{ background: cor, color: "#0F0F0F", border: "none", borderRadius: "50%", width: 60, height: 60, fontSize: 24, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>🎙</button>
        )}
        {estado === "gravando" && (
          <button onClick={parar} style={{ background: "#E87C47", color: "#fff", border: "none", borderRadius: "50%", width: 60, height: 60, fontSize: 18, cursor: "pointer", animation: "pulseBtn 1.2s infinite", display: "flex", alignItems: "center", justifyContent: "center" }}>⏹</button>
        )}
        {estado === "pronto" && (
          <button onClick={resetar} style={{ background: "#1A1A1A", color: "#888", border: "1px solid #2A2A2A", borderRadius: 20, padding: "8px 20px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>🔄 Regravar</button>
        )}
      </div>

      {!suportado && <div style={{ color: "#E87C47", fontSize: 12, textAlign: "center", marginBottom: 8 }}>Use Chrome ou Edge para gravação de voz.</div>}
      {erro && <div style={{ color: "#E87C47", fontSize: 12, textAlign: "center", marginBottom: 8 }}>{erro}</div>}

      {/* Transcrição */}
      {transcricao && (
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 10, padding: 14, marginBottom: analise ? 14 : 0 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#555", marginBottom: 6 }}>{estado === "gravando" ? "TRANSCREVENDO AO VIVO..." : "TRANSCRIÇÃO"}</div>
          <div style={{ fontSize: 14, color: "#C0BDB6", lineHeight: 1.7 }}>{transcricao || <span style={{ color: "#444" }}>(silêncio detectado)</span>}</div>
        </div>
      )}

      {/* Análise pós-gravação */}
      {estado === "pronto" && analise && (
        <div>
          <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 12 }}>Análise automática</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
            {[
              { l: "palavras", v: analise.total, c: "#E8C547" },
              { l: "vícios",   v: analise.tv,    c: analise.tv > 3 ? "#E87C47" : "#47E8B8" },
              { l: "clareza",  v: analise.score + "%", c: analise.score > 70 ? "#47E8B8" : analise.score > 40 ? "#E8C547" : "#E87C47" },
            ].map(m => (
              <div key={m.l} style={{ background: "#141414", borderRadius: 10, padding: 10, textAlign: "center" }}>
                <div style={{ fontSize: 20, color: m.c, fontFamily: "monospace" }}>{m.v}</div>
                <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{m.l}</div>
              </div>
            ))}
          </div>
          <PBar valor={analise.score} cor={analise.score > 70 ? "#47E8B8" : analise.score > 40 ? "#E8C547" : "#E87C47"} label={`Clareza: ${analise.score}%`} />
          {Object.keys(analise.vic).length > 0 && (
            <div>
              <div style={{ fontSize: 10, color: "#555", marginBottom: 6 }}>VÍCIOS NA FALA</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {Object.entries(analise.vic).map(([v, c]) => (
                  <span key={v} style={{ background: "#E87C4722", color: "#E87C47", fontSize: 11, padding: "2px 8px", borderRadius: 10 }}>"{v}" ×{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── APP PRINCIPAL ────────────────────────────────────────────────────────────
export default function VozApp() {
  const [tela, setTela] = useState("home");
  const [aba, setAba] = useState("treino");
  const [exercicioAtual, setExercicioAtual] = useState(null);
  const [simulacaoAtual, setSimulacaoAtual] = useState(null);
  const [transcricao, setTranscricao] = useState("");
  const [analiseVoz, setAnaliseVoz] = useState(null);
  const [respostaTexto, setRespostaTexto] = useState("");
  const [modoEntrada, setModoEntrada] = useState("voz");
  const [mensagens, setMensagens] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState(() => { try { return JSON.parse(localStorage.getItem("voz_h3") || "[]"); } catch { return []; } });
  const [categoriaSel, setCategoriaSel] = useState(null);
  const [inputSim, setInputSim] = useState("");
  const chatRef = useRef();

  const salvar = (novo) => {
    const upd = [...historico, novo].slice(-50);
    setHistorico(upd);
    try { localStorage.setItem("voz_h3", JSON.stringify(upd)); } catch {}
  };

  const exerciciosDia = () => EXERCICIOS.filter((_, i) => i % 3 === new Date().getDay() % 3);
  const listaEx = categoriaSel ? EXERCICIOS.filter(e => e.categoria === categoriaSel) : exerciciosDia();
  const corAtual = exercicioAtual ? CATEGORIAS[exercicioAtual.categoria].cor : "#E8C547";

  const limparExercicio = () => { setFeedback(""); setTranscricao(""); setRespostaTexto(""); setAnaliseVoz(null); };

  const obterFeedback = async () => {
    const conteudo = modoEntrada === "voz" ? transcricao : respostaTexto;
    if (!conteudo.trim()) return;
    setCarregando(true); setFeedback("");
    try {
      const a = analiseVoz || analisarTexto(conteudo);
      const extra = a ? `\n\nMétricas automáticas: ${a.total} palavras, ${a.tv} vícios (${Object.keys(a.vic).join(", ") || "nenhum"}), clareza ${a.score}%.` : "";
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Você é um coach especialista em comunicação e oratória em português brasileiro. Analise a transcrição da fala do usuário de forma construtiva: 1) O que está bom (seja específico) 2) Um ponto concreto de melhoria 3) Uma dica prática para aplicar agora. Seja direto, encorajador, máximo 4 frases, em prosa natural, sem bullets.`,
          messages: [{ role: "user", content: `Exercício: "${exercicioAtual.titulo}"\nInstrução: ${exercicioAtual.instrucao}\nPrompt: ${exercicioAtual.prompt}\n\nTranscrição: "${conteudo}"${extra}` }]
        })
      });
      const data = await res.json();
      const txt = data.content?.map(b => b.text || "").join("") || "Erro.";
      setFeedback(txt);
      salvar({ titulo: exercicioAtual.titulo, categoria: exercicioAtual.categoria, score: a?.score || Math.round(Math.random() * 25 + 70), data: Date.now() });
    } catch { setFeedback("Erro de conexão. Tente novamente."); }
    setCarregando(false);
  };

  const enviarSim = async () => {
    if (!inputSim.trim() || carregando) return;
    const nova = { role: "user", content: inputSim };
    const msgs = [...mensagens, nova];
    setMensagens(msgs); setInputSim(""); setCarregando(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 1000,
          system: `Você é um simulador de comunicação em português brasileiro. Cenário: ${simulacaoAtual.cenario}. Papel: ${simulacaoAtual.papel}. Responda de forma realista e desafiadora. Após 4-5 trocas, dê um feedback construtivo curto. Máx 3 parágrafos.`,
          messages: msgs.map(m => ({ role: m.role, content: m.content }))
        })
      });
      const data = await res.json();
      setMensagens(m => [...m, { role: "assistant", content: data.content?.map(b => b.text || "").join("") || "..." }]);
    } catch { setMensagens(m => [...m, { role: "assistant", content: "Erro de conexão." }]); }
    setCarregando(false);
    setTimeout(() => chatRef.current?.scrollTo(0, chatRef.current.scrollHeight), 100);
  };

  const iniciarSim = (sim) => {
    setSimulacaoAtual(sim);
    setMensagens([{ role: "assistant", content: `${sim.cenario}\n\nPode começar — estou no papel de ${sim.papel}.` }]);
    setInputSim(""); setTela("simulacao");
  };

  const totalSessoes = historico.length;
  const scoreMedio = totalSessoes ? Math.round(historico.reduce((a, b) => a + (b.score || 75), 0) / totalSessoes) : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0F0F0F", fontFamily: "'Georgia','Times New Roman',serif", color: "#F0EDE6", maxWidth: 480, margin: "0 auto", paddingBottom: 80 }}>

      {/* TELA EXERCÍCIO */}
      {tela === "exercicio" && exercicioAtual && (
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#141414", borderBottom: "1px solid #1E1E1E", padding: "20px 24px" }}>
            <button onClick={() => { setTela("home"); limparExercicio(); }} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 14, padding: 0 }}>← Voltar</button>
            <Badge texto={`${CATEGORIAS[exercicioAtual.categoria].emoji} ${CATEGORIAS[exercicioAtual.categoria].label}`} cor={corAtual} />
            <div style={{ fontSize: 22, marginTop: 10, lineHeight: 1.3 }}>{exercicioAtual.titulo}</div>
          </div>
          <div style={{ padding: 24, flex: 1, display: "flex", flexDirection: "column", gap: 18 }}>
            <Cronometro duracao={exercicioAtual.duracao} />

            <div style={{ background: "#141414", border: "1px solid #1E1E1E", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>Instrução</div>
              <div style={{ fontSize: 14, color: "#C0BDB6", lineHeight: 1.7 }}>{exercicioAtual.instrucao}</div>
            </div>

            <div style={{ background: corAtual + "11", border: `1px solid ${corAtual}33`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: 3, color: corAtual + "99", textTransform: "uppercase", marginBottom: 8 }}>Material</div>
              <div style={{ fontSize: 16, color: "#F0EDE6", lineHeight: 1.7, fontStyle: "italic" }}>{exercicioAtual.prompt}</div>
            </div>

            <div style={{ display: "flex", gap: 10, padding: "12px 14px", background: "#0A0A0A", borderRadius: 10, border: "1px solid #1A1A1A" }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>💡</span>
              <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{exercicioAtual.dica}</div>
            </div>

            {!feedback && (
              <div style={{ display: "flex", background: "#141414", border: "1px solid #1E1E1E", borderRadius: 10, padding: 3 }}>
                {[{ id: "voz", label: "🎙 Gravar voz" }, { id: "texto", label: "✏️ Escrever" }].map(m => (
                  <button key={m.id} onClick={() => setModoEntrada(m.id)} style={{ flex: 1, background: modoEntrada === m.id ? corAtual : "none", color: modoEntrada === m.id ? "#0F0F0F" : "#555", border: "none", borderRadius: 8, padding: "8px", fontSize: 13, fontFamily: "inherit", cursor: "pointer" }}>{m.label}</button>
                ))}
              </div>
            )}

            {!feedback && modoEntrada === "voz" && (
              <GravadorVoz cor={corAtual} onTranscricao={(t, a) => { setTranscricao(t); setAnaliseVoz(a); }} />
            )}

            {!feedback && modoEntrada === "texto" && (
              <div>
                <div style={{ fontSize: 10, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 8 }}>Sua resposta</div>
                <textarea value={respostaTexto} onChange={e => setRespostaTexto(e.target.value)} placeholder="Escreva o que você falou, como foi, o que percebeu..." style={{ width: "100%", minHeight: 110, background: "#141414", border: "1px solid #2A2A2A", borderRadius: 12, padding: 16, color: "#F0EDE6", fontSize: 15, fontFamily: "inherit", lineHeight: 1.7, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
              </div>
            )}

            {!feedback && (
              <button onClick={obterFeedback} disabled={carregando || !(modoEntrada === "voz" ? transcricao : respostaTexto).trim()} style={{ background: (modoEntrada === "voz" ? transcricao : respostaTexto).trim() ? corAtual : "#1A1A1A", color: (modoEntrada === "voz" ? transcricao : respostaTexto).trim() ? "#0F0F0F" : "#444", border: "none", borderRadius: 12, padding: 16, fontSize: 15, fontFamily: "inherit", cursor: "pointer" }}>
                {carregando ? "Analisando..." : "Receber feedback da IA →"}
              </button>
            )}

            {feedback && (
              <div style={{ background: "#141414", border: "1px solid #2A2A2A", borderRadius: 14, padding: 20, animation: "fadeIn 0.4s ease" }}>
                <div style={{ fontSize: 10, letterSpacing: 3, color: corAtual, textTransform: "uppercase", marginBottom: 12 }}>✦ Feedback do Coach</div>
                <div style={{ fontSize: 14, color: "#C0BDB6", lineHeight: 1.8 }}>{feedback}</div>
                <button onClick={() => { setTela("home"); limparExercicio(); }} style={{ marginTop: 16, background: corAtual, color: "#0F0F0F", border: "none", borderRadius: 10, padding: 12, fontSize: 13, fontFamily: "inherit", cursor: "pointer", width: "100%" }}>Próximo exercício →</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TELA SIMULAÇÃO */}
      {tela === "simulacao" && simulacaoAtual && (
        <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
          <div style={{ background: "#141414", borderBottom: "1px solid #1E1E1E", padding: "18px 24px", flexShrink: 0 }}>
            <button onClick={() => setTela("home")} style={{ background: "none", border: "none", color: "#666", fontSize: 13, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, padding: 0 }}>← Encerrar</button>
            <Badge texto={`🎭 ${simulacaoAtual.titulo}`} cor={simulacaoAtual.cor} />
          </div>
          <div ref={chatRef} style={{ flex: 1, overflowY: "auto", padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
            {mensagens.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ background: m.role === "user" ? simulacaoAtual.cor + "22" : "#141414", border: `1px solid ${m.role === "user" ? simulacaoAtual.cor + "55" : "#222"}`, borderRadius: m.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px", padding: "12px 16px", maxWidth: "82%", fontSize: 14, lineHeight: 1.7, color: m.role === "user" ? "#F0EDE6" : "#C0BDB6" }}>
                  {m.content}
                </div>
              </div>
            ))}
            {carregando && (
              <div style={{ display: "flex", gap: 5, padding: "12px 16px", background: "#141414", borderRadius: "14px 14px 14px 4px", width: "fit-content", border: "1px solid #222" }}>
                {[0, 1, 2].map(i => <div key={i} style={{ width: 6, height: 6, background: "#555", borderRadius: "50%", animation: `pulse 1.2s ${i * 0.2}s infinite` }} />)}
              </div>
            )}
          </div>
          <div style={{ background: "#141414", borderTop: "1px solid #1E1E1E", padding: "12px 20px", display: "flex", gap: 10, flexShrink: 0 }}>
            <input value={inputSim} onChange={e => setInputSim(e.target.value)} onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviarSim()} placeholder="Escreva sua fala..." style={{ flex: 1, background: "#0F0F0F", border: "1px solid #2A2A2A", borderRadius: 10, padding: "10px 14px", color: "#F0EDE6", fontSize: 14, fontFamily: "inherit", outline: "none" }} />
            <button onClick={enviarSim} disabled={!inputSim.trim() || carregando} style={{ background: inputSim.trim() ? simulacaoAtual.cor : "#1A1A1A", color: inputSim.trim() ? "#0F0F0F" : "#444", border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontSize: 16 }}>→</button>
          </div>
        </div>
      )}

      {/* HOME */}
      {tela === "home" && (
        <>
          <div style={{ padding: "32px 24px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: 4, color: "#555", textTransform: "uppercase", marginBottom: 6 }}>Coach de Comunicação</div>
                <div style={{ fontSize: 28, lineHeight: 1.2 }}>Sua Voz,<br /><span style={{ color: "#E8C547", fontStyle: "italic" }}>Sua Presença.</span></div>
              </div>
              <div style={{ background: "#141414", border: "1px solid #222", borderRadius: 12, padding: "10px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22 }}>🔥</div>
                <div style={{ fontSize: 13, color: "#E8C547", fontFamily: "monospace" }}>3</div>
                <div style={{ fontSize: 10, color: "#555" }}>dias</div>
              </div>
            </div>
            {totalSessoes > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginTop: 20 }}>
                {[{ label: "Sessões", valor: totalSessoes, cor: "#E8C547" }, { label: "Score médio", valor: scoreMedio + "%", cor: "#47B8E8" }, { label: "Streak", valor: "3d", cor: "#E87C47" }].map(m => (
                  <div key={m.label} style={{ background: "#141414", border: "1px solid #1E1E1E", borderRadius: 10, padding: 10, textAlign: "center" }}>
                    <div style={{ fontSize: 20, color: m.cor, fontFamily: "monospace" }}>{m.valor}</div>
                    <div style={{ fontSize: 10, color: "#555", marginTop: 2 }}>{m.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", margin: "24px 24px 0", background: "#141414", borderRadius: 12, padding: 4, border: "1px solid #1E1E1E" }}>
            {[{ id: "treino", label: "Treino" }, { id: "simulacao", label: "Simulação" }, { id: "progresso", label: "Progresso" }, { id: "dicas", label: "Dicas" }].map(a => (
              <button key={a.id} onClick={() => setAba(a.id)} style={{ flex: 1, background: aba === a.id ? "#E8C547" : "none", color: aba === a.id ? "#0F0F0F" : "#555", border: "none", borderRadius: 9, padding: "8px 4px", fontSize: 11, fontFamily: "inherit", cursor: "pointer" }}>{a.label}</button>
            ))}
          </div>

          <div style={{ padding: "20px 24px" }}>
            {aba === "treino" && (
              <>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
                  <button onClick={() => setCategoriaSel(null)} style={{ background: !categoriaSel ? "#E8C547" : "#141414", color: !categoriaSel ? "#0F0F0F" : "#666", border: `1px solid ${!categoriaSel ? "#E8C547" : "#2A2A2A"}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>Hoje</button>
                  {Object.entries(CATEGORIAS).filter(([k]) => k !== "simulacao").map(([key, cat]) => (
                    <button key={key} onClick={() => setCategoriaSel(key)} style={{ background: categoriaSel === key ? cat.cor : "#141414", color: categoriaSel === key ? "#0F0F0F" : "#666", border: `1px solid ${categoriaSel === key ? cat.cor : "#2A2A2A"}`, borderRadius: 20, padding: "5px 12px", fontSize: 11, cursor: "pointer", fontFamily: "inherit" }}>{cat.emoji}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {listaEx.map(ex => {
                    const cat = CATEGORIAS[ex.categoria];
                    const feito = historico.some(h => h.titulo === ex.titulo && Date.now() - h.data < 86400000);
                    return (
                      <button key={ex.id} onClick={() => { setExercicioAtual(ex); limparExercicio(); setModoEntrada("voz"); setTela("exercicio"); }} style={{ background: "#141414", border: "1px solid #1E1E1E", borderLeft: `3px solid ${cat.cor}`, borderRadius: 14, padding: 18, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <Badge texto={`${cat.emoji} ${cat.label}`} cor={cat.cor} />
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 10, color: "#555" }}>🎙 {ex.duracao}min</span>
                            {feito && <span>✅</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: 16, color: "#F0EDE6", marginBottom: 6 }}>{ex.titulo}</div>
                        <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{ex.instrucao.substring(0, 70)}...</div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {aba === "simulacao" && (
              <>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>Pratique situações reais com a IA no papel do interlocutor. Feedback ao final.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {SIMULACOES.map(sim => (
                    <button key={sim.id} onClick={() => iniciarSim(sim)} style={{ background: "#141414", border: "1px solid #222", borderLeft: `3px solid ${sim.cor}`, borderRadius: 14, padding: 18, textAlign: "left", cursor: "pointer", fontFamily: "inherit" }}>
                      <div style={{ marginBottom: 8 }}><Badge texto="🎭 Simulação" cor={sim.cor} /></div>
                      <div style={{ fontSize: 16, color: "#F0EDE6", marginBottom: 6 }}>{sim.titulo}</div>
                      <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5 }}>{sim.cenario.substring(0, 80)}...</div>
                      <div style={{ marginTop: 10, fontSize: 11, color: sim.cor }}>Papel da IA: {sim.papel} →</div>
                    </button>
                  ))}
                </div>
              </>
            )}

            {aba === "progresso" && (
              totalSessoes === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: "#444" }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
                  <div style={{ fontSize: 14 }}>Complete seus primeiros exercícios<br />para ver seu progresso aqui.</div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 14 }}>Por categoria</div>
                    {Object.keys(CATEGORIAS).map(k => {
                      const count = historico.filter(h => h.categoria === k).length;
                      if (!count) return null;
                      const cat = CATEGORIAS[k];
                      return (
                        <div key={k} style={{ marginBottom: 14 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                            <span style={{ fontSize: 13, color: "#C0BDB6" }}>{cat.emoji} {cat.label}</span>
                            <span style={{ fontSize: 13, color: cat.cor, fontFamily: "monospace" }}>{count}×</span>
                          </div>
                          <PBar valor={count * 20} cor={cat.cor} />
                        </div>
                      );
                    })}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, letterSpacing: 3, color: "#555", textTransform: "uppercase", marginBottom: 14 }}>Histórico recente</div>
                    {historico.slice(-6).reverse().map((h, i) => {
                      const cat = CATEGORIAS[h.categoria];
                      return (
                        <div key={i} style={{ background: "#141414", border: "1px solid #1E1E1E", borderRadius: 10, padding: "12px 16px", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 13, color: "#C0BDB6" }}>{h.titulo}</div>
                            <div style={{ fontSize: 11, color: "#555", marginTop: 2 }}>{cat?.label} · {new Date(h.data).toLocaleDateString("pt-BR")}</div>
                          </div>
                          <div style={{ fontSize: 13, color: "#47E8B8", fontFamily: "monospace" }}>{Math.round(h.score || 75)}%</div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            )}

            {aba === "dicas" && (
              <>
                <div style={{ fontSize: 13, color: "#666", marginBottom: 20, lineHeight: 1.6 }}>Técnicas dos melhores coaches e metodologias de comunicação.</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {DICAS.map((d, i) => {
                    const cat = CATEGORIAS[d.categoria];
                    return (
                      <div key={i} style={{ background: "#141414", borderLeft: `3px solid ${cat.cor}`, borderRadius: 14, padding: 18, border: "1px solid #1E1E1E" }}>
                        <div style={{ marginBottom: 8 }}><Badge texto={`${cat.emoji} ${cat.label}`} cor={cat.cor} /></div>
                        <div style={{ fontSize: 15, color: "#F0EDE6", marginBottom: 8 }}>{d.titulo}</div>
                        <div style={{ fontSize: 13, color: "#888", lineHeight: 1.7 }}>{d.texto}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        @keyframes pulseBtn { 0%,100%{box-shadow:0 0 0 0 #E87C4766} 50%{box-shadow:0 0 0 10px #E87C4700} }
        *{box-sizing:border-box}
        button:active{opacity:0.8}
        textarea:focus,input:focus{border-color:#333!important}
        ::-webkit-scrollbar{width:4px}
        ::-webkit-scrollbar-track{background:#0F0F0F}
        ::-webkit-scrollbar-thumb{background:#222;border-radius:2px}
      `}</style>
    </div>
  );
}
