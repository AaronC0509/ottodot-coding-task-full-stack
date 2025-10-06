import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, hintLevel } = body;

    if (!sessionId || !hintLevel) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("math_problem_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const hintPrompt = `You are helping a Primary 5 student (age 10-11) solve this math problem:

Problem: "${session.problem_text}"
Correct Answer: ${session.correct_answer}
Difficulty: ${session.difficulty || "medium"}
Hint Level: ${hintLevel} of 3

Please generate a hint for this problem based on the hint level:
- Hint 1: General guidance about what type of problem this is and what mathematical concepts to use. Don't give specific steps.
- Hint 2: More specific guidance about the steps needed, but don't do the calculations. Guide them on what operations to perform.
- Hint 3: Walk through the first major step with actual numbers, but let them complete the rest.

Guidelines:
- Use simple, encouraging language appropriate for a 10-11 year old
- Don't give away the answer directly
- Be supportive and help build understanding
- For hint 3, you can show one calculation but not the final answer
- Keep the hint concise (2-3 sentences)
- Use Singapore context/terminology where appropriate

Respond with ONLY the hint text, no JSON or formatting.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(hintPrompt);
    const response = await result.response;
    const hint = response.text().trim();

    return NextResponse.json({
      hint,
      hintLevel,
      problemText: session.problem_text,
    });
  } catch (error) {
    console.error("Hint generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate hint" },
      { status: 500 }
    );
  }
}
