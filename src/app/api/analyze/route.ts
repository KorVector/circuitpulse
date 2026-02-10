import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function POST(request: NextRequest) {
  try {
    const { image, availableParts } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    const prompt = `당신은 전기회로 전문가입니다. 제공된 회로도 이미지를 분석하고 다음 정보를 JSON 형식으로 제공하세요:

${availableParts ? `사용자가 보유한 부품: ${availableParts}\n` : ""}

다음 JSON 형식으로 응답하세요:
{
  "summary": "회로에 대한 전반적인 설명 (2-3문장)",
  "components": [
    {
      "name": "부품명",
      "type": "부품 유형 (저항, LED, 전지 등)",
      "value": "부품 값 (예: 220Ω, 9V)",
      "quantity": 수량
    }
  ],
  "errors": [
    {
      "type": "오류 유형",
      "description": "오류 설명",
      "severity": "warning | error | critical",
      "location": "오류 위치 (선택사항)"
    }
  ],
  "calculations": [
    {
      "parameter": "계산 항목 (예: 총 전류)",
      "value": "계산 값",
      "unit": "단위",
      "formula": "사용된 공식 (선택사항)"
    }
  ],
  "alternatives": [
    {
      "original": "원래 부품",
      "alternatives": ["대체 가능한 부품 목록"],
      "reason": "대체 가능한 이유",
      "availability": "수급 가능성 (선택사항)"
    }
  ],
  "causalExplanations": [
    {
      "issue": "문제 상황",
      "cause": "원인",
      "effect": "결과",
      "solution": "해결 방법"
    }
  ],
  "realWorldFactors": [
    {
      "factor": "고려해야 할 현실 요인",
      "impact": "영향",
      "recommendation": "권장사항 (선택사항)"
    }
  ],
  "dangerWarnings": [
    {
      "type": "위험 유형",
      "severity": "low | medium | high | critical",
      "description": "위험 설명",
      "precaution": "주의사항"
    }
  ],
  "optimizations": [
    {
      "area": "최적화 영역",
      "suggestion": "제안사항",
      "benefit": "기대효과"
    }
  ]
}

한국어로 응답하세요. 회로의 안전성, 효율성, 실용성을 중점적으로 분석하세요.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI 응답이 비어있습니다");
    }

    const analysisResult = JSON.parse(content);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      {
        error: "회로 분석 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
