# Math Problem Generator - Developer Assessment Starter Kit

## Overview

This is a starter kit for building an AI-powered math problem generator application. The goal is to create a standalone prototype that uses AI to generate math word problems suitable for Primary 5 students, saves the problems and user submissions to a database, and provides personalized feedback.

## Tech Stack

- **Frontend Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI Integration**: Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd math-problem-generator
```

### 2. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings → API to find your:
   - Project URL (starts with `https://`)
   - Anon/Public Key

### 3. Set Up Database Tables

1. In your Supabase dashboard, go to SQL Editor
2. Copy and paste the contents of `database.sql`
3. Click "Run" to create the tables and policies

### 4. Get Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### 5. Configure Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```
2. Edit `.env.local` and add your actual keys:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_actual_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
   GOOGLE_API_KEY=your_actual_google_api_key
   ```

### 6. Install Dependencies

```bash
npm install
```

### 7. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Your Task

### 1. Implement Frontend Logic (`app/page.tsx`)

Complete the TODO sections in the main page component:

- **generateProblem**: Call your API route to generate a new math problem
- **submitAnswer**: Submit the user's answer and get feedback

### 2. Create Backend API Route (`app/api/math-problem/route.ts`)

Create a new API route that handles:

#### POST /api/math-problem (Generate Problem)
- Use Google's Gemini AI to generate a math word problem
- The AI should return JSON with:
  ```json
  {
    "problem_text": "A bakery sold 45 cupcakes...",
    "final_answer": 15
  }
  ```
- Save the problem to `math_problem_sessions` table
- Return the problem and session ID to the frontend

#### POST /api/math-problem/submit (Submit Answer)
- Receive the session ID and user's answer
- Check if the answer is correct
- Use AI to generate personalized feedback based on:
  - The original problem
  - The correct answer
  - The user's answer
  - Whether they got it right or wrong
- Save the submission to `math_problem_submissions` table
- Return the feedback and correctness to the frontend

### 3. Requirements Checklist

- [✅] AI generates appropriate Primary 5 level math problems
- [✅] Problems and answers are saved to Supabase
- [✅] User submissions are saved with feedback
- [✅] AI generates helpful, personalized feedback
- [✅] UI is clean and mobile-responsive
- [✅] Error handling for API failures
- [✅] Loading states during API calls

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com) and import your repository
3. Add your environment variables in Vercel's project settings
4. Deploy!

## Assessment Submission

1) Live Demo URL provided here: https://math-problem-generator-rosy.vercel.app/
2) Project Secret Keys:
```
NEXT_PUBLIC_SUPABASE_URL=https://reounsmrjbykzlyyzqgc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlb3Vuc21yamJ5a3pseXl6cWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3Mjc2NjcsImV4cCI6MjA3NTMwMzY2N30.RxkOz2eh4W2nAqAy79mGJPtxo0uYM2M-5QRVT8Ichu8
GOOGLE_API_KEY=AIzaSyAlwWjz8YYXFOr9hdDk_iqHUjrHDFIzCjU
```

## Implementation Notes

### My Implementation:

- Gemini Integration: This was my first time to integrate Gemini actually, it feels impressed!
- Challenges Faced: Most likely the prompt side take a very important role, I was using Claude to help me to enhance the prompt
- Desired Feature: I was thinking to implement RAG into this assessment (but I started to work on the project Monday, no time to do this), whereby I can directly read from pdf and let using AI to convert the text into vector db, and then we can having dynamic topic followed based on what we upload.

## Additional Features (Optional)

If you have time, consider adding:

- [✅] Difficulty levels (Easy/Medium/Hard)
- [✅] Problem history view
- [✅] Score tracking (via history statistics)
- [✅] Different problem types (fractions, decimals, percentage, ratio, average, area/perimeter, volume, angles)
- [✅] Hints system
- [✅] Step-by-step solution explanations (via AI feedback)

---

Good luck with your assessment! 🎯