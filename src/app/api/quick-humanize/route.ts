/**
 * ============================================================================
 * QUICK HUMANIZE API ENDPOINT
 * ============================================================================
 * 
 * POST /api/quick-humanize
 * 
 * Fast humanization without verification loop
 * Good for previews or when speed is priority over perfection
 * 
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { quickHumanize } from '@/lib/humanizer';
import { ApiResponse } from '@/lib/types';

interface QuickHumanizeResult {
  humanizedText: string;
  originalLength: number;
  humanizedLength: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    if (!body.text || typeof body.text !== 'string') {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Text is required and must be a string'
      }, { status: 400 });
    }

    if (body.text.trim().length < 10) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Text must be at least 10 characters long'
      }, { status: 400 });
    }

    const text = body.text.trim();
    const mode = body.mode || 'casual';
    const intensity = body.intensity || 'medium';
    const provider = body.provider || 'groq';

    // Quick humanize without verification
    const humanizedText = await quickHumanize(text, mode, intensity, provider);

    return NextResponse.json<ApiResponse<QuickHumanizeResult>>({
      success: true,
      data: {
        humanizedText,
        originalLength: text.length,
        humanizedLength: humanizedText.length
      },
      message: 'Text humanized (quick mode - no verification)'
    });

  } catch (error) {
    console.error('Quick humanize API error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed. Use POST.'
  }, { status: 405 });
}
