'use client'

import { useState } from 'react'

interface MathProblem {
  problem_text: string
  final_answer: number
}

export default function Home() {
  const [problem, setProblem] = useState<MathProblem | null>(null)
  const [userAnswer, setUserAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showConfetti, setShowConfetti] = useState(false)

  const generateProblem = async () => {
    setIsLoading(true)
    setFeedback('')
    setIsCorrect(null)
    setUserAnswer('')
    setShowConfetti(false)

    try {
      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'generate' })
      })

      if (!response.ok) {
        throw new Error('Failed to generate problem')
      }

      const data = await response.json()

      setProblem(data.problem)
      setSessionId(data.sessionId)
    } catch (error) {
      console.error('Error generating problem:', error)
      alert('Failed to generate problem. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const submitAnswer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!sessionId || !userAnswer) {
      alert('Please generate a problem first and enter an answer.')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/math-problem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'submit',
          sessionId,
          userAnswer
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit answer')
      }

      const data = await response.json()

      setIsCorrect(data.isCorrect)
      setFeedback(data.feedback)

      if (data.isCorrect) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 3000)
      }
    } catch (error) {
      console.error('Error submitting answer:', error)
      alert('Failed to submit answer. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-indigo-500">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-8xl animate-bounce">🎉</div>
          <div className="absolute text-6xl animate-ping left-1/4 top-1/3">✨</div>
          <div className="absolute text-6xl animate-ping right-1/4 top-1/3 animation-delay-500">✨</div>
          <div className="absolute text-6xl animate-ping left-1/3 bottom-1/3 animation-delay-300">🌟</div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-xl border-b-2 border-purple-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-4">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent">
              Math Problem Generator
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Generate Problem Button */}
        <div className="mb-8">
          <button
            onClick={generateProblem}
            disabled={isLoading}
            className={`w-full py-5 px-6 rounded-2xl shadow-xl font-bold text-xl text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 ${
              isLoading
                ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                : 'bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600 hover:from-purple-600 hover:via-purple-700 hover:to-indigo-700'
            }`}
          >
            <span className="flex items-center justify-center gap-3">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Generating Magic...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🎲</span>
                  <span>Generate New Problem</span>
                  <span className="text-2xl">🎲</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Problem Display */}
        {problem && (
          <div className="mb-8 animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                  Q
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Your Challenge
                </h2>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200 mb-6">
                <p className="text-gray-800 text-lg md:text-xl leading-relaxed font-medium">
                  {problem.problem_text}
                </p>
              </div>

              {/* Answer Input Form */}
              <form onSubmit={submitAnswer} className="space-y-5">
                <div>
                  <label htmlFor="answer" className="block text-lg font-bold text-gray-700 mb-3">
                    ✍️ Your Answer:
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="answer"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      className="w-full px-5 py-4 pr-14 border-2 border-purple-300 rounded-xl text-lg font-semibold focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition-all duration-200"
                      placeholder="Type your answer here..."
                      required
                      step="any"
                    />
                    <span className="absolute right-4 top-4 text-3xl pointer-events-none">
                      🔢
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!userAnswer || isLoading}
                  className={`w-full py-4 px-6 rounded-xl shadow-xl font-bold text-lg text-white transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95 disabled:cursor-not-allowed disabled:opacity-70 flex items-center justify-center gap-3 ${
                    !userAnswer || isLoading
                      ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Checking...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">✅</span>
                      <span>Submit Answer</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Feedback Display */}
        {feedback && (
          <div className="animate-fade-in">
            <div className={`rounded-3xl shadow-2xl p-8 border-2 transition-all duration-500 ${
              isCorrect
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300'
                : 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
            }`}>
              {/* Result Badge */}
              <div className="flex items-center gap-4 mb-6">
                <span className={`text-5xl md:text-6xl ${isCorrect ? 'animate-bounce' : 'animate-pulse'}`}>
                  {isCorrect ? '🎊' : '💭'}
                </span>
                <h2 className={`text-3xl md:text-4xl font-bold ${
                  isCorrect ? 'text-green-700' : 'text-orange-700'
                }`}>
                  {isCorrect ? 'Fantastic Job!' : 'Almost There!'}
                </h2>
              </div>

              <div className={`bg-white/80 rounded-2xl p-6 border-2 ${
                isCorrect ? 'border-green-200' : 'border-orange-200'
              }`}>
                <p className="text-gray-800 text-lg md:text-xl leading-relaxed">
                  {feedback}
                </p>
              </div>

              <div className="mt-6 text-center">
                <p className={`text-lg font-bold ${
                  isCorrect ? 'text-green-600' : 'text-orange-600'
                }`}>
                  {isCorrect
                    ? '🌟 You\'re a math superstar! Ready for the next challenge? 🌟'
                    : '💪 Keep going! Practice makes perfect! 💪'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Instructions Card (shown when no problem) */}
        {!problem && !isLoading && (
          <div className="animate-fade-in">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border-2 border-purple-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <span className="text-3xl">🚀</span>
                Ready to Start?
              </h3>
              <div className="space-y-4">
                {[
                  { num: '1', title: 'Generate a Problem', desc: 'Click the big purple button to get your math challenge!' },
                  { num: '2', title: 'Solve It', desc: 'Take your time, work it out on paper if needed!' },
                  { num: '3', title: 'Submit Your Answer', desc: 'Type your answer and click submit!' },
                  { num: '4', title: 'Learn & Improve', desc: 'Get instant feedback and keep practicing!' }
                ].map((step, index) => (
                  <div key={index} className="flex gap-4">
                    <span className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0 shadow-lg">
                      {step.num}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-lg text-gray-800">
                        {step.title}
                      </p>
                      <p className="text-gray-600">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center">
                <p className="text-2xl font-bold text-purple-600 animate-pulse">
                  Let's make math fun! 🎉
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }

        .animation-delay-300 {
          animation-delay: 0.3s;
        }

        .animation-delay-500 {
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}