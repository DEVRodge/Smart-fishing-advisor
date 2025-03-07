"use server"

type FishingParams = {
  location: string
  waterDepth: string
  targetFish: string
  otherFish?: string
  waterCondition: string
  weather: string
  pressure: string
  timeOfDay: string
}

// A better JSON fixer function
function repairJSON(jsonString: string): string {
  try {
    // First, try to parse as is
    JSON.parse(jsonString)
    return jsonString
  } catch (e) {
    console.log("Initial JSON parsing failed, attempting repair...")
    const error = e as Error
    console.log("Error message:", error.message)

    // Fix common syntax errors
    let fixedJson = jsonString

    // Replace single quotes with double quotes
    fixedJson = fixedJson.replace(/'/g, '"')

    // Fix unquoted property names
    fixedJson = fixedJson.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3')

    // Fix trailing commas in objects
    fixedJson = fixedJson.replace(/,(\s*})/g, "$1")

    // Fix missing commas between properties
    fixedJson = fixedJson.replace(/"\s*}\s*"/g, '", "')

    // Remove backslashes before quotes that are already escaped
    fixedJson = fixedJson.replace(/\\"/g, '"').replace(/"{2,}/g, '"')

    // Fix escaped quotes in values
    fixedJson = fixedJson.replace(/"([^"\\]*)\\"([^"\\]*)"/g, '"$1\\"$2"')

    // Fix unescaped newlines in strings
    fixedJson = fixedJson.replace(/(".*?)[\n\r]+(.*?")/g, "$1\\n$2")

    // Remove literal \n\r\t characters
    fixedJson = fixedJson.replace(/\\n|\\r|\\t/g, " ")

    // Remove UTF-8 BOM if present
    fixedJson = fixedJson.replace(/^\uFEFF/, "")

    // Look for specific error position if it's a position error
    if (error.message.includes("position")) {
      const match = error.message.match(/position (\d+)/)
      if (match && match[1]) {
        const position = Number.parseInt(match[1])
        console.log(`Error around position ${position}`)
        console.log(
          "Context:",
          fixedJson.substring(Math.max(0, position - 50), Math.min(fixedJson.length, position + 50)),
        )

        // Try to fix specific issues around the problem position
        try {
          // If it's a missing comma, add it
          if (fixedJson.charAt(position) === '"' && fixedJson.charAt(position - 1) === "}") {
            fixedJson = fixedJson.substring(0, position - 1) + "}," + fixedJson.substring(position)
          }

          // If it's an extra comma before closing brace, remove it
          if (fixedJson.charAt(position) === "}" && fixedJson.charAt(position - 1) === ",") {
            fixedJson = fixedJson.substring(0, position - 1) + fixedJson.substring(position)
          }

          // If there's a bare word, quote it
          const bareWordMatch = fixedJson
            .substring(Math.max(0, position - 20), position + 1)
            .match(/[^"]\b(\w+)\b:\s*$/)
          if (bareWordMatch && bareWordMatch[1]) {
            const word = bareWordMatch[1]
            const index = fixedJson.lastIndexOf(word + ":", position)
            if (index !== -1) {
              fixedJson =
                fixedJson.substring(0, index) + '"' + word + '":' + fixedJson.substring(index + word.length + 1)
            }
          }
        } catch (fixError) {
          console.error("Error during targeted position fix:", fixError)
        }
      }
    }

    // One more attempt to parse with all the fixes
    try {
      JSON.parse(fixedJson)
      console.log("Repair successful!")
      return fixedJson
    } catch (finalError) {
      console.log("JSON repair failed, falling back to manual structure creation")

      // Try to extract each field individually
      const extractField = (field: string) => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, "i")
        const match = fixedJson.match(regex)
        return match ? match[1] : null
      }

      // Try to handle nested objects as strings
      const fields = [
        "reasoning",
        "equipmentOptimization",
        "lureStrategy",
        "tacticalPoints",
        "timingPlan",
        "advancedTips",
        "contingencyPlan",
        "summary",
      ]
      const result: any = {}

      for (const field of fields) {
        try {
          // Try to extract as a standard field
          result[field] = extractField(field)

          // If not found as standard field, look for it as an object
          if (!result[field]) {
            const objRegex = new RegExp(`"${field}"\\s*:\\s*\\{([^}]*)}`, "i")
            const objMatch = fixedJson.match(objRegex)
            if (objMatch) {
              // Found as an object, try to parse it
              try {
                result[field] = JSON.parse(`{${objMatch[1]}}`)
              } catch {
                // If can't parse as object, use as string
                result[field] = objMatch[1]
              }
            }
          }
        } catch (e) {
          result[field] = `无法解析 ${field}`
        }
      }

      // Convert back to JSON string
      return JSON.stringify(result)
    }
  }
}

export async function generateFishingAdvice(params: FishingParams) {
  try {
    const fishNames: Record<string, string> = {
      bass: "鲈鱼",
      mandarinfish: "鳜鱼",
      catfish: "鲶鱼",
      redfincatfish: "翘嘴鱼",
      horsemouth: "马口鱼",
      mongolicus: "红尾鱼",
      greentippedredcatfish: "青稍红鲌",
      spinibarbushollandi: "军鱼",
      trout: "鳟鱼",
      snakehead: "黑鱼",
      other: params.otherFish || "其他鱼种",
    }

    const waterConditions: Record<string, string> = {
      clear: "清澈",
      muddy: "浑浊",
      fastFlow: "快速流动",
      slowFlow: "缓慢流动",
      stagnant: "静止",
    }

    const weatherConditions: Record<string, string> = {
      sunny: "晴天",
      cloudy: "多云",
      rainy: "雨天",
      windy: "大风",
      overcast: "阴天",
    }

    const timePeriods: Record<string, string> = {
      dawn: "黎明",
      morning: "清晨",
      noon: "正午",
      afternoon: "午后",
      dusk: "黄昏",
      night: "夜晚",
    }

    const prompt = `
作为一名拥有二十多年路亚钓鱼经验的专家，请根据以下环境参数，提供详细的专业钓鱼建议：

钓点位置：${params.location}
水域深度：${params.waterDepth}米
目标鱼种：${fishNames[params.targetFish] || params.targetFish}
实时水况：${waterConditions[params.waterCondition] || params.waterCondition}
气象数据：${weatherConditions[params.weather] || params.weather}
气压信息：${params.pressure}百帕
垂钓时段：${timePeriods[params.timeOfDay] || params.timeOfDay}

请先进行深入的环境分析和思维推理，然后基于分析结果提供全面的钓鱼策略。回答需要包含以下方面：

1. 环境分析：
   - 详细分析每个环境参数对钓鱼的影响
   - 找出有利和不利因素
   - 预测可能遇到的困难

2. 装备优化建议：
   - 路亚竿的选择和参数建议
   - 渔线种类和规格推荐
   - 路亚轮的型号和规格建议
   - 其他必要装备的推荐

3. 拟饵策略：
   - 详细的路亚类型选择建议
   - 具体的颜色搭配推荐
   - 重量和尺寸的精确建议
   - 备用拟饵的准备建议

4. 战术执行要点：
   - 详细的抛投技巧
   - 具体的检索方式
   - 钓位选择策略
   - 移动巡场方案

5. 时段作战计划：
   - 不同时段的具体战术
   - 最佳咬口时间预测
   - 休整与强攻时机把握

6. 进阶技巧提醒：
   - 专业性技巧要点
   - 易被忽视的细节
   - 提升命中率的技巧

7. 应急调整预案：
   - 鱼情不佳时的应对方案
   - 天气突变的调整策略
   - 装备故障的备用方案

8. 综合总结：
   - 关键成功要素
   - 需要特别注意的事项
   - 整体建议要点

你的回答必须是有效的JSON格式，以下是格式要求：
1. 使用双引号而不是单引号
2. 不要在JSON末尾添加逗号
3. 所有属性名必须加双引号
4. 所有字符串值必须加双引号
5. 不要在JSON前后添加任何额外的文本或注释
6. 确保正确处理引号内的引号（使用反斜杠转义）

回复的JSON结构必须严格如下：
{
  "reasoning": "环境分析和思维推理过程",
  "equipmentOptimization": "装备优化建议",
  "lureStrategy": "拟饵策略",
  "tacticalPoints": "战术执行要点",
  "timingPlan": "时段作战计划",
  "advancedTips": "进阶技巧提醒",
  "contingencyPlan": "应急调整预案",
  "summary": "综合总结"
}

重要提示：生成的JSON必须是有效格式，确保可以通过JSON.parse()函数解析而不出错。
`

    console.log("Initializing DeepSeek API...")

    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
      throw new Error("DeepSeek API key is missing. Please set the DEEPSEEK_API_KEY environment variable.")
    }

    // 直接使用fetch调用DeepSeek API
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-reasoner",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.5,
        max_tokens: 5000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        `DeepSeek API request failed: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`,
      )
    }

    const result = await response.json()
    const text = result.choices[0].message.content

    try {
      console.log("Raw response:", text.substring(0, 200) + "...")

      // First attempt: Try to parse the entire response as JSON
      try {
        const parsedResponse = JSON.parse(text)
        console.log("Successfully parsed entire response as JSON")
        return parsedResponse
      } catch (directParseError) {
        console.log("Could not parse entire response as JSON, trying to extract JSON...")
      }

      // Second attempt: Try to extract JSON using regex patterns
      let jsonMatch

      // Pattern 1: Find content between curly braces, including nested ones
      const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g
      const matches = text.match(jsonRegex)

      if (matches && matches.length > 0) {
        // Find the largest match which is likely the complete JSON
        jsonMatch = matches.reduce((a: string, b: string) => (a.length > b.length ? a : b), "")
        console.log("Extracted JSON using regex:", jsonMatch.substring(0, 100) + "...")
      }

      // If no match found, try another approach - look for JSON after markdown code blocks
      if (!jsonMatch) {
        const markdownJsonMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/)
        if (markdownJsonMatch && markdownJsonMatch[1]) {
          jsonMatch = markdownJsonMatch[1]
          console.log("Extracted JSON from markdown code block")
        }
      }

      // If still no match, try one more approach - look for the largest {...} block
      if (!jsonMatch) {
        const startIdx = text.indexOf("{")
        const endIdx = text.lastIndexOf("}")
        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
          jsonMatch = text.substring(startIdx, endIdx + 1)
          console.log("Extracted JSON using index positions")
        }
      }

      if (!jsonMatch) {
        throw new Error("无法从响应中提取有效的JSON")
      }

      // Deep clean and fix the extracted JSON
      console.log("Repairing JSON...")
      const repairedJson = repairJSON(jsonMatch)

      try {
        const parsedResponse = JSON.parse(repairedJson)
        console.log("Successfully parsed repaired JSON")
        return parsedResponse
      } catch (repairedParseError) {
        console.error("Error parsing repaired JSON:", repairedParseError)

        // Something is very broken, let's create a basic object with text
        // to avoid crashing the UI
        console.log("Creating fallback response object with raw text")

        // Ensure we have valid strings
        const safeText = text.replace(/\n/g, " ").replace(/"/g, "'")

        return {
          reasoning: "解析错误，但仍能提供部分建议。原始响应：\n\n" + safeText.substring(0, 500) + "...",
          equipmentOptimization: "无法解析JSON响应",
          lureStrategy: "无法解析JSON响应",
          tacticalPoints: "无法解析JSON响应",
          timingPlan: "无法解析JSON响应",
          advancedTips: "无法解析JSON响应",
          contingencyPlan: "无法解析JSON响应",
          summary: "解析响应时出错，请重试。",
        }
      }
    } catch (error) {
      console.error("Error in JSON processing:", error)

      // Final fallback - return a basic structure with error info
      return {
        reasoning: "处理响应时出错，但仍提供原始内容：\n\n" + text.substring(0, 1000),
        equipmentOptimization: "处理错误",
        lureStrategy: "处理错误",
        tacticalPoints: "处理错误",
        timingPlan: "处理错误",
        advancedTips: "处理错误",
        contingencyPlan: "处理错误",
        summary: "处理响应时出错，但您仍可查看原始内容。",
      }
    }
  } catch (error) {
    console.error("Error generating fishing advice:", error)
    if (error instanceof Error) {
      const errorMessage = error.message || "Unknown error"
      const errorName = error.name || "Error"

      // Still provide a valid response object instead of throwing
      return {
        reasoning: `生成建议时出错 [${errorName}]: ${errorMessage}`,
        equipmentOptimization: "生成错误",
        lureStrategy: "生成错误",
        tacticalPoints: "生成错误",
        timingPlan: "生成错误",
        advancedTips: "生成错误",
        contingencyPlan: "生成错误",
        summary: "请检查您的输入并重试。",
      }
    } else {
      return {
        reasoning: `生成建议时出现未知错误: ${String(error)}`,
        equipmentOptimization: "生成错误",
        lureStrategy: "生成错误",
        tacticalPoints: "生成错误",
        timingPlan: "生成错误",
        advancedTips: "生成错误",
        contingencyPlan: "生成错误",
        summary: "请检查您的输入并重试。",
      }
    }
  }
}

