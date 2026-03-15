import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { code } = req.query

  if (req.method === 'GET') {
    const { data: test, error } = await supabase
      .from('tests')
      .select('*, questions(id, question_text, option_a, option_b, option_c, option_d, question_type, order_num)')
      .eq('share_code', code.toUpperCase())
      .eq('status', 'live')
      .single()

    if (error || !test) return res.status(404).json({ error: 'Test nahi mila ya band ho gaya' })

    // Don't send correct answers to student
    const safeTest = {
      ...test,
      questions: test.questions
        .sort((a, b) => a.order_num - b.order_num)
        .map(q => ({ ...q, correct_answer: undefined }))
    }

    return res.status(200).json({ test: safeTest })
  }

  if (req.method === 'POST') {
    const { studentName, studentEmail, answers, testId } = req.body

    // Get correct answers
    const { data: questions } = await supabase
      .from('questions')
      .select('id, correct_answer, question_type')
      .eq('test_id', testId)

    let score = 0
    let total = 0
    questions.forEach(q => {
      if (q.question_type === 'mcq' || q.question_type === 'truefalse') {
        total++
        if (answers[q.id]?.toUpperCase() === q.correct_answer?.toUpperCase()) score++
      }
    })

    const { data: attempt, error } = await supabase
      .from('attempts')
      .insert({ test_id: testId, student_name: studentName, student_email: studentEmail, answers, score, total })
      .select()
      .single()

    if (error) return res.status(500).json({ error: error.message })

    return res.status(200).json({ score, total, percentage: Math.round((score / total) * 100) })
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
