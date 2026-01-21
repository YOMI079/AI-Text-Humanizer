/**
 * ============================================================================
 * HUMANIZE API ENDPOINT
 * ============================================================================
 * 
 * POST /api/humanize
 * 
 * Main endpoint for text humanization with verification loop
 * 
 * ============================================================================
 */

import { NextRequest, NextResponse } from 'next/server';
import { humanizeText } from '@/lib/humanizer';
import { HumanizationRequest, ApiResponse, HumanizationResult } from '@/lib/types';

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

    if (body.text.length > 50000) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Text must be less than 50,000 characters'
      }, { status: 400 });
    }

    const humanizationRequest: HumanizationRequest = {
      text: body.text.trim(),
      mode: body.mode || 'casual',
      intensity: body.intensity || 'medium',
      preserveKeyPoints: body.preserveKeyPoints !== false,
      targetAudience: body.targetAudience || undefined,
      provider: body.provider || 'groq'
    };

    // Get user history for learning (passed from client)
    const userHistory: string[] = body.userHistory || [];

    // Process the text
    const result = await humanizeText(humanizationRequest, userHistory);

    return NextResponse.json<ApiResponse<HumanizationResult>>({
      success: true,
      data: result,
      message: result.success 
        ? `Successfully humanized with score ${(result.finalScore * 100).toFixed(1)}%`
        : `Best result achieved: ${(result.finalScore * 100).toFixed(1)}%`
    });

  } catch (error) {
    console.error('Humanize API error:', error);
    
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }, { status: 500 });
  }
}

// Handle other methods
export async function GET() {
  return NextResponse.json<ApiResponse<null>>({
    success: false,
    error: 'Method not allowed. Use POST.'
  }, { status: 405 });
}
