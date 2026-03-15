import Head from 'next/head'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import Link from 'next/link'

export default function Login() {
  const router = useRouter()
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } }
      })
      if (error) { setError(error.message); setLoading(false); return }
      setSuccess('Email verify karo — phir login karo!')
      setMode('login')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { setError('Email ya password galat hai'); setLoading(false); return }
      router.push('/dashboard')
    }
    setLoading(false)
  }

  return (
    <>
      <Head><title>Login — Prashna</title></Head>
      <style jsx>{`
        .page { min-height:100svh;display:flex;align-items:center;justify-content:center;background:var(--sur);padding:20px; }
        .box { background:var(--wht);border:1px solid var(--bdr);border-radius:16px;padding:32px;width:100%;max-width:400px; }
        .logo { font-family:var(--ffd);font-size:22px;color:var(--g700);text-align:center;margin-bottom:8px;display:flex;align-items:center;justify-content:center;gap:8px; }
        .logo-mark { width:32px;height:32px;background:var(--g600);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-style:italic;font-size:20px;font-family:Georgia,serif; }
        .logo em { color:var(--g400);font-style:italic; }
        .sub { text-align:center;font-size:14px;color:var(--mut);margin-bottom:28px; }
        .tabs { display:grid;grid-template-columns:1fr 1fr;background:var(--sur);border-radius:9px;padding:3px;margin-bottom:22px; }
        .tab { padding:9px;border-radius:7px;border:none;background:transparent;font-family:var(--ffb);font-size:14px;font-weight:500;color:var(--mut);cursor:pointer;transition:all .2s; }
        .tab.act { background:var(--wht);color:var(--g700);box-shadow:0 1px 4px rgba(0,0,0,.08); }
        .label { font-size:12px;font-weight:600;color:var(--mut);letter-spacing:.05em;text-transform:uppercase;margin-bottom:6px;display:block; }
        .field { margin-bottom:14px; }
        .err { background:#FCEBEB;color:#A32D2D;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:14px; }
        .suc { background:var(--g50);color:var(--g700);border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:14px; }
        .home { text-align:center;margin-top:16px;font-size:13px;color:var(--mut); }
        .home a { color:var(--g600);text-decoration:none;font-weight:500; }
      `}</style>
      <div className="page">
        <div className="box">
          <div className="logo"><div className="logo-mark">P</div>Prashna<em>.</em></div>
          <p className="sub">{mode === 'login' ? 'Apne account mein login karo' : 'Naya account banao — free mein'}</p>

          <div className="tabs">
            <button className={`tab ${mode==='login'?'act':''}`} onClick={() => setMode('login')}>Login</button>
            <button className={`tab ${mode==='signup'?'act':''}`} onClick={() => setMode('signup')}>Sign up</button>
          </div>

          {error && <div className="err">⚠️ {error}</div>}
          {success && <div className="suc">✅ {success}</div>}

          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="field">
                <label className="label">Aapka naam</label>
                <input className="input" type="text" placeholder="Mrs. Sharma" value={name} onChange={e => setName(e.target.value)} required />
              </div>
            )}
            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="teacher@school.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder={mode==='signup'?'Min 6 characters':'••••••••'} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <button type="submit" className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px',marginTop:4}} disabled={loading}>
              {loading ? <span className="spinner"></span> : (mode === 'login' ? 'Login karo →' : 'Account banao →')}
            </button>
          </form>

          <div className="home"><Link href="/">← Wapas home pe</Link></div>
        </div>
      </div>
    </>
  )
}
