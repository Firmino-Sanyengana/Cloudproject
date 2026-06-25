import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Languages, MessagesSquare, Trophy, GraduationCap, CheckCircle2 } from "lucide-react";
import ImageCarousel from "../components/ImageCarousel";

export default function Home() {
  return (
    <div className="home-page space-y-20">
      {/* HERO */}
      <section className="hero-section">
        <div className="hero-text">
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-title"
          >
            Aprende <span className="text-brand-600">línguas</span> com a comunidade
          </motion.h1>
          <p className="hero-subtitle">
            Cursos com lições, quizzes, exercícios de preencher lacunas, frases
            embaralhadas, tradução, chat por curso e acompanhamento do teu progresso.
          </p>
          <div className="hero-buttons">
            <Link to="/courses" className="btn-primary">
              <BookOpen size={16} /> Ver cursos
            </Link>
            <Link to="/register" className="btn-secondary">
              <GraduationCap size={16} /> Criar conta grátis
            </Link>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="hero-image-wrap"
        >
          <ImageCarousel interval={10000} />

        </motion.div>
      </section>

      {/* FEATURES */}
      <section className="features-grid">
        {[
          { icon: BookOpen, t: "Cursos por nível", d: "Iniciante, intermédio e avançado" },
          { icon: Languages, t: "Tradução automática", d: "Integração gratuita MyMemory" },
          { icon: MessagesSquare, t: "Chat por curso", d: "Conversa com os teus colegas" },
          { icon: Trophy, t: "Progresso e histórico", d: "Acompanha cada exercício e a data" },
        ].map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="feature-card"
          >
            <f.icon className="text-brand-600" />
            <h3 className="mt-2 font-semibold">{f.t}</h3>
            <p className="text-sm text-slate-500 mt-1">{f.d}</p>
          </motion.div>
        ))}
      </section>

      {/* BENEFITS */}
      <section className="benefits-section">
        <div className="benefits-text">
          <h2 className="benefits-title">
            Porquê aprender uma língua com a nossa plataforma?
          </h2>
          <ul className="benefits-list">
            <li>
              <CheckCircle2 className="text-brand-600" size={20} />
              Abre portas a novas oportunidades de estudo e trabalho, dentro e fora do país.
            </li>
            <li>
              <CheckCircle2 className="text-brand-600" size={20} />
              Conecta-te com pessoas de Angola e de todo o mundo numa comunidade de aprendizagem.
            </li>
            <li>
              <CheckCircle2 className="text-brand-600" size={20} />
              Conteúdos adaptados ao teu nível, com exercícios práticos e feedback imediato.
            </li>
            <li>
              <CheckCircle2 className="text-brand-600" size={20} />
              Acompanha o teu progresso e celebra cada conquista no caminho.
            </li>
          </ul>
          <Link to="/register" className="btn-primary mt-4 inline-flex">
            Começar agora
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="benefits-image-wrap"
        >
          <img
            src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80"
            alt="Jovem africana estudando línguas"
            className="benefits-image"
          />
        </motion.div>
      </section>
    </div>
  );
}