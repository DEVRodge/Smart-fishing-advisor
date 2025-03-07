import requests
import json
import re

def repair_json(json_string):
    """Repair common JSON syntax errors"""
    try:
        # First try to parse as is
        json.loads(json_string)
        return json_string
    except Exception as e:
        print("Initial JSON parsing failed, attempting repair...")
        print(f"Error message: {str(e)}")
        
        # Fix common syntax errors
        fixed_json = json_string
        
        # Replace single quotes with double quotes
        fixed_json = fixed_json.replace("'", '"')
        
        # Fix unquoted property names
        fixed_json = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', fixed_json)
        
        # Fix trailing commas in objects
        fixed_json = re.sub(r',(\s*})', r'\1', fixed_json)
        
        # Fix missing commas between properties
        fixed_json = re.sub(r'"\s*}\s*"', r'", "', fixed_json)
        
        # Remove backslashes before quotes that are already escaped
        fixed_json = fixed_json.replace('\\"', '"').replace('""', '"')
        
        # Fix escaped quotes in values
        fixed_json = re.sub(r'"([^"\\]*)\\"([^"\\]*)"', r'"$1\\"$2"', fixed_json)
        
        # Fix unescaped newlines in strings
        fixed_json = re.sub(r'(".*?)[\n\r]+(.*?")', r'\1\\n\2', fixed_json)
        
        # Remove literal \n\r\t characters
        fixed_json = re.sub(r'\\n|\\r|\\t', ' ', fixed_json)
        
        # Remove UTF-8 BOM if present
        if fixed_json.startswith('\ufeff'):
            fixed_json = fixed_json[1:]
        
        # Try to parse with all the fixes
        try:
            json.loads(fixed_json)
            print("Repair successful!")
            return fixed_json
        except Exception as final_error:
            print(f"JSON repair failed: {str(final_error)}")
            
            # Try to extract each field individually
            fields = ["reasoning", "equipmentOptimization", "lureStrategy", 
                     "tacticalPoints", "timingPlan", "advancedTips", 
                     "contingencyPlan", "summary"]
            result = {}
            
            for field in fields:
                try:
                    # Try to extract as a standard field
                    pattern = f'"{field}"\\s*:\\s*"([^"]*)"'
                    match = re.search(pattern, fixed_json, re.IGNORECASE)
                    if match:
                        result[field] = match.group(1)
                    else:
                        # Look for it as an object
                        obj_pattern = f'"{field}"\\s*:\\s*\\{{([^}}]*)\\}}'
                        obj_match = re.search(obj_pattern, fixed_json, re.IGNORECASE)
                        if obj_match:
                            # Try to parse it as an object
                            try:
                                result[field] = json.loads(f'{{{obj_match.group(1)}}}')
                            except:
                                # Use as string if parsing fails
                                result[field] = obj_match.group(1)
                        else:
                            result[field] = f"无法解析 {field}"
                except Exception:
                    result[field] = f"无法解析 {field}"
            
            # Last resort: try to find text chunks
            if not result.get("reasoning"):
                text_chunks = re.findall(r'"([^"]{50,})"', fixed_json)
                if text_chunks:
                    result["reasoning"] = "无法解析JSON，但找到了以下内容：\n\n" + "\n".join(text_chunks[:3])
            
            return json.dumps(result)

def generate_fishing_advice(params, json=None):
    fish_names = {
        'bass': '鲈鱼', 'carp': '鲤鱼', 'catfish': '鲶鱼',
        'trout': '鳟鱼', 'snakehead': '黑鱼', 'other': '其他鱼种'
    }
    water_conditions = {
        'clear': '清澈', 'muddy': '浑浊', 'fastFlow': '快速流动',
        'slowFlow': '缓慢流动', 'stagnant': '静止'
    }
    weather_conditions = {
        'sunny': '晴天', 'cloudy': '多云', 'rainy': '雨天',
        'windy': '大风', 'overcast': '阴天'
    }
    time_periods = {
        'dawn': '黎明', 'morning': '清晨', 'noon': '正午',
        'afternoon': '午后', 'dusk': '黄昏', 'night': '夜晚'
    }

    prompt = f"""
  作为一名拥有二十多年路亚钓鱼经验的专家，请根据以下环境参数，提供详细的专业钓鱼建议：
  
  钓点位置：{params['location']}
  水域深度：{params['water_depth']}米
  目标鱼种：{fish_names[params['target_fish']]}
  实时水况：{water_conditions[params['water_condition']]}
  气象数据：{weather_conditions[params['weather']]}
  气压信息：{params['pressure']}百帕
  垂钓时段：{time_periods[params['time_of_day']]}
  
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
  {{
    "reasoning": "环境分析和思维推理过程",
    "equipmentOptimization": "装备优化建议",
    "lureStrategy": "拟饵策略",
    "tacticalPoints": "战术执行要点",
    "timingPlan": "时段作战计划",
    "advancedTips": "进阶技巧提醒",
    "contingencyPlan": "应急调整预案",
    "summary": "综合总结"
  }}
  
  重要提示：生成的JSON必须是有效格式，确保可以通过JSON.parse()函数解析而不出错。
  """

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer sk-d793e79340424b6a974a3c0dbff5eb45"
        }

        data = {
            "model": "deepseek-reasoner",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 5000
        }

        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers=headers,
            json=data
        )

        if response.status_code != 200:
            raise Exception(f"API request failed with status code {response.status_code}")

        result = response.json()
        advice_text = result['choices'][0]['message']['content']
        
        # First attempt: Try to parse the entire response as JSON
        try:
            return json.loads(advice_text)
        except json.JSONDecodeError:
            print("Could not parse entire response as JSON, trying to extract JSON...")
        
        # Extract JSON using regex patterns
        json_regex = r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}'
        matches = re.findall(json_regex, advice_text)
        
        if matches:
            # Find the largest match which is likely the complete JSON
            json_match = max(matches, key=len)
            print(f"Extracted JSON using regex: {json_match[:100]}...")
        else:
            # Try another approach - look for JSON after markdown code blocks
            markdown_match = re.search(r'\`\`\`(?:json)?\s*(\{[\s\S]*?\})\s*\`\`\`', advice_text)
            if markdown_match:
                json_match = markdown_match.group(1)
                print("Extracted JSON from markdown code block")
            else:
                # One more approach - look for the largest {...} block
                start_idx = advice_text.find('{')
                end_idx = advice_text.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_match = advice_text[start_idx:end_idx+1]
                    print("Extracted JSON using index positions")
                else:
                    raise Exception("无法从响应中提取有效的JSON")
        
        # Repair and clean the JSON
        repaired_json = repair_json(json_match)
        
        try:
            parsed_response = json.loads(repaired_json)
            print("Successfully parsed repaired JSON")
            return parsed_response
        except json.JSONDecodeError as e:
            print(f"Error parsing repaired JSON: {e}")
            
            # Create fallback response
            fallback = {
                "reasoning": f"解析错误，但仍能提供部分建议。原始响应：\n\n{advice_text[:500]}...",
                "equipmentOptimization": "JSON解析错误",
                "lureStrategy": "JSON解析错误",
                "tacticalPoints": "JSON解析错误",
                "timingPlan": "JSON解析错误",
                "advancedTips": "JSON解析错误",
                "contingencyPlan": "JSON解析错误",
                "summary": "解析响应时出错，请重试。"
            }
            return fallback
    
    except Exception as e:
        print(f"Error: {str

</cut_off_point>

```typescriptreact file="app/fishing_advice.py"
import requests
import json
import re

def repair_json(json_string):
    """Repair common JSON syntax errors"""
    try:
        # First try to parse as is
        json.loads(json_string)
        return json_string
    except Exception as e:
        print("Initial JSON parsing failed, attempting repair...")
        print(f"Error message: {str(e)}")
        
        # Fix common syntax errors
        fixed_json = json_string
        
        # Replace single quotes with double quotes
        fixed_json = fixed_json.replace("'", '"')
        
        # Fix unquoted property names
        fixed_json = re.sub(r'([{,]\s*)([a-zA-Z0-9_]+)(\s*:)', r'\1"\2"\3', fixed_json)
        
        # Fix trailing commas in objects
        fixed_json = re.sub(r',(\s*})', r'\1', fixed_json)
        
        # Fix missing commas between properties
        fixed_json = re.sub(r'"\s*}\s*"', r'", "', fixed_json)
        
        # Remove backslashes before quotes that are already escaped
        fixed_json = fixed_json.replace('\\"', '"').replace('""', '"')
        
        # Fix escaped quotes in values
        fixed_json = re.sub(r'"([^"\\]*)\\"([^"\\]*)"', r'"$1\\"$2"', fixed_json)
        
        # Fix unescaped newlines in strings
        fixed_json = re.sub(r'(".*?)[\n\r]+(.*?")', r'\1\\n\2', fixed_json)
        
        # Remove literal \n\r\t characters
        fixed_json = re.sub(r'\\n|\\r|\\t', ' ', fixed_json)
        
        # Remove UTF-8 BOM if present
        if fixed_json.startswith('\ufeff'):
            fixed_json = fixed_json[1:]
        
        # Try to parse with all the fixes
        try:
            json.loads(fixed_json)
            print("Repair successful!")
            return fixed_json
        except Exception as final_error:
            print(f"JSON repair failed: {str(final_error)}")
            
            # Try to extract each field individually
            fields = ["reasoning", "equipmentOptimization", "lureStrategy", 
                     "tacticalPoints", "timingPlan", "advancedTips", 
                     "contingencyPlan", "summary"]
            result = {}
            
            for field in fields:
                try:
                    # Try to extract as a standard field
                    pattern = f'"{field}"\\s*:\\s*"([^"]*)"'
                    match = re.search(pattern, fixed_json, re.IGNORECASE)
                    if match:
                        result[field] = match.group(1)
                    else:
                        # Look for it as an object
                        obj_pattern = f'"{field}"\\s*:\\s*\\{{([^}}]*)\\}}'
                        obj_match = re.search(obj_pattern, fixed_json, re.IGNORECASE)
                        if obj_match:
                            # Try to parse it as an object
                            try:
                                result[field] = json.loads(f'{{{obj_match.group(1)}}}')
                            except:
                                # Use as string if parsing fails
                                result[field] = obj_match.group(1)
                        else:
                            result[field] = f"无法解析 {field}"
                except Exception:
                    result[field] = f"无法解析 {field}"
            
            # Last resort: try to find text chunks
            if not result.get("reasoning"):
                text_chunks = re.findall(r'"([^"]{50,})"', fixed_json)
                if text_chunks:
                    result["reasoning"] = "无法解析JSON，但找到了以下内容：\n\n" + "\n".join(text_chunks[:3])
            
            return json.dumps(result)

def generate_fishing_advice(params):
    fish_names = {
        'bass': '鲈鱼', 'carp': '鲤鱼', 'catfish': '鲶鱼',
        'trout': '鳟鱼', 'snakehead': '黑鱼', 'other': '其他鱼种'
    }
    water_conditions = {
        'clear': '清澈', 'muddy': '浑浊', 'fastFlow': '快速流动',
        'slowFlow': '缓慢流动', 'stagnant': '静止'
    }
    weather_conditions = {
        'sunny': '晴天', 'cloudy': '多云', 'rainy': '雨天',
        'windy': '大风', 'overcast': '阴天'
    }
    time_periods = {
        'dawn': '黎明', 'morning': '清晨', 'noon': '正午',
        'afternoon': '午后', 'dusk': '黄昏', 'night': '夜晚'
    }

    prompt = f"""
  作为一名拥有二十多年路亚钓鱼经验的专家，请根据以下环境参数，提供详细的专业钓鱼建议：
  
  钓点位置：{params['location']}
  水域深度：{params['water_depth']}米
  目标鱼种：{fish_names[params['target_fish']]}
  实时水况：{water_conditions[params['water_condition']]}
  气象数据：{weather_conditions[params['weather']]}
  气压信息：{params['pressure']}百帕
  垂钓时段：{time_periods[params['time_of_day']]}
  
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
  {{
    "reasoning": "环境分析和思维推理过程",
    "equipmentOptimization": "装备优化建议",
    "lureStrategy": "拟饵策略",
    "tacticalPoints": "战术执行要点",
    "timingPlan": "时段作战计划",
    "advancedTips": "进阶技巧提醒",
    "contingencyPlan": "应急调整预案",
    "summary": "综合总结"
  }}
  
  重要提示：生成的JSON必须是有效格式，确保可以通过JSON.parse()函数解析而不出错。
  """

    try:
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer sk-d793e79340424b6a974a3c0dbff5eb45"
        }

        data = {
            "model": "deepseek-reasoner",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.5,
            "max_tokens": 5000
        }

        response = requests.post(
            "https://api.deepseek.com/v1/chat/completions",
            headers=headers,
            json=data
        )

        if response.status_code != 200:
            raise Exception(f"API request failed with status code {response.status_code}")

        result = response.json()
        advice_text = result['choices'][0]['message']['content']
        
        # First attempt: Try to parse the entire response as JSON
        try:
            return json.loads(advice_text)
        except json.JSONDecodeError:
            print("Could not parse entire response as JSON, trying to extract JSON...")
        
        # Extract JSON using regex patterns
        json_regex = r'\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}'
        matches = re.findall(json_regex, advice_text)
        
        if matches:
            # Find the largest match which is likely the complete JSON
            json_match = max(matches, key=len)
            print(f"Extracted JSON using regex: {json_match[:100]}...")
        else:
            # Try another approach - look for JSON after markdown code blocks
            markdown_match = re.search(r'\`\`\`(?:json)?\s*(\{[\s\S]*?\})\s*\`\`\`', advice_text)
            if markdown_match:
                json_match = markdown_match.group(1)
                print("Extracted JSON from markdown code block")
            else:
                # One more approach - look for the largest {...} block
                start_idx = advice_text.find('{')
                end_idx = advice_text.rfind('}')
                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_match = advice_text[start_idx:end_idx+1]
                    print("Extracted JSON using index positions")
                else:
                    raise Exception("无法从响应中提取有效的JSON")
        
        # Repair and clean the JSON
        repaired_json = repair_json(json_match)
        
        try:
            parsed_response = json.loads(repaired_json)
            print("Successfully parsed repaired JSON")
            return parsed_response
        except json.JSONDecodeError as e:
            print(f"Error parsing repaired JSON: {e}")
            
            # Create fallback response
            fallback = {
                "reasoning": f"解析错误，但仍能提供部分建议。原始响应：\n\n{advice_text[:500]}...",
                "equipmentOptimization": "JSON解析错误",
                "lureStrategy": "JSON解析错误",
                "tacticalPoints": "JSON解析错误",
                "timingPlan": "JSON解析错误",
                "advancedTips": "JSON解析错误",
                "contingencyPlan": "JSON解析错误",
                "summary": "解析响应时出错，请重试。"
            }
            return fallback
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            "reasoning": f"生成建议时出错: {str(e)}",
            "equipmentOptimization": "生成错误",
            "lureStrategy": "生成错误",
            "tacticalPoints": "生成错误",
            "timingPlan": "生成错误",
            "advancedTips": "生成错误",
            "contingencyPlan": "生成错误",
            "summary": "请检查您的输入并重试。"
        }

