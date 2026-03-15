import Head from 'next/head'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [tab, setTab] = useState('create')
  const [tests, setTests] = useState([])
  const [loading, setLoading] = useState(false)
  const [genLoading, setGenLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [qType, setQType] = useState('mcq')
  const [count, setCount] = useState('10')
  const [difficulty, setDifficulty] = useState('medium')
  const [pdfFile, setPdfFile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saveLoading, setSaveLoading] = useState(false)
  const [shareCode, setShareCode] = useState('')
  const fileRef = useRef()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data?.user) { router.push('/login'); return }
      setUser(data.user)
      fetchTests(data.user)
    })
  }, [])

  async function fetchTests(u) {
    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/my-tests', { headers: { Authorization: `Bearer ${session.access_token}` } })
    const json = await res.json()
    if (json.tests) setTests(json.tests)
  }

  async function generateQuestions() {
    if (!topic.trim() && !pdfFile) { setError('Topic likho ya PDF upload karo'); return }
    setError(''); setGenLoading(true); setQuestions([])

    const formData = new FormData()
    formData.append('topic', topic)
    formData.append('questionType', qType)
    formData.append('count', count)
    formData.append('difficulty', difficulty)
    if (pdfFile) formData.append('pdf', pdfFile)

    const res = await fetch('/api/generate', { method: 'POST', body: formData })
    const json = await res.json()
    setGenLoading(false)

    if (!res.ok) { setError(json.error || 'Error aaya'); return }
    setQuestions(json.questions)
  }

  async function saveTest() {
    if (!title.trim()) { setError('Test ka title daalo'); return }
    if (!questions.length) { setError('Pehle questions generate karo'); return }
    setSaveLoading(true); setError('')

    const { data: { session } } = await supabase.auth.getSession()
    const res = await fetch('/api/save-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ title, questions })
    })
    const json = await res.json()
    setSaveLoading(false)

    if (!res.ok) { setError(json.error); return }
    setShareCode(json.shareCode)
    setSuccess(`Test save ho gaya! Share code: ${json.shareCode}`)
    fetchTests(user)
    setTab('tests')
  }

  function downloadPDF() {
    if (!questions.length) { setError('Pehle questions generate karo'); return }

    const content = []
    content.push(`PRASHNA — QUESTION PAPER`)
    content.push(`Test: ${title || 'Untitled Test'}`)
    content.push(`Total Questions: ${questions.length}`)
    content.push(`Date: ${new Date().toLocaleDateString('en-IN')}`)
    content.push(`${'─'.repeat(60)}`)
    content.push('')

    questions.forEach((q, i) => {
      content.push(`Q${i + 1}. ${q.question}`)
      if (q.type === 'mcq' || !q.type) {
        content.push(`   A. ${q.optionA}`)
        content.push(`   B. ${q.optionB}`)
        content.push(`   C. ${q.optionC}`)
        content.push(`   D. ${q.optionD}`)
      }
      content.push('')
    })

    content.push(`${'─'.repeat(60)}`)
    content.push('ANSWER KEY')
    content.push(`${'─'.repeat(60)}`)
    questions.forEach((q, i) => {
      if (q.type === 'mcq' || !q.type) {
        content.push(`Q${i + 1}: ${q.correct}`)
      } else {
        content.push(`Q${i + 1}: ${q.answer || q.correct}`)
      }
    })

    const blob = new Blob([content.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title || 'prashna-test'}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const teacherName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'Teacher'
  const initials = teacherName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      <Head><title>Dashboard — Prashna</title></Head>
      <style jsx>{`
        * { box-sizing:border-box; }
        .layout { display:flex;flex-direction:column;min-height:100svh;padding-top:50px; }
        .topbar { position:fixed;top:0;left:0;right:0;z-index:100;background:var(--g800);height:50px;display:flex;align-items:center;padding:0 16px;gap:10px; }
        .tlogo { font-family:var(--ffd);color:#fff;font-size:17px;display:flex;align-items:center;gap:6px;cursor:pointer;text-decoration:none;flex-shrink:0; }
        .tlm { width:26px;height:26px;background:var(--g400);border-radius:7px;display:flex;align-items:center;justify-content:center;color:var(--g900);font-style:italic;font-size:16px;font-family:Georgia,serif; }
        .tlogo em { color:var(--g400);font-style:italic; }
        .ttabs { display:flex;gap:2px;margin-left:10px;overflow-x:auto;-webkit-overflow-scrolling:touch; }
        .ttab { padding:5px 12px;border-radius:6px;font-size:12px;font-weight:500;color:rgba(255,255,255,.6);cursor:pointer;border:none;background:transparent;font-family:var(--ffb);white-space:nowrap;transition:all .15s; }
        .ttab.act { background:rgba(255,255,255,.12);color:#fff; }
        .tuser { margin-left:auto;display:flex;align-items:center;gap:8px;flex-shrink:0; }
        .tname { font-size:12px;color:rgba(255,255,255,.6); }
        .tav { width:28px;height:28px;border-radius:50%;background:var(--g400);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--g900);cursor:pointer; }

        .body { display:flex;flex:1; }
        .sb { background:var(--g900);width:180px;flex-shrink:0;padding:12px 8px;display:flex;flex-direction:column;gap:2px; }
        .sbsl { font-size:10px;font-weight:600;color:rgba(255,255,255,.3);letter-spacing:.1em;text-transform:uppercase;padding:7px 9px 3px; }
        .sbi { display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:8px;font-size:13px;color:rgba(255,255,255,.6);cursor:pointer;border:none;background:transparent;font-family:var(--ffb);width:100%;text-align:left;transition:all .15s; }
        .sbi:hover { background:rgba(255,255,255,.08);color:#fff; }
        .sbi.act { background:var(--g600);color:#fff; }
        .sic { font-size:14px;width:18px;text-align:center;flex-shrink:0; }

        .main { flex:1;background:var(--sur);padding:20px;overflow:auto;min-width:0; }
        .mhd { display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;flex-wrap:wrap;gap:10px; }
        .mtit { font-size:18px;font-weight:600;color:var(--ink);font-family:var(--ffd); }

        .create-grid { display:grid;grid-template-columns:1fr 1fr;gap:16px; }
        .box { background:var(--wht);border:1px solid var(--bdr);border-radius:13px;padding:18px; }
        .lbl { font-size:11px;font-weight:600;color:var(--mut);letter-spacing:.06em;text-transform:uppercase;margin-bottom:7px;display:block; }
        .row3 { display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px; }
        .textarea { width:100%;height:120px;padding:10px;border:1.5px solid var(--bdr);border-radius:9px;font-family:var(--ffb);font-size:13px;color:var(--soft);resize:none;line-height:1.6;outline:none;transition:border-color .2s;background:var(--sur); }
        .textarea:focus { border-color:var(--g400); }
        .upload-area { border:2px dashed var(--bdr);border-radius:9px;padding:16px;text-align:center;cursor:pointer;transition:border-color .2s;margin-top:10px; }
        .upload-area:hover { border-color:var(--g400); }
        .upload-area p { font-size:13px;color:var(--mut);margin-top:4px; }

        .preview-hd { display:flex;justify-content:space-between;align-items:center;margin-bottom:12px; }
        .bqt { font-size:11px;background:var(--g100);color:var(--g700);padding:3px 10px;border-radius:100px;font-weight:600; }
        .qcard { background:var(--wht);border:1px solid var(--bdr);border-radius:9px;padding:12px 14px;margin-bottom:8px; }
        .qq { font-size:13px;font-weight:600;color:var(--ink);margin-bottom:7px;line-height:1.5; }
        .qopts { display:grid;grid-template-columns:1fr 1fr;gap:4px; }
        .qopt { font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid var(--bdr);color:var(--soft); }
        .qopt.cor { background:var(--g50);border-color:var(--g400);color:var(--g700);font-weight:500; }
        .qans { font-size:12px;color:var(--g700);margin-top:6px;font-style:italic; }
        .empty { height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--mut);font-size:14px;gap:8px; }

        .srow { display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px; }
        .sc { background:var(--wht);border:1px solid var(--bdr);border-radius:10px;padding:13px; }
        .scn { font-size:22px;font-weight:700;color:var(--g600);font-family:var(--ffd);line-height:1; }
        .scl { font-size:11px;color:var(--mut);margin-top:3px;font-weight:500; }
        .ttbl { background:var(--wht);border:1px solid var(--bdr);border-radius:11px;overflow:hidden;overflow-x:auto; }
        .thead { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:8px 13px;background:var(--g50);border-bottom:1px solid var(--bdr);min-width:400px; }
        .thc { font-size:11px;font-weight:600;color:var(--mut);letter-spacing:.04em;text-transform:uppercase; }
        .trow { display:grid;grid-template-columns:2fr 1fr 1fr 1fr;padding:10px 13px;border-bottom:1px solid var(--bdr);align-items:center;cursor:pointer;min-width:400px;transition:background .1s; }
        .trow:hover { background:var(--g50); }
        .trow:last-child { border-bottom:none; }
        .tdm { font-size:13px;font-weight:500;color:var(--ink); }
        .tds { font-size:11px;color:var(--mut);margin-top:2px; }
        .tdc { font-size:13px;color:var(--soft); }
        .sp { display:inline-block;font-size:11px;font-weight:600;padding:3px 9px;border-radius:100px; }
        .slive { background:var(--g100);color:var(--g700); }
        .sdraft { background:#FFF7ED;color:#92400E; }

        .share-box { background:var(--g50);border:1px solid var(--g200);border-radius:10px;padding:14px;margin-top:12px; }
        .share-url { font-family:monospace;font-size:13px;color:var(--g700);word-break:break-all; }
        .err { background:#FCEBEB;color:#A32D2D;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:12px; }
        .suc { background:var(--g50);color:var(--g700);border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:12px; }

        .supbar { background:var(--g800);color:rgba(255,255,255,.8);text-align:center;padding:10px;font-size:13px; }
        .supbar a { color:var(--g400);text-decoration:none;font-weight:600; }

        @media(max-width:768px){
          .sb { display:none; }
          .create-grid { grid-template-columns:1fr; }
          .srow { grid-template-columns:repeat(2,1fr); }
          .ttabs { gap:0; }
          .ttab { padding:4px 8px;font-size:11px; }
          .tname { display:none; }
          .thead,.trow { grid-template-columns:2fr 1fr 1fr;min-width:0; }
          .thead .thc:nth-child(4),.trow>*:nth-child(4) { display:none; }
        }
      `}</style>

      <div className="layout">
        {/* Topbar */}
        <div className="topbar">
          <a href="/" className="tlogo">
            <div className="tlm">P</div>
            Prashna<em>.</em>
          </a>
          <div className="ttabs">
            {['create','tests','analytics'].map(t => (
              <button key={t} className={`ttab ${tab===t?'act':''}`} onClick={() => setTab(t)}>
                {t === 'create' ? 'Dashboard' : t === 'tests' ? 'My Tests' : 'Analytics'}
              </button>
            ))}
          </div>
          <div className="tuser">
            <span className="tname">{teacherName}</span>
            <div className="tav" onClick={logout} title="Logout">{initials}</div>
          </div>
        </div>

        <div className="body">
          {/* Sidebar */}
          <div className="sb">
            <div className="sbsl">Create</div>
            <button className={`sbi ${tab==='create'?'act':''}`} onClick={() => setTab('create')}><span className="sic">✨</span>New Test</button>
            <button className={`sbi ${tab==='tests'?'act':''}`} onClick={() => setTab('tests')}><span className="sic">📋</span>My Tests</button>
            <div className="sbsl">Manage</div>
            <button className={`sbi ${tab==='analytics'?'act':''}`} onClick={() => setTab('analytics')}><span className="sic">📊</span>Analytics</button>
            <button className="sbi" onClick={() => router.push('/student')}><span className="sic">👥</span>Student View</button>
            <div className="sbsl">Account</div>
            <button className="sbi" onClick={logout} style={{marginTop:'auto'}}><span className="sic">🚪</span>Logout</button>
          </div>

          {/* Main */}
          <div className="main">
            {error && <div className="err">⚠️ {error}</div>}
            {success && (
              <div className="suc">
                ✅ {success}
                {shareCode && (
                  <div className="share-box" style={{marginTop:8}}>
                    <div style={{fontSize:12,color:'var(--g700)',marginBottom:4,fontWeight:600}}>Students ke liye link:</div>
                    <div className="share-url">{typeof window !== 'undefined' ? window.location.origin : ''}/test/{shareCode}</div>
                    <button className="btn-primary" style={{marginTop:8,padding:'6px 14px',fontSize:12}} onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/test/${shareCode}`); }}>Copy link</button>
                  </div>
                )}
              </div>
            )}

            {/* CREATE TAB */}
            {tab === 'create' && (
              <div>
                <div className="mhd"><div className="mtit">Create new test</div></div>
                <div style={{marginBottom:12}}>
                  <label className="lbl">Test title</label>
                  <input className="input" placeholder="e.g. Chapter 7 — Photosynthesis" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div className="create-grid">
                  <div className="box">
                    <label className="lbl">Paste notes / topic</label>
                    <textarea className="textarea" placeholder="Topic likho ya chapter content paste karo..." value={topic} onChange={e => setTopic(e.target.value)} />

                    <div className="upload-area" onClick={() => fileRef.current.click()}>
                      <input ref={fileRef} type="file" accept=".pdf" style={{display:'none'}} onChange={e => setPdfFile(e.target.files[0])} />
                      <div style={{fontSize:24}}>📄</div>
                      <p>{pdfFile ? `✅ ${pdfFile.name}` : 'Ya PDF upload karo (click here)'}</p>
                    </div>

                    <div className="row3">
                      <select className="select" value={qType} onChange={e => setQType(e.target.value)}>
                        <option value="mcq">MCQ</option>
                        <option value="short">Short Answer</option>
                        <option value="truefalse">True / False</option>
                        <option value="mixed">Mixed</option>
                      </select>
                      <select className="select" value={count} onChange={e => setCount(e.target.value)}>
                        <option value="5">5 questions</option>
                        <option value="10">10 questions</option>
                        <option value="20">20 questions</option>
                        <option value="30">30 questions</option>
                      </select>
                    </div>
                    <select className="select" style={{width:'100%',marginTop:8}} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="easy">Easy</option>
                      <option value="medium">Medium difficulty</option>
                      <option value="hard">Hard</option>
                    </select>
                    <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'12px',marginTop:12}} onClick={generateQuestions} disabled={genLoading}>
                      {genLoading ? <><span className="spinner"></span> Generating...</> : '✨ Generate with AI'}
                    </button>
                  </div>

                  <div className="box">
                    <div className="preview-hd">
                      <label className="lbl" style={{margin:0}}>Preview</label>
                      {questions.length > 0 && <span className="bqt">{questions.length} questions</span>}
                    </div>

                    {questions.length === 0 && !genLoading && (
                      <div className="empty"><span style={{fontSize:28}}>📝</span>Questions yahan dikhenge...</div>
                    )}
                    {genLoading && (
                      <div className="empty"><span className="spinner spinner-g"></span>AI questions bana raha hai...</div>
                    )}

                    <div style={{maxHeight:340,overflowY:'auto'}}>
                      {questions.map((q, i) => (
                        <div key={i} className="qcard">
                          <div className="qq">Q{i+1}. {q.question}</div>
                          {(q.type === 'mcq' || !q.type) && (
                            <div className="qopts">
                              {['A','B','C','D'].map(l => (
                                <div key={l} className={`qopt ${q.correct === l ? 'cor' : ''}`}>{l}. {q[`option${l}`]}</div>
                              ))}
                            </div>
                          )}
                          {q.type === 'short' && <div className="qans">Answer: {q.answer}</div>}
                          {q.type === 'truefalse' && <div className="qans">Answer: {q.correct}</div>}
                        </div>
                      ))}
                    </div>

                    {questions.length > 0 && (
                      <div style={{display:'flex',gap:8,marginTop:12}}>
                        <button className="btn-primary" style={{flex:1,justifyContent:'center',padding:'10px'}} onClick={saveTest} disabled={saveLoading}>
                          {saveLoading ? <span className="spinner"></span> : '💾 Save & Share'}
                        </button>
                        <button className="btn-secondary" style={{flex:1,padding:'10px'}} onClick={downloadPDF}>📄 Download PDF</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TESTS TAB */}
            {tab === 'tests' && (
              <div>
                <div className="mhd">
                  <div className="mtit">My tests</div>
                  <button className="btn-primary" style={{padding:'8px 16px',fontSize:13}} onClick={() => setTab('create')}>+ New test</button>
                </div>
                <div className="srow">
                  <div className="sc"><div className="scn">{tests.length}</div><div className="scl">Tests created</div></div>
                  <div className="sc"><div className="scn">{tests.filter(t => t.status==='live').length}</div><div className="scl">Live now</div></div>
                  <div className="sc"><div className="scn">{tests.reduce((a,t) => a + (t.attempts?.[0]?.count || 0), 0)}</div><div className="scl">Total attempts</div></div>
                  <div className="sc"><div className="scn">{tests.reduce((a,t) => a + (t.questions?.[0]?.count || 0), 0)}</div><div className="scl">Questions total</div></div>
                </div>
                {tests.length === 0 ? (
                  <div className="box" style={{textAlign:'center',padding:40}}>
                    <div style={{fontSize:36,marginBottom:10}}>📝</div>
                    <div style={{fontSize:15,fontWeight:500,color:'var(--ink)',marginBottom:6}}>Abhi tak koi test nahi</div>
                    <div style={{fontSize:13,color:'var(--mut)',marginBottom:16}}>Pehla test banao!</div>
                    <button className="btn-primary" onClick={() => setTab('create')}>Create test →</button>
                  </div>
                ) : (
                  <div className="ttbl">
                    <div className="thead">
                      <div className="thc">Test name</div>
                      <div className="thc">Questions</div>
                      <div className="thc">Attempts</div>
                      <div className="thc">Status</div>
                    </div>
                    {tests.map(t => (
                      <div key={t.id} className="trow">
                        <div>
                          <div className="tdm">{t.title}</div>
                          <div className="tds">{new Date(t.created_at).toLocaleDateString('en-IN')} · Code: {t.share_code}</div>
                        </div>
                        <div className="tdc">{t.questions?.[0]?.count || 0}</div>
                        <div className="tdc">{t.attempts?.[0]?.count || 0}</div>
                        <div><span className={`sp ${t.status==='live'?'slive':'sdraft'}`}>{t.status}</span></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ANALYTICS TAB */}
            {tab === 'analytics' && (
              <div>
                <div className="mhd"><div className="mtit">Analytics</div></div>
                <div className="srow">
                  <div className="sc"><div className="scn">{tests.length}</div><div className="scl">Tests total</div></div>
                  <div className="sc"><div className="scn">{tests.reduce((a,t) => a+(t.attempts?.[0]?.count||0),0)}</div><div className="scl">Total attempts</div></div>
                  <div className="sc"><div className="scn">{tests.filter(t=>t.status==='live').length}</div><div className="scl">Live tests</div></div>
                  <div className="sc"><div className="scn">{tests.reduce((a,t) => a+(t.questions?.[0]?.count||0),0)}</div><div className="scl">Questions made</div></div>
                </div>
                <div className="box" style={{textAlign:'center',padding:32}}>
                  <div style={{fontSize:32,marginBottom:10}}>📊</div>
                  <div style={{fontSize:15,fontWeight:500,color:'var(--ink)',marginBottom:6}}>Detailed analytics</div>
                  <div style={{fontSize:13,color:'var(--mut)'}}>Jab students tests attempt karenge, yahan class performance, weak topics, aur scores dikhenge.</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="supbar">Need help? <a href="tel:9863168046">📞 9863168046</a></div>
      </div>
    </>
  )
}
