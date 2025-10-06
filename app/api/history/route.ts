import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const difficulty = searchParams.get('difficulty')
    const correctOnly = searchParams.get('correctOnly') === 'true'

    let query = supabase
      .from('math_problem_submissions')
      .select(`
        id,
        user_answer,
        is_correct,
        feedback_text,
        created_at,
        session_id,
        math_problem_sessions!inner (
          problem_text,
          correct_answer,
          difficulty,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (correctOnly) {
      query = query.eq('is_correct', true)
    }

    if (difficulty) {
      query = query.eq('math_problem_sessions.difficulty', difficulty)
    }

    const { data: submissions, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch history' },
        { status: 500 }
      )
    }

    const { data: stats } = await supabase
      .from('math_problem_submissions')
      .select('is_correct')

    const totalAttempts = stats?.length || 0
    const correctAttempts = stats?.filter(s => s.is_correct).length || 0
    const accuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts * 100).toFixed(1) : 0

    const { data: difficultyStats } = await supabase
      .from('math_problem_sessions')
      .select('difficulty')
      .in('id', submissions?.map(s => s.session_id) || [])

    const difficultyBreakdown = {
      easy: 0,
      medium: 0,
      hard: 0
    }

    difficultyStats?.forEach(stat => {
      if (stat.difficulty in difficultyBreakdown) {
        difficultyBreakdown[stat.difficulty as keyof typeof difficultyBreakdown]++
      }
    })

    return NextResponse.json({
      history: submissions || [],
      stats: {
        totalAttempts,
        correctAttempts,
        accuracy,
        difficultyBreakdown
      }
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}