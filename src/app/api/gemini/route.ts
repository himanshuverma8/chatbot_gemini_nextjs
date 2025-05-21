import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@/utils/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { message, pdfText } = await req.json();

    // Auth check with Supabase
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('Error getting user:', userError);
      return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Compose prompt for Gemini
    const prompt = pdfText
      ? `Answer the question based on the following PDF content:\n\n${pdfText}\n\nQuestion: ${message}`
      : message;

    // Call Gemini API
    const result = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
    });

    const reply = result.text || '❌ No response from Gemini.';

    // Save chat history in Supabase (messages table)
    const { error: insertError } = await supabase.from('messages').insert({
      user_id: user.id,
      query: message,
      response: reply,
    });

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      // Optional: You can still return success here if you want
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json({ error: 'Failed to get response from Gemini' }, { status: 500 });
  }
}
