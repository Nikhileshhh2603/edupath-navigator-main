import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import heroImg from "@/assets/student-hero.jpg";
import notebookImg from "@/assets/notebook.jpg";
import graphSketch from "@/assets/graph-sketch.jpg";
import walkingImg from "@/assets/student-walking.jpg";
import paperTexture from "@/assets/paper-texture.jpg";
import libraryStudy from "@/assets/library-study.jpg";
import handwrittenGraph from "@/assets/handwritten-graph.jpg";
import campusWalk from "@/assets/campus-walk.jpg";
import handwriting from "@/assets/handwriting.jpg";
import { useReveal } from "@/hooks/use-reveal";

const paperStyle = { ["--paper-img" as string]: `url(${paperTexture})` } as React.CSSProperties;

const scrollTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/* ---------- Editorial display heading: one letter per cell, staggered rise ---------- */
const Editorial = ({ text, className = "", baseDelay = 0 }: { text: string; className?: string; baseDelay?: number }) => (
  <span className={`editorial-display ${className}`} aria-label={text}>
    {text.split("").map((c, i) => (
      <span
        key={i}
        className="ch"
        style={{
          animationDelay: `${baseDelay + i * 0.06}s`,
          marginRight: c === " " ? "0.35em" : "0.04em",
        }}
      >
        {c === " " ? "\u00A0" : c}
      </span>
    ))}
  </span>
);

/* ---------- Nav ---------- */
const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-paper/85 backdrop-blur-md border-b border-rule/40" : ""
      }`}
    >
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 py-5 flex items-center justify-between">
        <a
          href="#top"
          onClick={(e) => { e.preventDefault(); scrollTo("top"); }}
          className="serif text-2xl tracking-tight text-ink"
        >
          EduGraph<span className="text-terracotta">.</span>
        </a>
        <nav className="hidden md:flex items-center gap-10 text-[0.7rem] uppercase tracking-[0.28em] text-ink-soft">
          {[["Manifesto","manifesto"],["Graph","graph"],["Risk","risk"],["Assistant","assistant"],["Journal","journal"]].map(([l, id]) => (
            <a key={id} href={`#${id}`} onClick={(e) => { e.preventDefault(); scrollTo(id); }} className="hover:text-ink transition-colors">{l}</a>
          ))}
        </nav>
        <a href="/auth" className="oval-btn">Sign In</a>
      </div>
    </header>
  );
};

/* ---------- Hero ---------- */
const Hero = () => {
  const [email, setEmail] = useState("");
  const titleRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (titleRef.current) {
        const y = window.scrollY;
        titleRef.current.style.transform = `translateY(${y * 0.22}px)`;
        titleRef.current.style.opacity = `${Math.max(0, 1 - y / 700)}`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email.");
    toast.success("Welcome to the EduGraph beta.", { description: `We'll write to ${email} soon.` });
    setEmail("");
  };

  return (
    <section
      id="top"
      className="relative min-h-screen flex flex-col justify-center pt-32 pb-20 paper-bg overflow-hidden"
      style={paperStyle}
    >
      {/* faint side photographs */}
      <img
        src={libraryStudy}
        alt=""
        aria-hidden
        className="hidden lg:block absolute left-[-4%] top-[18%] w-[22%] grayscale opacity-90 rotate-[-3deg] shadow-[0_30px_80px_-30px_hsl(var(--paper-shadow))]"
      />
      <img
        src={handwriting}
        alt=""
        aria-hidden
        className="hidden lg:block absolute right-[-3%] top-[28%] w-[20%] grayscale opacity-90 rotate-[4deg] shadow-[0_30px_80px_-30px_hsl(var(--paper-shadow))]"
      />

      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12 w-full text-center" ref={titleRef}>
        <p className="eyebrow mb-10 opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          <span className="star-divider">Volume I — Weekly Insights</span>
        </p>

        <h1 className="text-ink text-[18vw] md:text-[11.5vw]">
          <Editorial text="Learn" />
        </h1>
        <h1 className="text-ink text-[18vw] md:text-[11.5vw] mt-1 italic text-terracotta">
          <Editorial text="Curated" baseDelay={0.5} />
        </h1>

        <p
          className="mt-12 max-w-md mx-auto text-ink-soft text-[0.95rem] leading-relaxed opacity-0 animate-fade-up"
          style={{ animationDelay: "1.4s" }}
        >
          Clear, actionable academic insights delivered<br />in a five-minute daily ritual.
        </p>

        <form
          onSubmit={submit}
          className="mt-10 max-w-md mx-auto flex items-center gap-4 border-b border-ink/50 pb-3 opacity-0 animate-fade-up"
          style={{ animationDelay: "1.6s" }}
        >
          <span className="text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft">email:</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent outline-none text-[0.85rem] text-ink placeholder:text-ink-soft/50"
            placeholder="you@university.edu"
          />
          <button type="submit" className="oval-btn whitespace-nowrap">Join Club</button>
        </form>

        <p
          className="mt-5 text-[0.72rem] tracking-wide text-ink-soft/70 italic max-w-sm mx-auto opacity-0 animate-fade-up"
          style={{ animationDelay: "1.8s" }}
        >
          Club Member perks include personalized knowledge audits & study blueprints. Completely free. Leave whenever.
        </p>
      </div>

      {/* scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-ink-soft text-[0.65rem] tracking-[0.4em] uppercase opacity-0 animate-fade-up" style={{ animationDelay: "2.1s" }}>
        Scroll ↓
      </div>
    </section>
  );
};

/* ---------- Marquee ticker ---------- */
const Ticker = ({ words, slow = false }: { words: string[]; slow?: boolean }) => {
  const row = (
    <div className="marquee-track">
      {words.concat(words).map((w, i) => (
        <span key={i} className="serif italic text-[12vw] md:text-[7vw] leading-none text-ink whitespace-nowrap">
          {w} <span className="text-terracotta not-italic align-middle text-[5vw] md:text-[3vw]">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className={`marquee py-10 md:py-14 paper-bg border-y border-rule/40 ${slow ? "marquee-slow" : ""}`} style={paperStyle}>
      {row}
    </div>
  );
};

/* ---------- Photo strip with parallax ---------- */
const PhotoStrip = ({ src, caption }: { src: string; caption?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const offset = (rect.top - window.innerHeight) * 0.18;
      const img = ref.current.querySelector("img") as HTMLImageElement | null;
      if (img) img.style.transform = `translateY(${-offset}px) scale(1.18)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <div ref={ref} className="relative h-[60vh] md:h-[85vh] overflow-hidden">
      <img src={src} alt={caption ?? ""} loading="lazy" className="absolute inset-0 w-full h-full object-cover grayscale will-change-transform" />
      <div className="absolute inset-0 grain" />
      <div className="absolute inset-0 bg-ink/15" />
      {caption && (
        <div className="absolute bottom-8 left-8 md:bottom-12 md:left-14 text-paper text-[0.7rem] tracking-[0.32em] uppercase">
          — {caption}
        </div>
      )}
    </div>
  );
};

/* ---------- Manifesto ---------- */
const Manifesto = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  return (
    <section ref={ref} id="manifesto" className="relative py-32 md:py-44 paper-bg" style={paperStyle}>
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 grid md:grid-cols-12 gap-10">
        <div className="md:col-span-3 reveal">
          <p className="eyebrow">— Manifesto / 01</p>
          <p className="mt-6 text-ink-soft text-sm italic max-w-[180px] leading-relaxed">
            "A quiet intelligence layer for the modern student."
          </p>
        </div>
        <div className="md:col-span-9 reveal">
          <p className="serif text-3xl md:text-[2.9rem] leading-[1.18] text-ink">
            Most students don't fail because they're slow. They fail because no one
            ever shows them <em className="italic text-terracotta">which thread to pull first.</em>
            EduGraph turns the syllabus into a living map — so the next right step
            is always obvious, and the next missing piece is never a surprise.
          </p>
          <div className="mt-12 flex items-center gap-6 text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft">
            <span>— The Editors</span>
            <span className="h-px w-16 bg-rule" />
            <span>Edition One</span>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- Four pillars (ordrhealth-style mini cards row) ---------- */
const Pillars = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  const items = [
    { t: "time-saving", d: "Long lectures. Endless PDFs. We map them all. You get what's missing." },
    { t: "Hand-curated", d: "Curricula distilled into practical, actionable next steps — not noise." },
    { t: "Beyond grades", d: "Free study protocols and revision routines inspired by top scorers." },
    { t: "Evidence-based", d: "Spaced repetition, retrieval practice, and cognitive science — applied." },
  ];
  return (
    <section ref={ref} className="py-28 md:py-36 paper-bg border-t border-rule/30" style={paperStyle}>
      <div className="mx-auto max-w-[1500px] px-6 md:px-12 grid md:grid-cols-4 gap-12 md:gap-8">
        {items.map((it, i) => (
          <div key={i} className="reveal" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className="text-terracotta text-sm mb-4">✦ ✦</div>
            <h4 className="serif text-2xl md:text-3xl text-ink mb-3 italic">{it.t}</h4>
            <p className="text-ink-soft text-sm leading-relaxed">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

/* ---------- Feature row ---------- */
const FeatureRow = ({
  index, eyebrow, title, italicWord, body, img, reverse, id,
}: {
  index: string; eyebrow: string; title: string; italicWord: string;
  body: string; img: string; reverse?: boolean; id: string;
}) => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  return (
    <section ref={ref} id={id} className="py-28 md:py-40 paper-bg" style={paperStyle}>
      <div className={`mx-auto max-w-[1500px] px-6 md:px-12 grid md:grid-cols-12 gap-12 items-center ${reverse ? "md:[&>*:first-child]:order-2" : ""}`}>
        <div className="md:col-span-7 relative reveal">
          <div className="relative overflow-hidden shadow-[0_40px_100px_-40px_hsl(var(--paper-shadow)/0.85)]">
            <img src={img} alt={title} loading="lazy" className="w-full h-[60vh] md:h-[78vh] object-cover grayscale" />
            <div className="absolute inset-0 grain" />
            <div className="absolute top-4 left-4 text-paper text-[0.65rem] tracking-[0.32em] uppercase">
              Plate {index}
            </div>
          </div>
          <p className="mt-3 text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft">Fig. {index} — {title}</p>
        </div>
        <div className="md:col-span-5 reveal">
          <p className="eyebrow mb-6">— {eyebrow} / {index}</p>
          <h2 className="serif text-5xl md:text-[5.5rem] leading-[0.92] mb-8 text-ink">
            {title} <em className="italic text-terracotta block">{italicWord}</em>
          </h2>
          <p className="text-ink-soft leading-relaxed text-[1.05rem]">{body}</p>
          <button onClick={() => toast(`${title} ${italicWord} — preview`, { description: "Full module unlocks for beta members." })} className="oval-btn mt-10">
            Explore →
          </button>
        </div>
      </div>
    </section>
  );
};

/* ---------- Stats — dark sage section ---------- */
const Stats = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  return (
    <section ref={ref} className="sage-section py-32 md:py-48 relative overflow-hidden">
      <div className="absolute inset-0 grain opacity-30" />
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12">
        <p className="eyebrow text-center mb-6 text-paper/60 reveal">— By The Numbers</p>
        <h2 className="serif text-center text-paper text-4xl md:text-6xl mb-24 reveal italic">
          What the data <span className="text-terracotta">whispers.</span>
        </h2>
        <div className="grid md:grid-cols-3 gap-16 md:gap-8">
          {[
            { n: "73%", l: "of academic risk traces back to a single missing prerequisite." },
            { n: "5 min", l: "is all it takes to surface every gap in a semester's material." },
            { n: "1:1", l: "an AI tutor that already knows what you've mastered." },
          ].map((s, i) => (
            <div key={i} className="text-center reveal" style={{ transitionDelay: `${i * 0.12}s` }}>
              <div className="serif text-7xl md:text-[8rem] text-paper leading-none">
                <span className={i === 1 ? "text-terracotta italic" : ""}>{s.n}</span>
              </div>
              <div className="mt-8 text-paper/70 text-sm max-w-xs mx-auto leading-relaxed italic">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- Journal ---------- */
const Journal = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  return (
    <section ref={ref} id="journal" className="py-32 md:py-44 paper-bg" style={paperStyle}>
      <div className="mx-auto max-w-[1500px] px-6 md:px-12">
        <div className="flex items-end justify-between mb-16 reveal">
          <div>
            <p className="eyebrow mb-4">— The Journal</p>
            <h2 className="serif text-5xl md:text-[5.5rem] text-ink leading-[0.95]">
              Field Notes on<br />
              <em className="italic text-terracotta">Better Studying.</em>
            </h2>
          </div>
          <button onClick={() => toast("Journal launching with beta.")} className="oval-btn hidden md:inline-block">
            All Entries
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { tag: "Issue 014", t: "The Anatomy of a Knowledge Gap", d: "Why missing one prerequisite cascades for semesters — and how to spot it in five minutes.", img: notebookImg },
            { tag: "Issue 013", t: "Risk Is Not a Letter Grade",     d: "Attendance, trend, assignments, gaps. A four-axis lens that actually predicts.",            img: handwrittenGraph },
            { tag: "Issue 012", t: "An AI That Knows What You Don't",d: "Context-aware tutoring beats generic chatbots — by an order of magnitude.",                img: libraryStudy },
          ].map((p, i) => (
            <article key={i} className="group cursor-pointer reveal" style={{ transitionDelay: `${i * 0.1}s` }}
              onClick={() => toast(p.t, { description: "Full essay opens with beta access." })}>
              <div className="aspect-[4/5] overflow-hidden bg-paper-deep relative">
                <img src={p.img} alt={p.t} loading="lazy" className="w-full h-full object-cover grayscale group-hover:scale-[1.05] transition-transform duration-[1400ms] ease-out" />
                <div className="absolute inset-0 grain" />
                <div className="absolute top-4 left-4 right-4 flex justify-between text-paper text-[0.65rem] tracking-[0.32em] uppercase">
                  <span>{p.tag}</span>
                  <span>5 min read</span>
                </div>
              </div>
              <h3 className="serif text-2xl md:text-3xl mt-6 text-ink leading-tight">
                <span className="editorial-link">{p.t}</span>
              </h3>
              <p className="mt-3 text-ink-soft text-sm leading-relaxed italic">{p.d}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ---------- Membership card (ordrhealth's "club card" homage) ---------- */
const MemberCard = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  const [email, setEmail] = useState("");
  return (
    <section ref={ref} className="py-28 md:py-40 paper-bg" style={paperStyle}>
      <div className="mx-auto max-w-[1100px] px-6 md:px-12">
        <div className="reveal border border-ink/30 p-10 md:p-16 relative bg-paper-deep/40">
          <div className="absolute -top-3 left-10 bg-paper px-3 text-[0.65rem] tracking-[0.32em] uppercase text-ink-soft">
            EduGraph · Member Card
          </div>
          <div className="absolute -top-3 right-10 bg-paper px-3 text-[0.65rem] tracking-[0.32em] uppercase text-terracotta">
            № 0001
          </div>

          <p className="eyebrow mb-6">Join the Club</p>
          <h3 className="serif text-4xl md:text-6xl text-ink leading-[0.95] mb-8">
            Free access to the<br />
            <em className="italic text-terracotta">study library.</em>
          </h3>
          <p className="text-ink-soft text-sm md:text-base max-w-md leading-relaxed mb-10">
            Membership includes: a PhD in deliberate practice (diploma not included),
            executive access to study protocols, and permission to say
            <em className="italic"> "I've already revised that."</em>
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return toast.error("Please enter a valid email.");
              toast.success("Welcome to the club.", { description: `Card no. ${Math.floor(Math.random() * 8999 + 1000)} reserved for ${email}.` });
              setEmail("");
            }}
            className="flex items-center gap-4 border-b border-ink/50 pb-3 max-w-lg"
          >
            <span className="text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft">email:</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-transparent outline-none text-[0.85rem] text-ink placeholder:text-ink-soft/50"
              placeholder="you@university.edu"
            />
            <button type="submit" className="oval-btn oval-btn-accent whitespace-nowrap">Get Card</button>
          </form>

          <div className="mt-10 grid grid-cols-3 gap-6 text-[0.65rem] tracking-[0.32em] uppercase text-ink-soft border-t border-rule/40 pt-6">
            <div><div className="text-ink serif text-2xl normal-case tracking-normal italic">Free</div>forever</div>
            <div><div className="text-ink serif text-2xl normal-case tracking-normal italic">Weekly</div>insights</div>
            <div><div className="text-ink serif text-2xl normal-case tracking-normal italic">No spam</div>promise</div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ---------- CTA ---------- */
const CTA = () => {
  const ref = useReveal() as React.RefObject<HTMLElement>;
  return (
    <section ref={ref} className="py-40 md:py-56 paper-bg relative overflow-hidden border-t border-rule/30" style={paperStyle}>
      <div className="relative mx-auto max-w-[1500px] px-6 md:px-12 text-center">
        <p className="eyebrow mb-8 reveal"><span className="star-divider">Begin</span></p>
        <h2 className="serif text-[14vw] md:text-[10vw] text-ink leading-[0.86] reveal">A Smarter</h2>
        <h2 className="serif italic text-[14vw] md:text-[10vw] text-terracotta leading-[0.86] reveal">Semester.</h2>
        <p className="mt-12 max-w-md mx-auto text-ink-soft reveal italic">
          Join the first cohort of students mapping their education with intent.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4 reveal">
          <button onClick={() => { scrollTo("top"); toast.success("Drop your email at the top to get started."); }} className="oval-btn oval-btn-solid">
            Get Started
          </button>
          <button onClick={() => toast("Demo video drops next week.", { description: "We'll email you the link." })} className="oval-btn">
            Watch Demo
          </button>
        </div>
      </div>
    </section>
  );
};

/* ---------- Footer ---------- */
const Footer = () => (
  <footer className="paper-bg border-t border-rule py-16" style={paperStyle}>
    <div className="mx-auto max-w-[1500px] px-6 md:px-12 grid md:grid-cols-4 gap-10">
      <div className="md:col-span-2">
        <div className="serif text-3xl text-ink">EduGraph<span className="text-terracotta">.</span></div>
        <p className="mt-4 text-ink-soft text-sm max-w-xs leading-relaxed italic">
          A quiet intelligence layer for the modern student. Made with care.
        </p>
      </div>
      <div>
        <p className="eyebrow mb-5">Product</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li><a href="#graph" onClick={(e) => { e.preventDefault(); scrollTo("graph"); }} className="hover:text-ink">Knowledge Graph</a></li>
          <li><a href="#risk" onClick={(e) => { e.preventDefault(); scrollTo("risk"); }} className="hover:text-ink">Risk Analyzer</a></li>
          <li><a href="#assistant" onClick={(e) => { e.preventDefault(); scrollTo("assistant"); }} className="hover:text-ink">AI Assistant</a></li>
        </ul>
      </div>
      <div>
        <p className="eyebrow mb-5">Company</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li><a href="#journal" onClick={(e) => { e.preventDefault(); scrollTo("journal"); }} className="hover:text-ink">Journal</a></li>
          <li><button onClick={() => toast("Faculty onboarding opens Q3.")} className="hover:text-ink">For Faculty</button></li>
          <li><button onClick={() => toast("hello@edugraph.studio")} className="hover:text-ink">Contact</button></li>
        </ul>
      </div>
    </div>
    <div className="mx-auto max-w-[1500px] px-6 md:px-12 mt-16 flex flex-col md:flex-row gap-3 justify-between text-[0.7rem] tracking-[0.28em] uppercase text-ink-soft/70">
      <span>© {new Date().getFullYear()} EduGraph Studio</span>
      <span>Volume I — Edition One</span>
    </div>
  </footer>
);

/* ---------- Page ---------- */
const Index = () => {
  useEffect(() => {
    document.title = "EduGraph — Learn Curated";
    const m = document.querySelector('meta[name="description"]');
    const c = "EduGraph maps what you know and what you're missing — a quiet AI study companion for students who want to learn deliberately.";
    if (m) m.setAttribute("content", c);
    else {
      const el = document.createElement("meta");
      el.name = "description"; el.content = c;
      document.head.appendChild(el);
    }
  }, []);

  return (
    <main className="bg-paper text-foreground min-h-screen">
      <Nav />
      <Hero />
      <Ticker words={["Map what you know", "Surface every gap", "Study with intent", "Curated, not chaotic"]} />
      <PhotoStrip src={campusWalk} caption="Plate I — The Quad" />
      <Manifesto />
      <Pillars />
      <FeatureRow id="graph" index="01" eyebrow="The Map" title="Knowledge," italicWord="Drawn." img={handwrittenGraph}
        body="Every topic you've ever studied, rendered as a living map. Mastered, ready, blocked — at a glance. Click any node to see what's holding you back, and what unlocks next." />
      <Ticker slow words={["Knowledge graph", "Risk analyzer", "AI study companion", "Spaced repetition"]} />
      <FeatureRow id="risk" index="02" eyebrow="The Diagnosis" title="Risk," italicWord="Honestly." img={notebookImg} reverse
        body="A four-axis read on where the semester is actually heading. Attendance, trend, assignments, and the gaps you didn't know you had. No grade-book guesswork — just the truth." />
      <PhotoStrip src={libraryStudy} caption="Plate II — The Reading Room" />
      <FeatureRow id="assistant" index="03" eyebrow="The Companion" title="A Tutor That" italicWord="Listens." img={handwriting}
        body="An AI study partner that already knows what you've mastered and what you're missing. Ask it anything — it answers in the context of your map, not the whole internet." />
      <Stats />
      <Journal />
      <MemberCard />
      <CTA />
      <Footer />
    </main>
  );
};

export default Index;
