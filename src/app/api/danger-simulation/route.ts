import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { dangerWarnings, circuitSummary } = await request.json();

    if (!dangerWarnings || dangerWarnings.length === 0) {
      return NextResponse.json({ simulations: [] });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API 키가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    // Step 1: Gemini 텍스트로 시뮬레이션 데이터 생성
    const textPrompt = `당신은 전기회로 안전 전문가입니다. 아래 회로의 위험 경고들에 대해, 각각 "만약 이 위험을 무시하면 실제로 어떤 일이 발생하는지"를 시뮬레이션해주세요.

회로 요약: ${circuitSummary}

위험 경고 목록:
${dangerWarnings.map((w: any, i: number) => `${i + 1}. [${w.severity}] ${w.type}: ${w.description}`).join("\n")}

각 위험에 대해 다음 JSON 배열로 응답하세요:
[
  {
    "warningType": "위험 유형",
    "severity": "심각도",
    "description": "이 위험 상황에 대한 구체적 설명",
    "imagePrompt": "이 위험 상황을 시각적으로 보여주는 사실적인 이미지를 생성하기 위한 영어 프롬프트. 예: 'A circuit board with burn marks and smoke rising from an overheated resistor, realistic photograph style, close-up view'. 반드시 안전하고 교육적인 이미지여야 합니다.",
    "consequence": "이 위험을 방치하면 발생하는 구체적 결과 (한국어, 2-3문장)",
    "preventionTip": "이 위험을 예방하는 구체적인 방법 (한국어, 2-3문장)"
  }
]

중요: imagePrompt는 반드시 영어로 작성하고, 교육 목적의 안전한 이미지만 생성되도록 하세요. 폭발이나 과도한 화재 장면은 피하고, 회로 부품의 손상/과열/연기 등 교육적 시각화에 집중하세요.`;

    const textResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: textPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            maxOutputTokens: 8192,
          },
        }),
      }
    );

    const textData = await textResponse.json();
    const simulationsText = textData.candidates?.[0]?.content?.parts?.[0]?.text;
    
    let simulations;
    try {
      simulations = JSON.parse(simulationsText);
    } catch {
      return NextResponse.json({ simulations: [] });
    }

    // Step 2: 각 시뮬레이션에 대해 이미지 생성 (최대 3개까지만)
    const limitedSimulations = simulations.slice(0, 3);
    
    const simulationsWithImages = await Promise.all(
      limitedSimulations.map(async (sim: any) => {
        // Try Imagen API first
        let imageBase64 = null;
        
        try {
          const imagenResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${process.env.GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                instances: [{ prompt: sim.imagePrompt }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "16:9",
                  safetyFilterLevel: "block_medium_and_above",
                },
              }),
            }
          );

          const imagenData = await imagenResponse.json();
          imageBase64 = imagenData.predictions?.[0]?.bytesBase64Encoded;
        } catch (imagenError) {
          console.log("Imagen API failed, trying Gemini image generation...");
        }

        // Fallback to Gemini image generation if Imagen fails
        if (!imageBase64) {
          try {
            const geminiImageResponse = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: sim.imagePrompt }] }],
                  generationConfig: {
                    responseModalities: ["IMAGE"],
                  },
                }),
              }
            );

            const geminiImageData = await geminiImageResponse.json();
            const imagePart = geminiImageData.candidates?.[0]?.content?.parts?.find(
              (part: any) => part.inlineData?.mimeType?.startsWith("image/")
            );
            imageBase64 = imagePart?.inlineData?.data;
          } catch (geminiError) {
            console.log("Gemini image generation also failed, proceeding without image");
          }
        }

        return {
          ...sim,
          imageBase64: imageBase64 || null,
        };
      })
    );

    return NextResponse.json({ simulations: simulationsWithImages });
  } catch (error) {
    console.error("Danger simulation error:", error);
    return NextResponse.json(
      { error: "위험 시뮬레이션 생성 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}
