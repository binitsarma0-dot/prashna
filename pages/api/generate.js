import Anthropic from '@anthropic-ai/sdk'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const form = formidable({ maxFileSize: 10 * 1024 * 1024 })
    const [fields, files] = await form.parse(req)

    const topic = fields.topic?.[0] || ''
    const questionType = fields.questionType?.[0] || 'mcq'
    const count = parseInt(fields.count?.[0] || '10')
    const difficulty = fields.difficulty?.[0] || 'medium'

    let contentText = topic

    // If PDF uploaded, extract text
    if (files.pdf?.[0]) {
      const pdfBuffer = fs.readFileSync(files.pdf[0].filepath)
      const pdfParse = (await import('pdf-parse')).default
      const pdfData = await pdfParse(pdfBuffer)
      contentText = pdfData.text.slice(0, 4000) // limit tokens
    }

    if (!contentText.trim()) {
      return res.status(400).json({ error: 'Topic ya PDF content daalein' })
    }

    const typeInstructions = {
      mcq: `Generate ${count} MCQ questions with 4 options (A, B, C, D) each. Mark the correct answer.`,
      short: `Generate ${count} short answer questions. Each answer should be 1-2 sentences.`,
      truefalse: `Generate ${count} True/False questions.`,
      mixed: `Generate ${Math.ceil(count/2)} MCQ questions and ${Math.floor(count/2)} short answer questions.`
    }

    const prompt = `You are an expert Indian school teacher creating exam questions.

Content/Topic:
${contentText}

Instructions:
- ${typeInstructions[questionType] || typeInstructions.mcq}
- Difficulty: ${difficulty}
- Questions should be relevant to Indian school curriculum (CBSE/ICSE style)
- Be precise and clear

Return ONLY a valid JSON array like this (no markdown, no explanation):
[
  {
    "question": "Question text here?",
    "type": "mcq",
    "optionA": "First option",
    "optionB": "Second option", 
    "optionC": "Third option",
    "optionD": "Fourth option",
    "correct": "B",
    "explanation": "Brief explanation why B is correct"
  }
]

For short answer questions use:
{
  "question": "Question text?",
  "type": "short",
  "answer": "Model answer here",
  "explanation": ""
}

For true/false use:
{
  "question": "Statement here",
  "type": "truefalse", 
  "correct": "True",
  "explanation": "Why this is true/false"
}`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 4000,
      messages: [{ role: 'user', content: prompt }]
    })

    const responseText = message.content[0].text.trim()

    // Parse JSON safely
    let questions
    try {
      const jsonMatch = responseText.match(/\[[\s\S]*\]/)
      questions = JSON.parse(jsonMatch ? jsonMatch[0] : responseText)
    } catch {
      return res.status(500).json({ error: 'AI response parse nahi hua, dobara try karo' })
    }

    return res.status(200).json({ questions, count: questions.length })

  } catch (error) {
    console.error('Generate error:', error)
    return res.status(500).json({ error: 'Question generate karne mein error aaya: ' + error.message })
  }
}
