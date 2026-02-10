import { NextRequest, NextResponse } from "next/server";
import type { CircuitComponent } from "@/types/circuit";

interface SimulationResult {
  totalCurrent: number;
  totalVoltage: number;
  totalResistance: number;
  totalPower: number;
  warnings: string[];
}

// Parse value with units (k=kilo, M=mega, G=giga, m=milli, μ/u=micro, n=nano, p=pico)
function parseValue(valueStr: string): number {
  // Match number followed by optional unit and multiplier
  const match = valueStr.match(/^([0-9.]+)\s*([kKMGmμunp])?([ΩVAFHWΩω]*)$/);
  if (!match) return 0;

  let value = parseFloat(match[1]);
  const multiplier = match[2]?.toLowerCase() || "";

  // Apply multipliers (case-insensitive)
  switch (multiplier) {
    case "k":
      value *= 1000; // kilo
      break;
    case "m":
      value *= 0.001; // milli
      break;
    case "μ":
    case "u":
      value *= 0.000001; // micro
      break;
    case "n":
      value *= 0.000000001; // nano
      break;
    case "p":
      value *= 0.000000000001; // pico
      break;
    case "g":
      value *= 1000000000; // giga (rare in electronics)
      break;
  }

  return value;
}

export async function POST(request: NextRequest) {
  try {
    const { components } = await request.json() as { components: CircuitComponent[] };

    if (!components || components.length === 0) {
      return NextResponse.json(
        { error: "부품이 제공되지 않았습니다" },
        { status: 400 }
      );
    }

    const warnings: string[] = [];
    let totalVoltage = 0;
    let totalResistance = 0;
    let hasVoltageSource = false;
    let resistorCount = 0;

    // Analyze components
    components.forEach((component) => {
      const value = parseValue(component.value);

      switch (component.type) {
        case "battery":
          totalVoltage += value;
          hasVoltageSource = true;
          break;
        case "resistor":
          totalResistance += value;
          resistorCount++;
          break;
        case "led":
          // LED typically has ~2V forward voltage and internal resistance
          totalResistance += 50; // Approximate internal resistance
          break;
        case "capacitor":
          // Capacitors in DC circuits act as open circuits after charging
          break;
        case "switch":
          if (component.value.toLowerCase() === "off") {
            warnings.push("스위치가 꺼져있어 회로가 작동하지 않습니다");
          }
          break;
      }
    });

    // Generate warnings
    if (!hasVoltageSource) {
      warnings.push("전원이 없습니다. 전지를 추가하세요.");
    }

    if (totalResistance === 0 && hasVoltageSource) {
      warnings.push("단락 위험! 저항이 없으면 과전류가 발생할 수 있습니다.");
      totalResistance = 0.1; // Prevent division by zero
    }

    if (resistorCount === 0 && hasVoltageSource) {
      warnings.push("LED나 다른 부품을 보호하기 위해 저항을 추가하는 것을 권장합니다.");
    }

    // Calculate using Ohm's law: V = I * R, P = V * I
    const totalCurrent = totalResistance > 0 ? totalVoltage / totalResistance : 0;
    const totalPower = totalVoltage * totalCurrent;

    // Check for dangerous conditions
    if (totalCurrent > 1) {
      warnings.push(`과전류 경고! ${totalCurrent.toFixed(2)}A는 일반 전자회로에 너무 높습니다.`);
    }

    if (totalPower > 5) {
      warnings.push(`과전력 경고! ${totalPower.toFixed(2)}W는 부품 손상을 일으킬 수 있습니다.`);
    }

    // Check LED without current limiting resistor
    const hasLED = components.some((c) => c.type === "led");
    if (hasLED && resistorCount === 0) {
      warnings.push("LED를 보호하기 위해 전류 제한 저항(220Ω 이상 권장)을 추가하세요.");
    }

    const result: SimulationResult = {
      totalVoltage,
      totalCurrent,
      totalResistance,
      totalPower,
      warnings,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Simulation error:", error);
    return NextResponse.json(
      {
        error: "시뮬레이션 중 오류가 발생했습니다",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
