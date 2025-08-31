import { NextRequest, NextResponse } from 'next/server';
import ollama from 'ollama';

type ActionItem = {
  task: string;
  deadline: string;
  assignedTo: string;
};

const extractActionItemsFromAI = async (transcript: string): Promise<ActionItem[]> => {
  console.log("AI Processing transcript:", transcript.substring(0, 100) + "...");

  const prompt = `
    You are an expert at analyzing meeting transcripts. Your task is to identify action items, including the task, the person it's assigned to, and the deadline.
    From the following transcript, extract all action items and return them as a valid JSON array of objects, where each object has the keys "task", "assignedTo", and "deadline".
    If you cannot find a value for a key, use "N/A". If a task is assigned to multiple people, list them in the "assignedTo" field.
    Be precise and concise in your extraction. Do not add any information that is not present in the transcript.
    Do not include any other text or explanation in your response, only the JSON array.

    Transcript:
    ---
    ${transcript}
    ---
  `;

  try {
    const response = await ollama.chat({
      model: 'llama3', // Make sure you have the 'llama3' model pulled in Ollama
      messages: [{ role: 'user', content: prompt }],
      format: 'json',
    });

    const content = response.message.content;
    // The model should return a JSON string. We need to parse it.
    const parsedContent = JSON.parse(content);
    
    // It's good practice to validate the structure of the parsed content
    if (Array.isArray(parsedContent)) {
      return parsedContent as ActionItem[];
    }

    // Check if the response is an object with an actionItems array
    if (parsedContent && Array.isArray(parsedContent.actionItems)) {
      return parsedContent.actionItems as ActionItem[];
    }

    console.error("AI response is not a valid JSON array or object with actionItems:", parsedContent);
    return [];

  } catch (error) {
    console.error("Error interacting with Ollama:", error);
    // Depending on the error, you might want to handle it differently.
    // For now, we'll return an empty array to prevent the app from crashing.
    return [];
  }
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const actionItems = await extractActionItemsFromAI(transcript);

    return NextResponse.json({ actionItems }, { status: 200 });
  } catch (error) {
    console.error("Error extracting action items:", error);
    return NextResponse.json({ error: 'Failed to extract action items' }, { status: 500 });
  }
}
