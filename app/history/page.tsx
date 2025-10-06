'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ProblemSession {
  problem_text: string
  correct_answer: number
  difficulty: string
  created_at: string
}

interface HistoryItem {
  id: string
  user_answer: number
  is_correct: boolean
  feedback_text: string
  created_at: string
  session_id: string
  hints_used?: number
  math_problem_sessions: ProblemSession
}

interface Stats {
  totalAttempts: number
  correctAttempts: number
  accuracy: string
  difficultyBreakdown: {
    easy: number
    medium: number
    hard: number
  }
}

export default function History() {
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'easy' | 'medium' | 'hard'>('all')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchHistory()
  }, [filter, difficultyFilter])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter === 'correct') params.append('correctOnly', 'true')
      if (difficultyFilter !== 'all') params.append('difficulty', difficultyFilter)

      const response = await fetch(`/api/history?${params}`)
      if (!response.ok) throw new Error('Failed to fetch history')

      const data = await response.json()
      setHistory(data.history)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedItems(newExpanded)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 border-green-300 text-green-700'
      case 'medium': return 'bg-yellow-100 border-yellow-300 text-yellow-700'
      case 'hard': return 'bg-red-100 border-red-300 text-red-700'
      default: return 'bg-gray-100 border-gray-300 text-gray-700'
    }
  }

  const getResultColor = (isCorrect: boolean) => {
    return isCorrect
      ? 'bg-green-50 border-green-200'
      : 'bg-red-50 border-red-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-SG', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredHistory = history.filter(item => {
    if (filter === 'correct' && !item.is_correct) return false
    if (filter === 'incorrect' && item.is_correct) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b-2 border-purple-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              📚 Problem History
            </h1>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <span>←</span> Back to Practice
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Statistics Card */}
        {stats && (
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-purple-800 mb-4">📊 Your Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-800">{stats.totalAttempts}</div>
                <div className="text-blue-600">Total Attempts</div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-green-200 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-800">{stats.correctAttempts}</div>
                <div className="text-green-600">Correct Answers</div>
              </div>
              <div className="bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl p-4">
                <div className="text-3xl font-bold text-purple-800">{stats.accuracy}%</div>
                <div className="text-purple-600">Accuracy</div>
              </div>
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-4">
                <div className="text-sm font-semibold text-orange-800">
                  E: {stats.difficultyBreakdown.easy} |
                  M: {stats.difficultyBreakdown.medium} |
                  H: {stats.difficultyBreakdown.hard}
                </div>
                <div className="text-orange-600">Difficulty Breakdown</div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-purple-800 mb-4">🔍 Filters</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('correct')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'correct'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✓ Correct
              </button>
              <button
                onClick={() => setFilter('incorrect')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  filter === 'incorrect'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ✗ Incorrect
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDifficultyFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  difficultyFilter === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Levels
              </button>
              <button
                onClick={() => setDifficultyFilter('easy')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  difficultyFilter === 'easy'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                😊 Easy
              </button>
              <button
                onClick={() => setDifficultyFilter('medium')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  difficultyFilter === 'medium'
                    ? 'bg-yellow-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🤔 Medium
              </button>
              <button
                onClick={() => setDifficultyFilter('hard')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  difficultyFilter === 'hard'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔥 Hard
              </button>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center">
              <div className="text-2xl text-purple-600">Loading history...</div>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-12 text-center">
              <div className="text-6xl mb-4">📝</div>
              <div className="text-2xl text-gray-600">No problems attempted yet!</div>
              <Link
                href="/"
                className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
              >
                Start Practicing
              </Link>
            </div>
          ) : (
            filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`bg-white/90 backdrop-blur-md rounded-xl shadow-lg border-2 ${getResultColor(item.is_correct)} transition-all duration-200 hover:shadow-xl`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`text-2xl ${item.is_correct ? '✅' : '❌'}`}>
                        {item.is_correct ? '✅' : '❌'}
                      </span>
                      <div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getDifficultyColor(item.math_problem_sessions.difficulty)}`}>
                          {item.math_problem_sessions.difficulty.toUpperCase()}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {formatDate(item.created_at)}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleExpanded(item.id)}
                      className="text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      {expandedItems.has(item.id) ? 'Hide Details ↑' : 'Show Details ↓'}
                    </button>
                  </div>

                  <div className="text-gray-800 mb-3">
                    <strong>Problem:</strong> {item.math_problem_sessions.problem_text}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Your Answer:</span>{' '}
                      <span className={`font-bold ${item.is_correct ? 'text-green-600' : 'text-red-600'}`}>
                        {item.user_answer}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Correct Answer:</span>{' '}
                      <span className="font-bold text-blue-600">
                        {item.math_problem_sessions.correct_answer}
                      </span>
                    </div>
                    {item.hints_used !== undefined && item.hints_used > 0 && (
                      <div>
                        <span className="text-gray-600">💡 Hints Used:</span>{' '}
                        <span className="font-bold text-yellow-600">
                          {item.hints_used}/3
                        </span>
                      </div>
                    )}
                  </div>

                  {expandedItems.has(item.id) && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="font-semibold text-purple-800 mb-2">💡 Feedback:</div>
                        <div className="text-gray-700">{item.feedback_text}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}