import Head from 'next/head'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user))
  }, [])

  return (
    <>
      <Head>
        <title>Prashna — AI Test Generator for Teachers</title>
        <meta name="description" content="AI se seconds mein MCQ, short answer, aur essay questions banao. Indian teachers ke liye." />
      </Head>

      <style jsx>{`
        .nav { position:fixed;top:0;left:0;right:0;z-index:100;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:60px;background:rgba(255,255,255,.95);backdrop-filter:blur(12px);border-bottom:1px solid var(--bdr); }
        .logo { font-family:var(--ffd);font-size:20px;color:var(--g700);display:flex;align-items:center;gap:8px;text-decoration:none; }
        .logo-mark { width:30px;height:30px;background:var(--g600);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-style:italic;font-size:18px;font-family:Georgia,serif; }
        .logo em { color:var(--g400);font-style:italic; }
        .nav-right { display:flex;align-items:center;gap:16px; }
        .nav-link { font-size:14px;color:var(--mut);text-decoration:none;font-weight:500; }
        .nav-link:hover { color:var(--g600); }

        .hero { min-height:100svh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:88px 20px 60px;text-align:center;position:relative;overflow:hidden; }
        .hbg { position:absolute;inset:0;z-index:0;background:radial-gradient(ellipse 80% 50% at 50% 0%,var(--g100),transparent 70%); }
        .hdots { position:absolute;inset:0;z-index:0;background-image:radial-gradient(circle,var(--g200) 1px,transparent 1px);background-size:28px 28px;opacity:.3; }
        .hc { position:relative;z-index:1;max-width:720px;width:100%; }
        .pill { display:inline-flex;align-items:center;gap:8px;background:var(--g50);border:1px solid var(--g200);color:var(--g700);font-size:13px;font-weight:500;padding:6px 16px;border-radius:100px;margin-bottom:24px; }
        .pdot { width:6px;height:6px;border-radius:50%;background:var(--g400); }
        h1 { font-family:var(--ffd);font-size:clamp(34px,8vw,70px);line-height:1.08;letter-spacing:-1px;color:var(--ink);margin-bottom:18px; }
        h1 em { color:var(--g500);font-style:italic; }
        .hsub { font-size:clamp(15px,2.5vw,17px);color:var(--mut);max-width:480px;margin:0 auto 34px;line-height:1.65; }
        .hacts { display:flex;gap:10px;justify-content:center;flex-wrap:wrap; }
        .hstats { display:flex;gap:28px;justify-content:center;margin-top:44px;flex-wrap:wrap; }
        .hstat { text-align:center; }
        .hsn { font-family:var(--ffd);font-size:28px;color:var(--g600);line-height:1; }
        .hsl { font-size:11px;color:var(--mut);margin-top:3px;font-weight:500; }

        section { padding:60px 20px; }
        .sec-green { background:var(--sur);border-top:1px solid var(--bdr);border-bottom:1px solid var(--bdr); }
        .con { max-width:940px;margin:0 auto; }
        .slbl { text-align:center;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;color:var(--g600);margin-bottom:10px; }
        .stit { text-align:center;font-family:var(--ffd);font-size:clamp(22px,4vw,38px);line-height:1.15;letter-spacing:-.5px;color:var(--ink);margin-bottom:36px; }

        .fgrid { display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px; }
        .fc { padding:22px 18px;border:1px solid var(--bdr);border-radius:13px;background:var(--wht);transition:transform .2s,box-shadow .2s; }
        .fc:hover { transform:translateY(-3px);box-shadow:0 6px 24px rgba(16,185,129,.1); }
        .ficon { width:40px;height:40px;border-radius:10px;background:var(--g50);display:flex;align-items:center;justify-content:center;font-size:19px;margin-bottom:12px; }
        .ftit { font-size:15px;font-weight:600;color:var(--ink);margin-bottom:6px; }
        .fdesc { font-size:13px;color:var(--mut);line-height:1.6; }

        .pgrid { display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:13px; }
        .pc { background:var(--wht);border:1px solid var(--bdr);border-radius:13px;padding:22px 18px;position:relative; }
        .pc.pop { border:2px solid var(--g400); }
        .popb { position:absolute;top:-11px;left:50%;transform:translateX(-50%);background:var(--g500);color:#fff;font-size:11px;font-weight:600;padding:3px 13px;border-radius:100px;white-space:nowrap; }
        .pname { font-size:12px;font-weight:600;color:var(--mut);margin-bottom:6px;letter-spacing:.04em; }
        .pprice { font-family:var(--ffd);font-size:32px;color:var(--ink);line-height:1; }
        .pprice sub { font-size:13px;font-family:var(--ffb);color:var(--mut);vertical-align:baseline; }
        .pper { font-size:12px;color:var(--mut);margin:3px 0 14px; }
        .pfeats { list-style:none;margin-bottom:18px; }
        .pfeats li { font-size:13px;color:var(--soft);padding:4px 0;border-bottom:1px solid var(--bdr);display:flex;gap:7px;align-items:flex-start; }
        .pfeats li:last-child { border-bottom:none; }
        .ck { color:var(--g500);font-weight:700;flex-shrink:0; }

        .supbar { background:var(--g800);color:rgba(255,255,255,.8);text-align:center;padding:13px 20px;font-size:14px; }
        .supbar a { color:var(--g400);text-decoration:none;font-weight:600; }
        footer { background:var(--g900);color:rgba(255,255,255,.6);padding:28px 20px; }
        .fi { max-width:940px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px; }
        .flogo { font-family:var(--ffd);font-size:19px;color:#fff;display:flex;align-items:center;gap:7px; }
        .flogo em { color:var(--g400);font-style:italic; }
        .flinks { display:flex;gap:18px; }
        .flinks a { color:rgba(255,255,255,.5);text-decoration:none;font-size:13px; }

        @media(max-width:640px){
          .hacts { flex-direction:column; }
          .hacts a, .hacts button { width:100%;text-align:center; }
          .pgrid,.fgrid { grid-template-columns:1fr; }
          .fi { flex-direction:column;text-align:center; }
          .flinks { justify-content:center; }
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <a href="/" className="logo">
          <div className="logo-mark">P</div>
          Prashna<em>.</em>
        </a>
        <div className="nav-right">
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
          {user
            ? <Link href="/dashboard" className="btn-primary" style={{padding:'8px 18px',fontSize:'14px'}}>Dashboard →</Link>
            : <Link href="/login" className="btn-primary" style={{padding:'8px 18px',fontSize:'14px'}}>Try for free</Link>
          }
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hbg"></div><div className="hdots"></div>
        <div className="hc fade-up">
          <div className="pill"><span className="pdot"></span>AI-powered test generation for Indian classrooms</div>
          <h1>Create perfect tests<br />in <em>seconds,</em> not hours</h1>
          <p className="hsub">Paste your notes or upload a PDF — Prashna generates MCQs, short answer, and essay questions instantly. Share with students via a simple link.</p>
          <div className="hacts">
            <Link href="/login" className="btn-primary" style={{fontSize:'16px',padding:'14px 28px'}}>Start generating free →</Link>
            <a href="#features" className="btn-secondary" style={{fontSize:'16px',padding:'14px 22px'}}>See features</a>
          </div>
          <div className="hstats">
            <div className="hstat"><div className="hsn">10k+</div><div className="hsl">Questions generated</div></div>
            <div className="hstat"><div className="hsn">500+</div><div className="hsl">Teachers onboard</div></div>
            <div className="hstat"><div className="hsn">2 min</div><div className="hsl">Avg test creation</div></div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features">
        <div className="con">
          <div className="slbl">Features</div>
          <h2 className="stit">Everything a teacher needs</h2>
          <div className="fgrid">
            {[
              { icon: '🧠', title: 'AI Question Generator', desc: 'Notes ya PDF upload karo — AI instantly MCQ, short answer, essay questions banata hai. CBSE, ICSE, state board sab ke liye.' },
              { icon: '🔗', title: 'Share via Link', desc: 'Ek click mein shareable link ready. Students kisi bhi device pe attempt karte hain — koi app nahi chahiye.' },
              { icon: '✅', title: 'Auto Grading', desc: 'MCQs automatically grade hote hain. Students submit karte hi results dashboard mein aa jaate hain.' },
              { icon: '📊', title: 'Analytics Dashboard', desc: 'Weak topics, class average, per-student performance — sab ek jagah dikhta hai.' },
              { icon: '📄', title: 'PDF Download', desc: 'Clean question paper + answer key PDF mein download karo. Print karo ya WhatsApp pe bhejo.' },
              { icon: '🇮🇳', title: 'Indian Curriculum Ready', desc: 'CBSE, ICSE, JEE, NEET ke liye optimized. Hindi support aane wala hai.' }
            ].map((f, i) => (
              <div key={i} className="fc">
                <div className="ficon">{f.icon}</div>
                <div className="ftit">{f.title}</div>
                <div className="fdesc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="sec-green">
        <div className="con">
          <div className="slbl">Pricing</div>
          <h2 className="stit">Simple, teacher-friendly pricing</h2>
          <div className="pgrid">
            <div className="pc">
              <div className="pname">FREE</div>
              <div className="pprice">₹0</div><div className="pper">forever</div>
              <ul className="pfeats">
                <li><span className="ck">✓</span>3 tests per month</li>
                <li><span className="ck">✓</span>25 MCQs per test</li>
                <li><span className="ck">✓</span>Share via link</li>
                <li><span className="ck">✓</span>Basic analytics</li>
              </ul>
              <Link href="/login" className="btn-secondary" style={{display:'block',textAlign:'center',padding:'10px'}}>Get started free</Link>
            </div>
            <div className="pc pop">
              <div className="popb">Most popular</div>
              <div className="pname">TEACHER PRO</div>
              <div className="pprice">₹299<sub>/mo</sub></div><div className="pper">billed monthly</div>
              <ul className="pfeats">
                <li><span className="ck">✓</span>Unlimited tests</li>
                <li><span className="ck">✓</span>100 questions per test</li>
                <li><span className="ck">✓</span>MCQ + short answer + essay</li>
                <li><span className="ck">✓</span>PDF export, no watermark</li>
                <li><span className="ck">✓</span>Full analytics</li>
                <li><span className="ck">✓</span>Email results to students</li>
              </ul>
              <Link href="/login" className="btn-primary" style={{display:'block',textAlign:'center',width:'100%',padding:'11px',justifyContent:'center'}}>Start free trial</Link>
            </div>
            <div className="pc">
              <div className="pname">SCHOOL PLAN</div>
              <div className="pprice">₹999<sub>/mo</sub></div><div className="pper">up to 10 teachers</div>
              <ul className="pfeats">
                <li><span className="ck">✓</span>Everything in Pro</li>
                <li><span className="ck">✓</span>10 teacher accounts</li>
                <li><span className="ck">✓</span>School-wide analytics</li>
                <li><span className="ck">✓</span>Custom branding</li>
                <li><span className="ck">✓</span>Priority support</li>
              </ul>
              <a href="tel:9863168046" className="btn-secondary" style={{display:'block',textAlign:'center',padding:'10px'}}>📞 Contact us</a>
            </div>
          </div>
        </div>
      </section>

      <div className="supbar">Need help? Call or WhatsApp: <a href="tel:9863168046">📞 9863168046</a></div>

      <footer>
        <div className="fi">
          <div className="flogo"><div className="logo-mark" style={{width:26,height:26,fontSize:15}}>P</div>Prashna<em>.</em></div>
          <div style={{fontSize:13}}>© 2025 Prashna · Made for Indian teachers</div>
          <div className="flinks"><a href="#">Privacy</a><a href="#">Terms</a><a href="tel:9863168046">Support</a></div>
        </div>
      </footer>
    </>
  )
}
