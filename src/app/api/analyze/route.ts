import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { image, availableParts, userQuestion } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: "이미지가 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인하세요." },
        { status: 500 }
      );
    }

    const matches = image.match(/^data:(.+);base64,(.+)$/);
    const mimeType = matches ? matches[1] : "image/png";
    const base64Data = matches ? matches[2] : image;

    const prompt = `당신은 전기회로 전문가입니다. 제공된 회로도 이미지를 분석하고 다음 정보를 JSON 형식으로 제공하세요:

${availableParts ? `사용자가 보유한 부품: ${availableParts}\n` : ""}
${userQuestion ? `사용자가 궁금한 점: ${userQuestion}\n` : ""}

다음 JSON 형식으로 응답하세요:
{
  "summary": "회로에 대한 전반적인 설명 (2-3문장)",
  "components": [
    {
      "name": "부품명",
      "type": "부품 유형 (어떤 부품이든 정확히 적으세요. 예: 저항, LED, 전지, 변압기, 다이오드 등)",
      "value": "부품 값 (예: 220Ω, 9V)",
      "quantity": 1
    }
  ],
  "errors": [
    {
      "type": "오류 유형",
      "description": "오류 설명",
      "severity": "warning | error | critical",
      "location": "오류 위치"
    }
  ],
  "calculations": [
    {
      "parameter": "계산 항목 (예: 총 전류)",
      "value": "계산 값",
      "unit": "단위",
      "formula": "사용된 공식"
    }
  ],
  "alternatives": [
    {
      "original": "원래 부품",
      "alternatives": ["대체 가능한 부품 목록"],
      "reason": "대체 가능한 이유",
      "availability": "수급 가능성"
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
      "recommendation": "권장사항"
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
  ],
  "reconstructedCircuit": {
    "description": "재구성된 회로에 대한 설명",
    "nodes": [
      {
        "id": "node-1",
        "type": "battery | resistor | led | capacitor | switch | and_gate | or_gate | not_gate | ground | power",
        "label": "부품 라벨 (예: 전지 9V)",
        "value": "부품 값 (예: 9V, 220Ω)",
        "position": { "x": 100, "y": 200 }
      }
    ],
    "edges": [
      {
        "id": "edge-1",
        "source": "node-1",
        "target": "node-2",
        "label": ""
      }
    ],
    "improvements": [
      "회로 개선사항 설명 (예: 저항이 없어 LED가 과전류로 손상될 수 있으므로 220Ω 저항을 추가했습니다)"
    ]
  }${userQuestion ? `,
  "userAnswer": "사용자 질문에 대한 상세 답변"` : ""}
}

**중요**: 
- 사용자의 어설픈(미완성) 회로도를 보고, 실제로 동작할 수 있도록 개선/재구성한 회로를 반환하세요.
- 노드 position의 x, y 좌표는 200px 간격으로 설정하세요 (예: x: 100, 300, 500 / y: 100, 300, 500).
- type은 반드시 다음 중 하나여야 합니다: battery, resistor, led, capacitor, switch, and_gate, or_gate, not_gate, ground, power
- improvements 배열에는 원본 회로에서 무엇을 개선했는지 구체적으로 나열하세요.${userQuestion ? `
- userQuestion에 대해 "userAnswer" 필드에 상세하고 친절하게 답변해주세요.` : ""}

한국어로 응답하세요. 회로의 안전성, 효율성, 실용성을 중점적으로 분석하세요.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 24576,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API 오류:", data);
      throw new Error(data.error?.message || "Gemini API 호출 실패");
    }

    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!content) {
      throw new Error("AI 응답이 비어있습니다");
    }

    // JSON이 잘릴 수 있으므로 안전하게 파싱
    let analysisResult;
    let parsedContent = content;
    
    // 1. 이중 문자열 감싸기 처리 (JSON이 문자열로 감싸진 경우)
    if (typeof parsedContent === 'string' && parsedContent.startsWith('"') && parsedContent.endsWith('"')) {
      try {
        parsedContent = JSON.parse(parsedContent);
      } catch {}
    }
    
    // 2. 마크다운 코드 블록으로 감싸진 경우
    if (typeof parsedContent === 'string') {
      const jsonMatch = parsedContent.match(/```json?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsedContent = jsonMatch[1].trim();
      }
    }
    
    try {
      analysisResult = JSON.parse(parsedContent);
    } catch {
      // JSON이 잘린 경우 - 닫는 괄호를 추가하여 복구 시도
      let fixed = parsedContent.trim();
      // 열린 배열/객체 수 계산 후 닫기
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;

      // 마지막 불완전한 문자열 정리
      fixed = fixed.replace(/,\s*$/, "");
      fixed = fixed.replace(/"[^"]*$/, '""');

      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
      for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";

      try {
        analysisResult = JSON.parse(fixed);
      } catch {
        // 복구 실패 시 - content에서 summary 필드 추출 시도
        let extractedSummary = "회로 분석 결과를 구조화하지 못했습니다. 다시 시도해주세요.";
        let extractedComponents: any[] = [];
        let extractedErrors: any[] = [];
        
        try {
          // content가 JSON 문자열처럼 보이면 summary 필드 추출 시도
          const summaryMatch = parsedContent.match(/"summary"\s*:\s*"([^"]+)"/);
          if (summaryMatch) {
            extractedSummary = summaryMatch[1];
          }
          
          // components 배열 추출 시도
          const componentsMatch = parsedContent.match(/"components"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
          if (componentsMatch) {
            try {
              extractedComponents = JSON.parse(componentsMatch[1]);
            } catch {}
          }
          
          // errors 배열 추출 시도
          const errorsMatch = parsedContent.match(/"errors"\s*:\s*(\[[\s\S]*?\])\s*[,}]/);
          if (errorsMatch) {
            try {
              extractedErrors = JSON.parse(errorsMatch[1]);
            } catch {}
          }
        } catch {}
        
        analysisResult = {
          summary: extractedSummary,
          components: extractedComponents,
          errors: extractedErrors,
          calculations: [],
          alternatives: [],
          causalExplanations: [],
          realWorldFactors: [],
          dangerWarnings: [],
          optimizations: [],
        };
      }
    }

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