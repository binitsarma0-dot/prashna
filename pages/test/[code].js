import Head from 'next/head'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function TestPage() {
  const router = useRouter()
  const { code } = router.query
  const [test, setTest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [result, setResult] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!code) return
    fetch(`/api/test/${code}`)
      .then(r => r.json())
      .then(json => {
        if (json.error) setError(json.error)
        else setTest(json.test)
        setLoading(false)
      })
  }, [code])

  async function submitTest() {
    setSubmitting(true)
    const res = await fetch(`/api/test/${code}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: name, studentEmail: email, answers, testId: test.id })
    })
    const json = await res.json()
    setSubmitting(false)
    if (!res.ok) { setError(json.error); return }
    setResult(json)
    setSubmitted(true)
  }

  if (loading) return (
    <div style={{minHeight:'100svh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--sur)'}}>
      <div style={{textAlign:'center'}}>
        <div className="spinner spinner-g" style={{width:32,height:32,margin:'0 auto 12px'}}></div>
        <div style={{color:'var(--mut)'}}>Test load ho raha hai...</div>
      </div>
    </div>
  )

  return (
    <>
      <Head><title>{test?.title || 'Prashna Test'}</title></Head>
      <style jsx>{`
        .page { min-height:100svh;background:var(--sur);padding:20px; }
        .hdr { background:var(--g800);color:#fff;padding:14px 20px;border-radius:12px;margin-bottom:20px;max-width:760px;margin-left:auto;margin-right:auto; }
        .htit { font-family:var(--ffd);font-size:20px;color:#fff;margin-bottom:4px; }
        .hmeta { font-size:13px;color:rgba(255,255,255,.6); }
        .con { max-width:760px;margin:0 auto; }
        .box { background:var(--wht);border:1px solid var(--bdr);border-radius:13px;padding:24px;margin-bottom:16px; }
        .lbl { font-size:12px;font-weight:600;color:var(--mut);letter-spacing:.05em;text-transform:uppercase;margin-bottom:7px;display:block; }
        .qnum { font-size:12px;color:var(--g600);font-weight:600;margin-bottom:6px; }
        .qtxt { font-size:15px;font-weight:500;color:var(--ink);margin-bottom:14px;line-height:1.5; }
        .opts { display:flex;flex-direction:column;gap:8px; }
        .opt { display:flex;align-items:center;gap:10px;padding:11px 14px;border:1.5px solid var(--bdr);border-radius:9px;cursor:pointer;transition:all .15s;font-size:14px;color:var(--soft); }
        .opt:hover { border-color:var(--g400);background:var(--g50); }
        .opt.sel { border-color:var(--g500);background:var(--g50);color:var(--g700);font-weight:500; }
        .opt-dot { width:16px;height:16px;border-radius:50%;border:2px solid var(--bdr);flex-shrink:0;transition:all .15s; }
        .opt.sel .opt-dot { background:var(--g500);border-color:var(--g500); }
        .short-input { width:100%;padding:10px;border:1.5px solid var(--bdr);border-radius:9px;font-family:var(--ffb);font-size:14px;color:var(--ink);outline:none;transition:border-color .2s; }
        .short-input:focus { border-color:var(--g400); }
        .result-box { background:var(--g800);border-radius:16px;padding:32px;text-align:center;color:#fff; }
        .rscore { font-family:var(--ffd);font-size:56px;color:var(--g400);line-height:1; }
        .rpct { font-size:18px;color:rgba(255,255,255,.7);margin:4px 0 16px; }
        .rmsg { font-size:14px;color:rgba(255,255,255,.6); }
        .err { background:#FCEBEB;color:#A32D2D;border-radius:8px;padding:10px 12px;font-size:13px;margin-bottom:12px; }
        .prog { background:var(--g100);height:4px;border-radius:100px;margin-bottom:20px;overflow:hidden; }
        .prog-fill { height:100%;background:var(--g500);border-radius:100px;transition:width .3s; }
      `}</style>

      <div className="page">
        <div className="con">
          {error && <div className="err">⚠️ {error}</div>}

          {!loading && !error && test && !started && (
            <div className="box" style={{maxWidth:480,margin:'60px auto'}}>
              <div style={{textAlign:'center',marginBottom:24}}>
                <div style={{fontSize:36,marginBottom:8}}>📝</div>
                <div style={{fontFamily:'var(--ffd)',fontSize:22,color:'var(--ink)',marginBottom:6}}>{test.title}</div>
                <div style={{fontSize:13,color:'var(--mut)'}}>{test.questions?.length} questions</div>
              </div>
              {error && <div className="err">{error}</div>}
              <div style={{marginBottom:12}}>
                <label className="lbl">Tumhara naam</label>
                <input className="input" placeholder="Apna naam likho" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div style={{marginBottom:16}}>
                <label className="lbl">Email (optional)</label>
                <input className="input" type="email" placeholder="teacher ko result bhejne ke liye" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'13px'}} onClick={() => { if(!name.trim()){setError('Naam daalo');return;} setError(''); setStarted(true); }} >
                Test shuru karo →
              </button>
            </div>
          )}

          {started && !submitted && test && (
            <>
              <div className="hdr">
                <div className="htit">{test.title}</div>
                <div className="hmeta">{Object.keys(answers).length}/{test.questions?.length} answered · {name}</div>
              </div>
              <div className="prog">
                <div className="prog-fill" style={{width:`${(Object.keys(answers).length/test.questions.length)*100}%`}}></div>
              </div>
              {test.questions?.map((q, i) => (
                <div key={q.id} className="box">
                  <div className="qnum">Q{i+1} / {test.questions.length}</div>
                  <div className="qtxt">{q.question_text}</div>
                  {(q.question_type === 'mcq' || !q.question_type) && (
                    <div className="opts">
                      {['a','b','c','d'].map(l => q[`option_${l}`] && (
                        <div key={l} className={`opt ${answers[q.id]===l.toUpperCase()?'sel':''}`} onClick={() => setAnswers({...answers,[q.id]:l.toUpperCase()})}>
                          <div className="opt-dot"></div>
                          {l.toUpperCase()}. {q[`option_${l}`]}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'truefalse' && (
                    <div className="opts">
                      {['True','False'].map(v => (
                        <div key={v} className={`opt ${answers[q.id]===v?'sel':''}`} onClick={() => setAnswers({...answers,[q.id]:v})}>
                          <div className="opt-dot"></div>{v}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'short' && (
                    <input className="short-input" placeholder="Apna jawab likho..." value={answers[q.id]||''} onChange={e => setAnswers({...answers,[q.id]:e.target.value})} />
                  )}
                </div>
              ))}
              <button className="btn-primary" style={{width:'100%',justifyContent:'center',padding:'14px',fontSize:16,marginTop:8}} onClick={submitTest} disabled={submitting}>
                {submitting ? <><span className="spinner"></span> Submit ho raha hai...</> : 'Submit Test ✓'}
              </button>
            </>
          )}

          {submitted && result && (
            <div style={{maxWidth:480,margin:'60px auto'}}>
              <div className="result-box">
                <div className="rscore">{result.score}/{result.total}</div>
                <div className="rpct">{result.percentage}% correct</div>
                <div className="rmsg">
                  {result.percentage >= 80 ? '🎉 Bahut badhiya! Excellent performance!' :
                   result.percentage >= 60 ? '👍 Achha kiya! Thoda aur practice karo.' :
                   '📚 Mehnat karo — agle test mein better karoge!'}
                </div>
                <div style={{marginTop:20,padding:'12px',background:'rgba(255,255,255,.1)',borderRadius:8,fontSize:13,color:'rgba(255,255,255,.7)'}}>
                  {name} ka result teacher ko send ho gaya.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
