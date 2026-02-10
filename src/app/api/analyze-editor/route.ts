import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { circuit } = await request.json();

    if (!circuit || !circuit.nodes) {
      return NextResponse.json(
        { error: "회로 데이터가 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인하세요." },
        { status: 500 }
      );
    }

    // Create a text representation of the circuit
    const circuitDescription = `
회로 구성:
- 총 부품 수: ${circuit.nodes.length}
- 연결 수: ${circuit.edges.length}

부품 목록:
${circuit.nodes.map((node: any) => `- ${node.label} (${node.type})${node.value ? `: ${node.value}${node.unit || ''}` : ''}`).join('\n')}

연결 정보:
${circuit.edges.map((edge: any, idx: number) => {
  const source = circuit.nodes.find((n: any) => n.id === edge.source);
  const target = circuit.nodes.find((n: any) => n.id === edge.target);
  return `${idx + 1}. ${source?.label || edge.source} → ${target?.label || edge.target}`;
}).join('\n')}
`;

    const prompt = `당신은 전기회로 전문가입니다. 다음 회로 구성을 분석하고 JSON 형식으로 응답하세요:

${circuitDescription}

다음 JSON 형식으로 응답하세요:
{
  "summary": "회로에 대한 전반적인 설명 (2-3문장)",
  "components": [
    {
      "name": "부품명",
      "type": "부품 유형 (저항, LED, 전지 등)",
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
  ]
}

한국어로 응답하세요. 회로의 안전성, 효율성, 실용성을 중점적으로 분석하세요.
연결이 올바른지, 부품 값이 적절한지, 위험한 구성은 없는지 확인하세요.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
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

    let analysisResult;
    try {
      analysisResult = JSON.parse(content);
    } catch {
      // JSON이 잘린 경우 복구 시도
      let fixed = content.trim();
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/\]/g) || []).length;

      fixed = fixed.replace(/,\s*$/, "");
      fixed = fixed.replace(/"[^"]*$/, '""');

      for (let i = 0; i < openBrackets - closeBrackets; i++) fixed += "]";
      for (let i = 0; i < openBraces - closeBraces; i++) fixed += "}";

      try {
        analysisResult = JSON.parse(fixed);
      } catch {
        analysisResult = {
          summary: content.substring(0, 500),
          components: [],
          errors: [],
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
