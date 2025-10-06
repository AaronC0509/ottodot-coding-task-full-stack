import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PRIMARY_5_TOPICS = [
  'fractions',
  'decimals',
  'percentage',
  'ratio',
  'rate and speed',
  'area and perimeter',
  'volume',
  'four operations',
  'word problems with money'
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.action === 'submit') {
      return handleSubmission(body)
    }

    return generateNewProblem()
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

async function generateNewProblem() {
  try {
    const topic = PRIMARY_5_TOPICS[Math.floor(Math.random() * PRIMARY_5_TOPICS.length)]

    const prompt = `Generate a math word problem suitable for Primary 5 students (age 10-11) in Singapore.

Topic: ${topic}

Requirements:
- The problem should be realistic and engaging for children
- Use Singapore context when appropriate (e.g., Singapore dollars, local places)
- Numbers should be appropriate for Primary 5 level:
  * Whole numbers up to 10,000,000
  * Fractions with denominators up to 12
  * Decimals up to 3 decimal places
  * Percentages (common values like 10%, 25%, 50%, 75%)
- The problem should require 2-3 steps to solve
- Avoid overly complex language

You must respond with ONLY a JSON object in this exact format:
{
  "problem_text": "The complete word problem text here",
  "final_answer": numerical_answer_here
}

The final_answer must be a single number (can be decimal or whole number).

Example response:
{
  "problem_text": "Sarah bought 3 boxes of cookies. Each box contains 24 cookies. She gave 1/4 of all the cookies to her friends. How many cookies does Sarah have left?",
  "final_answer": 54
}`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    let problemData
    try {
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      problemData = JSON.parse(cleanedText)
    } catch (parseError) {
      console.error('Failed to parse AI response:', text)
      throw new Error('Invalid AI response format')
    }

    if (!problemData.problem_text || typeof problemData.final_answer !== 'number') {
      throw new Error('Invalid problem data structure')
    }

    const { data: session, error } = await supabase
      .from('math_problem_sessions')
      .insert({
        problem_text: problemData.problem_text,
        correct_answer: problemData.final_answer
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      throw new Error('Failed to save problem to database')
    }

    return NextResponse.json({
      sessionId: session.id,
      problem: {
        problem_text: problemData.problem_text,
        final_answer: problemData.final_answer
      }
    })
  } catch (error) {
    console.error('Problem generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate problem' },
      { status: 500 }
    )
  }
}

async function handleSubmission(body: any) {
  try {
    const { sessionId, userAnswer } = body

    if (!sessionId || userAnswer === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data: session, error: sessionError } = await supabase
      .from('math_problem_sessions')
      .select('*')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    const userAnswerNum = parseFloat(userAnswer)
    const correctAnswer = session.correct_answer
    const isCorrect = Math.abs(userAnswerNum - correctAnswer) < 0.01 

    const feedbackPrompt = `A Primary 5 student just attempted this math problem:

Problem: "${session.problem_text}"
Correct Answer: ${correctAnswer}
Student's Answer: ${userAnswerNum}
Result: ${isCorrect ? 'CORRECT' : 'INCORRECT'}

Please generate encouraging and educational feedback for the student.

Guidelines:
- Use simple, clear language appropriate for a 10-11 year old
- Be encouraging and positive, even if the answer is wrong
- If correct: Congratulate them and briefly explain why their approach worked
- If incorrect:
  * Be supportive and encouraging
  * Give a hint about what went wrong without giving the full solution immediately
  * Suggest what to check or reconsider
  * Mention the correct answer and provide a brief explanation
- Keep the feedback concise (2-3 sentences)
- Use an encouraging tone throughout

Respond with ONLY the feedback text, no JSON or formatting.`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-pro' })
    const feedbackResult = await model.generateContent(feedbackPrompt)
    const feedbackResponse = await feedbackResult.response
    const feedback = feedbackResponse.text().trim()

    const { error: submissionError } = await supabase
      .from('math_problem_submissions')
      .insert({
        session_id: sessionId,
        user_answer: userAnswerNum,
        is_correct: isCorrect,
        feedback_text: feedback
      })

    if (submissionError) {
      console.error('Failed to save submission:', submissionError)
      throw new Error('Failed to save submission')
    }

    return NextResponse.json({
      isCorrect,
      feedback,
      correctAnswer
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Failed to process submission' },
      { status: 500 }
    )
  }
}