import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
  List,
  SealCheck,
} from '@phosphor-icons/react';
import { useReducedMotion } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RESUME_B64 } from './resume-base64';

gsap.registerPlugin(ScrollTrigger);

const platforms = [
  { label: 'GitHub', url: 'https://github.com/Shivmahlan' },
  { label: 'Kaggle', url: 'https://kaggle.com/shivmahlan' },
  { label: 'PyPI', url: 'https://pypi.org/project/dcleaner' },
  { label: 'LeetCode', url: 'https://leetcode.com/shivmahlan' },
  { label: 'LinkedIn', url: 'https://www.linkedin.com/in/shivmahlan' },
];

const methods = [
  ['Frame the question', 'Clarify the decision, the evidence, and what good looks like before modeling.'],
  ['Interrogate the data', 'Trace each signal to its source, then test the gaps and assumptions.'],
  ['Make it usable', 'Build outputs that a person can understand and act on.'],
  ['Keep learning', 'Monitor the system and let feedback improve the next version.'],
];

const marqueePhrases = [
  'Made legible',
  'Evidence over spectacle',
  'Careful systems',
  'Decisions that matter',
  'Honest explanations',
];

const tabs = [
  { id: 'github', label: 'GitHub' },
  { id: 'kaggle', label: 'Kaggle' },
  { id: 'pypi', label: 'PyPI' },
  { id: 'leetcode', label: 'LeetCode' },
  { id: 'resume', label: 'Resume' },
];

const ghRepos = [
  { name: 'dcleaner', lang: 'Python', stars: 0, desc: 'Fluent, low-boilerplate data cleaning and visualization on top of pandas. Published on PyPI.', url: 'https://github.com/Shivmahlan/dcleaner' },
  { name: 'aerospeed-analytics', lang: 'Jupyter Notebook', stars: 0, desc: 'F1 telemetry & road-car aerodynamics: 60K+ laps fused with EPA data, XGBoost, 7-page Streamlit dashboard.', url: 'https://github.com/Shivmahlan/aerospeed-analytics' },
  { name: 'dairy-manager', lang: 'TypeScript', stars: 0, desc: 'Multi-tenant dairy SaaS — milk collection, ledgers, RLS-secured Supabase (React 19 + Next.js).', url: 'https://github.com/Shivmahlan/dairy-manager' },
  { name: 'Career-mitar', lang: 'HTML', stars: 0, desc: 'Career-guidance AI agent — Flask + IBM watsonx.ai: resume analysis, skill-gap, roadmaps, interview prep.', url: 'https://github.com/Shivmahlan/Career-mitar' },
  { name: 'Ransomware-Simulator', lang: 'Python', stars: 0, desc: 'Controlled ransomware simulator modeling encryption attack patterns in isolated sandboxes (CDAC intern).', url: 'https://github.com/Shivmahlan/Ransomware-Simulator' },
  { name: 'hand-gesture-control', lang: 'Python', stars: 0, desc: 'Touch-free desktop control via OpenCV + MediaPipe at 30+ FPS with a rule-based gesture engine.', url: 'https://github.com/Shivmahlan/hand-gesture-control' },
];

const LEET_FALLBACK = {
  solved: 38, total: 4029, acceptance: '90%',
  easy: '17 / 960', medium: '18 / 2103', hard: '3 / 966',
  languages: ['Python', 'Python3', 'MySQL'],
  skills: ['Database', 'Dynamic Programming', 'Hash Table', 'String', 'Array', 'Math', 'Linked List'],
  rank: '3,162,791', live: false,
};

// Personal snapshots shown in the intro gallery (real photos from /public/life).
const life = [
  { src: '/life/hoodie2.webp', caption: 'Me, mid-scroll, zero plans', rotate: 0 },
  { src: '/life/tabby.webp', caption: 'Meow meow, judging my screen time' },
  { src: '/life/stars.webp', caption: 'Clicked this at night instead of sleeping' },
  { src: '/life/sunset.webp', caption: 'Golden hour, no notifications' },
];

const resume = {
  contact: 'shivmahlan@gmail.com · +91 93063 66104 · github.com/Shivmahlan · linkedin.com/in/shivmahlan · leetcode.com/shivmahlan · portfolio.shivmahlan141.workers.dev',
  education: 'B.Tech, CSE (Data Science) — CDLU Sirsa · 2023–2027 · CGPA 7.83/10',
  skills: [
    ['Languages', 'Python, R, C, C++'],
    ['ML & AI', 'Scikit-learn, TensorFlow, Keras, XGBoost, OpenCV, MediaPipe'],
    ['Modern AI', 'LLMs & Prompt Eng., LangChain, RAG, Agentic AI (watsonx), MLOps (Docker, CI/CD)'],
    ['Web & Full Stack', 'Next.js, React, Tailwind CSS, FastAPI, Streamlit, jsPDF'],
    ['Data & Viz', 'Pandas, NumPy, Power BI, Tableau, Matplotlib, Seaborn'],
    ['Cloud & DB', 'IBM Cloud, Git, REST APIs, SQL, PostgreSQL, Supabase (RLS)'],
  ],
  experience: [
    ['Project Intern — Ransomware Simulator', 'CDAC Noida · May–Jun 2025', 'Built a controlled ransomware simulator modeling file-encryption attacks and lateral movement in sandboxes; documented recovery workflows.'],
    ['AI Intern — Career-Mitar (Edunet × IBM)', 'Edunet Foundation × IBM SkillsBuild · Jun–Jul 2026', 'Built Career-Mitar, an AI career-guidance agent (Flask + IBM watsonx.ai) for resume analysis, skill-gap detection, roadmaps, and interview prep; shipped a working prototype.'],
  ],
  certs: [
    'IBM SkillsBuild — Getting Started with AI & Cybersecurity (Jun 2026)',
    'Internshala — Data Science & Machine Learning (Jul 2025)',
    'Oracle — Database & Cloud Foundations (Sep 2025)',
    'Microsoft / LinkedIn — Career Essentials in Data Analytics (Feb 2025)',
  ],
};

const skillGroups = resume.skills.map(([cat, items]) => ({
  cat,
  items: items.split(', '),
}));

export default function App() {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef(null);
  const heroRef = useRef(null);
  const [activeTab, setActiveTab] = useState('github');
  const [leet, setLeet] = useState(LEET_FALLBACK);
  const panelRef = useRef(null);
  const galleryRef = useRef(null);

  // Fetch live LeetCode stats. The alfa-leetcode-api was restructured:
  //   /<user>      -> profile only (ranking, avatar)
  //   /<user>/solved -> solved counts + submission tallies
  // We hit both and merge. Falls back to LEET_FALLBACK if the API is unreachable.
  useEffect(() => {
    let cancelled = false;
    const BASE = 'https://alfa-leetcode-api.onrender.com/shivmahlan';
    const tally = (arr, key) =>
      (arr || []).find((x) => x.difficulty === 'All')?.[key] ?? null;
    Promise.all([
      fetch(BASE).then((r) => (r.ok ? r.json() : Promise.reject())),
      fetch(`${BASE}/solved`).then((r) => (r.ok ? r.json() : Promise.reject())),
    ])
      .then(([profile, solved]) => {
        if (cancelled) return;
        const totSub = tally(solved.totalSubmissionNum, 'submissions');
        const acSub = tally(solved.acSubmissionNum, 'submissions');
        const acceptance =
          totSub && acSub != null
            ? `${Math.round((acSub / totSub) * 100)}%`
            : LEET_FALLBACK.acceptance;
        const totalEasy = LEET_FALLBACK.easy.split(' / ')[1];
        const totalMedium = LEET_FALLBACK.medium.split(' / ')[1];
        const totalHard = LEET_FALLBACK.hard.split(' / ')[1];
        setLeet({
          solved: solved.solvedProblem ?? LEET_FALLBACK.solved,
          total: LEET_FALLBACK.total,
          acceptance,
          easy: `${solved.easySolved ?? 17} / ${totalEasy}`,
          medium: `${solved.mediumSolved ?? 18} / ${totalMedium}`,
          hard: `${solved.hardSolved ?? 3} / ${totalHard}`,
          languages: LEET_FALLBACK.languages,
          skills: LEET_FALLBACK.skills,
          rank: profile.ranking != null ? profile.ranking.toLocaleString('en-US') : LEET_FALLBACK.rank,
          live: true,
        });
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    let shuffleTimer;
    const ctx = gsap.context(() => {
      gsap.to('.scroll-progress', {
        scaleX: 1, ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      });

      // Hero intro
      const heroWords = gsap.utils.toArray('.hero-word');
      gsap.from(heroWords, { yPercent: 115, duration: 1.1, ease: 'power4.out', stagger: 0.12, delay: 0.15 });
      gsap.from('.hero-intro > *', { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.1 });
      gsap.from('.hero-portrait', { opacity: 0, scale: 0.92, duration: 1, ease: 'power3.out', delay: 0.2 });
      gsap.from('.hero-side-note', { opacity: 0, x: 18, duration: 0.9, ease: 'power3.out', delay: 0.5 });

      // Custom cursor
      const dot = rootRef.current.querySelector('.cursor-dot');
      const ring = rootRef.current.querySelector('.cursor-ring');
      const xDot = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3' });
      const yDot = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3' });
      const xRing = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const yRing = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });
      const move = (e) => { xDot(e.clientX); yDot(e.clientY); xRing(e.clientX); yRing(e.clientY); };
      window.addEventListener('pointermove', move);
      const grow = () => gsap.to(ring, { scale: 1.9, borderColor: 'var(--ember)', duration: 0.3 });
      const shrink = () => gsap.to(ring, { scale: 1, borderColor: 'var(--ink)', duration: 0.3 });
      document.querySelectorAll('a, button, [data-cursor]').forEach((el) => {
        el.addEventListener('pointerenter', grow);
        el.addEventListener('pointerleave', shrink);
      });

      // Magnetic portrait: the frame eases toward the pointer within the hero.
      const portrait = rootRef.current.querySelector('.hero-portrait');
      const mag = (e) => {
        const r = portrait.getBoundingClientRect();
        const x = (e.clientX - (r.left + r.width / 2)) * 0.12;
        const y = (e.clientY - (r.top + r.height / 2)) * 0.12;
        gsap.to(portrait, { x, y, duration: 0.6, ease: 'power3.out' });
      };
      const reset = () => gsap.to(portrait, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)' });
      heroRef.current.addEventListener('pointermove', mag);
      heroRef.current.addEventListener('pointerleave', reset);
      // Parallax the portrait image on scroll.
      gsap.to('.hero-portrait img', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: true },
      });

      // Interactive orbital diagram: rotates slowly, reverses on hover.
      const orbit = rootRef.current.querySelector('.orbit');
      const spin = gsap.to('.orbit-item', {
        rotate: 360, transformOrigin: '50% 50%', duration: 28, ease: 'none', repeat: -1,
      });
      orbit.addEventListener('pointerenter', () => gsap.to(spin, { timeScale: -1, duration: 0.6 }));
      orbit.addEventListener('pointerleave', () => gsap.to(spin, { timeScale: 1, duration: 0.6 }));

      // Pin the hero and scrub a subtle exit as the next section arrives.
      gsap.to('.hero', {
        opacity: 0.15, scale: 0.97, ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current, start: 'top top', end: 'bottom top',
          scrub: true, pin: false,
        },
      });

      // Section reveals
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 42, opacity: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
      });

      // Personal gallery: gentle shuffle on an interval (paused under reduced motion).
      // Kept tiny so framed photos never drift out of their grid cells / overlap.
      const shuffle = () => {
        if (!galleryRef.current) return;
        galleryRef.current.querySelectorAll('.shot').forEach((shot) => {
          const rot = gsap.utils.random(-2, 2);
          const x = gsap.utils.random(-3, 3);
          const y = gsap.utils.random(-3, 3);
          gsap.to(shot, { rotate: rot, x, y, duration: 1.4, ease: 'power2.inOut' });
        });
      };
      shuffle();
      shuffleTimer = setInterval(shuffle, 4000);

      gsap.utils.toArray('.shot').forEach((shot) => {
        gsap.from(shot, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out',
          scrollTrigger: { trigger: shot, start: 'top 88%', once: true },
        });
      });
      gsap.utils.toArray('.project').forEach((card) => {
        const tilt = (e) => {
          const r = card.getBoundingClientRect();
          const px = (e.clientX - r.left) / r.width - 0.5;
          const py = (e.clientY - r.top) / r.height - 0.5;
          gsap.to(card, { rotateY: px * 6, rotateX: -py * 6, duration: 0.4, ease: 'power2.out', transformPerspective: 900 });
        };
        const reset2 = () => gsap.to(card, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'power3.out' });
        card.addEventListener('pointermove', tilt);
        card.addEventListener('pointerleave', reset2);
      });

      gsap.to('.marquee-track', {
        xPercent: -50, ease: 'none',
        scrollTrigger: { trigger: '.masthead', start: 'top bottom', end: 'bottom top', scrub: 1 },
      });

      gsap.from('.method-item', {
        y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1,
        scrollTrigger: { trigger: '.method-list', start: 'top 80%', once: true },
      });

      // Skill chips: each category staggers its chips in on scroll.
      gsap.utils.toArray('.skill-group').forEach((group) => {
        gsap.from(group.querySelectorAll('.chip'), {
          y: 16, opacity: 0, duration: 0.5, ease: 'power3.out', stagger: 0.04,
          scrollTrigger: { trigger: group, start: 'top 88%', once: true },
        });
      });

      // Footer links fly in on scroll.
      gsap.from('.footer-link', {
        y: 18, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06,
        scrollTrigger: { trigger: '.footer', start: 'top 90%', once: true },
      });
    }, rootRef);

    return () => { clearInterval(shuffleTimer); ctx.revert(); };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !panelRef.current) return;
    gsap.fromTo(panelRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  }, [activeTab, reduceMotion]);

  return (
    <main ref={rootRef}>
      <div className="scroll-progress" aria-hidden="true" />
      <div className="cursor-ring" aria-hidden="true" />
      <div className="cursor-dot" aria-hidden="true" />

      <nav className="nav shell" aria-label="Primary navigation">
        <span className="nav-place">Independent practice</span>
        <a className="wordmark" href="#top">Shiv's Data Ledger</a>
        <a className="nav-menu" href="#presence" aria-label="View profiles"><List size={26} /></a>
      </nav>

      <section className="hero shell" id="top" ref={heroRef}>
        <div className="hero-intro">
          <p>I'm Shiv Kumar — a data-science student building ML pipelines, computer-vision tools, and honest explanations.</p>
          <a href="#presence">See my work <ArrowUpRight size={17} weight="bold" /></a>
        </div>

        <div className="hero-center">
          <div className="hero-portrait" data-cursor>
            <img src="/hero-portrait.webp" alt="Shiv Kumar" width="1200" height="1198" />
          </div>

          <div className="orbit" data-cursor aria-hidden="true">
            {platforms.map((p, i) => {
              const angle = (i / platforms.length) * 360;
              return (
                <a
                  key={p.label}
                  className="orbit-item"
                  href={p.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ '--a': `${angle}deg` }}
                  aria-label={p.label}
                >
                  <span className="orbit-dot" />
                  <span className="orbit-label">{p.label}</span>
                </a>
              );
            })}
            <span className="orbit-core">Shiv</span>
          </div>
        </div>

        <div className="hero-title-wrap" aria-label="Data science, made legible">
          <h1>
            <span className="hero-word-line"><span className="hero-word">Data</span></span>
            <span className="hero-word-line"><span className="hero-word">science</span></span>
          </h1>
          <p className="hero-side-note">Careful systems for decisions that matter.</p>
        </div>
      </section>

      <section className="masthead" aria-label="Portfolio declaration">
        <div className="marquee-track" aria-hidden="true">
          {[...marqueePhrases, ...marqueePhrases].map((phrase, i) => (
            <span key={i} className="marquee-item">{phrase}</span>
          ))}
        </div>
      </section>

      <section className="work shell" id="work">
        <div className="intro-head" data-reveal>
          <p className="kicker">Off the clock</p>
          <h2>When I'm not doing serious things, I'm usually clicking pics, playing games, or sleeping.</h2>
          <p>I build with data all week — but the rest of life is messier and better for it. A few frames from outside the terminal.</p>
        </div>
        <div className="gallery" ref={galleryRef} data-reveal aria-label="Snapshots from outside work">
          {life.map((shot, i) => (
            <figure className={`shot shot-${i + 1}`} key={shot.src}>
              <img src={shot.src} alt={shot.caption} loading="lazy" style={{ '--base-rot': `${shot.rotate || 0}deg` }} />
              <figcaption>{shot.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="method shell" id="method">
        <div className="method-lead">
          <div data-reveal>
            <p className="kicker">Working method</p>
            <h2>A model is only useful when people can use it.</h2>
          </div>
        </div>
        <div className="method-list">
          {methods.map(([title, description], i) => (
            <article key={title} className="method-item">
              <span>{String(i + 1).padStart(2, '0')}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="presence shell" id="presence" data-reveal>
        <div className="presence-head">
          <p className="kicker">Profiles &amp; proof</p>
          <h2>Where the work lives.</h2>
        </div>

        <div className="presence-tabs" role="tablist" aria-label="Platform profiles">
          {tabs.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`tab-${t.id}`}
              aria-selected={activeTab === t.id}
              aria-controls={`panel-${t.id}`}
              className={`presence-tab${activeTab === t.id ? ' is-active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="presence-panel" ref={panelRef} role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
          {activeTab === 'github' && (
            <div className="repo-list">
              {ghRepos.map((r) => (
                <a key={r.name} className="repo" href={r.url} target="_blank" rel="noreferrer" data-cursor>
                  <h3>{r.name}</h3>
                  <span className="repo-lang">{r.lang}{r.stars ? ` · ${r.stars}★` : ''}</span>
                  <p>{r.desc}</p>
                </a>
              ))}
            </div>
          )}
          {activeTab === 'kaggle' && (
            <div className="kaggle">
              <p className="presence-lead">Public datasets and notebooks on <a href="https://kaggle.com/shivmahlan" target="_blank" rel="noreferrer" data-cursor>@shivmahlan</a>.</p>
              <a className="pkg" href="https://kaggle.com/shivmahlan" target="_blank" rel="noreferrer" data-cursor>
                <h3>AeroSpeed Analytics dataset</h3>
                <p>Fused 60K+ F1 telemetry laps (2022–2024) with EPA fuel-economy and scraped drag-coefficient data — published for the community.</p>
                <span className="pkg-meta">Dataset · Kaggle</span>
              </a>
            </div>
          )}
          {activeTab === 'pypi' && (
            <a className="pkg" href="https://pypi.org/project/dcleaner/" target="_blank" rel="noreferrer" data-cursor>
              <h3>dcleaner</h3>
              <p>Fluent, low-boilerplate data cleaning and visualization on top of pandas. MIT-licensed, released 10 Jul 2026.</p>
              <span className="pkg-meta">Python package · v0.1.5 · pip install dcleaner</span>
            </a>
          )}
          {activeTab === 'leetcode' && (
            <div className="leet">
              <div className="stat-grid">
                <div className="stat"><span className="stat-num">{leet.solved}</span><span className="stat-label">problems solved</span></div>
                <div className="stat"><span className="stat-num">{leet.acceptance}</span><span className="stat-label">acceptance rate</span></div>
                <div className="stat"><span className="stat-num">{leet.easy}</span><span className="stat-label">easy</span></div>
                <div className="stat"><span className="stat-num">{leet.medium}</span><span className="stat-label">medium</span></div>
                <div className="stat"><span className="stat-num">{leet.hard}</span><span className="stat-label">hard</span></div>
              </div>
              <div className="leet-foot">
                <p><strong>Languages:</strong> {leet.languages.join(' · ')}</p>
                <p><strong>Top tags:</strong> {leet.skills.join(' · ')}</p>
                <p className="leet-rank">Global rank #{leet.rank}{leet.live && <span className="live-dot" title="Live from LeetCode" />}</p>
              </div>

              <div className="leet-mascot" aria-hidden="true">
                <img
                  className="cat-gif"
                  src="https://media.tenor.com/u8M7kk5ZXmwAAAAM/banana-cat-crying.gif"
                  alt=""
                  loading="lazy"
                />
                <div className="speech">
                  <p>i am trying but this shit is hard</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'resume' && (
            <div className="resume">
              <div className="resume-top">
                <h3>{resume.name}</h3>
                <p className="resume-contact">{resume.contact}</p>
                <p className="resume-edu">{resume.education}</p>
              </div>
              <div className="resume-grid">
                <div className="resume-block">
                  <p className="kicker">Skills</p>
                  {resume.skills.map(([k, v]) => (<p key={k}><strong>{k}:</strong> {v}</p>))}
                </div>
                <div className="resume-block">
                  <p className="kicker">Experience</p>
                  {resume.experience.map(([role, where, what]) => (<p key={role}><strong>{role}</strong> — {where}<br />{what}</p>))}
                  <p className="kicker resume-certs">Certifications</p>
                  {resume.certs.map((c) => <p key={c}>{c}</p>)}
                </div>
              </div>
              <a className="contact-link" href={`data:application/pdf;base64,${RESUME_B64}`} download="Shiv_Kumar_Resume.pdf" target="_blank" rel="noreferrer">Download full résumé (PDF) <ArrowUpRight size={17} weight="bold" /></a>
            </div>
          )}
        </div>
      </section>

      <section className="profile shell" id="tools">
        <div className="profile-head" data-reveal>
          <p className="kicker">Tools of the trade</p>
          <h2>Python, SQL, machine learning, experiment design, and data storytelling.</h2>
          <p className="profile-lead">Technical depth matters. So does knowing when a simpler approach tells the truth more clearly.</p>
        </div>
        <div className="skills" data-reveal>
          {skillGroups.map((group) => (
            <div className="skill-group" key={group.cat}>
              <h3 className="skill-cat">{group.cat}</h3>
              <ul className="chip-row">
                {group.items.map((item) => (
                  <li className="chip" key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <footer className="footer shell" id="contact">
        <div className="footer-top" data-reveal>
          <p className="kicker">Start here</p>
          <h2>Have data that deserves a better question?</h2>
          <a className="contact-link footer-link" href="mailto:shivmahlan@gmail.com">Send an email <EnvelopeSimple size={19} weight="bold" /></a>
        </div>
        <div className="footer-links" aria-label="Profiles">
          <a className="footer-link" href="https://github.com/Shivmahlan" target="_blank" rel="noreferrer"><GithubLogo size={22} weight="bold" /><span>GitHub</span></a>
          <a className="footer-link" href="https://www.linkedin.com/in/shivmahlan" target="_blank" rel="noreferrer"><LinkedinLogo size={22} weight="bold" /><span>LinkedIn</span></a>
          <a className="footer-link" href="https://kaggle.com/shivmahlan" target="_blank" rel="noreferrer"><span>Kaggle</span></a>
          <a className="footer-link" href="https://leetcode.com/shivmahlan" target="_blank" rel="noreferrer"><span>LeetCode</span></a>
          <a className="footer-link" href="https://pypi.org/project/dcleaner" target="_blank" rel="noreferrer"><span>PyPI</span></a>
        </div>
        <p className="footer-note">© {new Date().getFullYear()} Shiv Kumar · Built with React, GSAP &amp; a lot of curiosity.</p>
      </footer>
    </main>
  );
}
