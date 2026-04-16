import { NextResponse } from 'next/server';
import { generateProject, GenerationServiceError } from '@/lib/generation-service';
import { GenerateProjectRequest } from '@/types/generation';

export async function POST(request: Request) {
  let body: Partial<GenerateProjectRequest>;

  try {
    body = (await request.json()) as Partial<GenerateProjectRequest>;
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(
      await generateProject(body)
    );
  } catch (error) {
    if (error instanceof GenerationServiceError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: 'Generation failed' },
      { status: 500 }
    );
  }
}
