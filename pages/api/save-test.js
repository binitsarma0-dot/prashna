import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Login required' })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: authHeader } } }
  )

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return res.status(401).json({ error: 'Invalid session' })

  const { title, subject, className, questions } = req.body

  if (!title || !questions?.length) {
    return res.status(400).json({ error: 'Title aur questions required hain' })
  }

  // Generate unique share code
  const shareCode = Math.random().toString(36).substring(2, 8).toUpperCase()

  // Save test
  const { data: test, error: testError } = await supabase
    .from('tests')
    .insert({ teacher_id: user.id, title, subject, class_name: className, status: 'live', share_code: shareCode })
    .select()
    .single()

  if (testError) return res.status(500).json({ error: testError.message })

  // Save questions
  const questionsToInsert = questions.map((q, i) => ({
    test_id: test.id,
    question_text: q.question,
    option_a: q.optionA || null,
    option_b: q.optionB || null,
    option_c: q.optionC || null,
    option_d: q.optionD || null,
    correct_answer: q.correct,
    question_type: q.type || 'mcq',
    order_num: i + 1
  }))

  const { error: qError } = await supabase.from('questions').insert(questionsToInsert)
  if (qError) return res.status(500).json({ error: qError.message })

  return res.status(200).json({ testId: test.id, shareCode, message: 'Test save ho gaya!' })
}
