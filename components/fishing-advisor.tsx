"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Loader2,
  Fish,
  Droplets,
  Clock,
  MapPin,
  ThermometerSun,
  Gauge,
  Brain,
  AlertTriangle,
  Settings,
  Target,
  Zap,
  Shield,
  FileText,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateFishingAdvice } from "@/lib/actions"
import { ErrorMessage } from "@/components/error-message"
import { Alert, AlertDescription } from "@/components/ui/alert"

const formSchema = z.object({
  location: z.string().min(2, { message: "请输入钓点位置" }),
  waterDepth: z.string().min(1, { message: "请输入水域深度" }),
  targetFish: z.string().min(1, { message: "请选择目标鱼种" }),
  otherFish: z.string().optional(),
  waterCondition: z.string().min(1, { message: "请选择实时水况" }),
  weather: z.string().min(1, { message: "请选择气象数据" }),
  pressure: z.string().min(1, { message: "请输入气压信息" }),
  timeOfDay: z.string().min(1, { message: "请选择垂钓时段" }),
})

// Helper function to render content that might be a string or an object
function renderContent(content: any) {
  if (!content || content === "JSON解析错误" || content === "生成错误" || content === "无法解析") {
    return (
      <div className="flex items-center p-3 bg-amber-50 text-amber-900 rounded-md border border-amber-200">
        <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
        <p>此部分内容生成失败，请重试</p>
      </div>
    )
  }

  if (typeof content === "string") {
    return <p className="whitespace-pre-line">{content}</p>
  } else if (typeof content === "object" && content !== null) {
    return (
      <div className="space-y-4">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="border-b pb-2 last:border-b-0 last:pb-0">
            <h4 className="font-medium text-blue-700 mb-1">{key}</h4>
            {typeof value === "string" ? (
              <p className="whitespace-pre-line">{value}</p>
            ) : (
              <p className="whitespace-pre-line">{JSON.stringify(value)}</p>
            )}
          </div>
        ))}
      </div>
    )
  } else {
    return <p>无内容</p>
  }
}

export function FishingAdvisor() {
  const [advice, setAdvice] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsedWithErrors, setParsedWithErrors] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      location: "",
      waterDepth: "",
      targetFish: "",
      otherFish: "",
      waterCondition: "",
      weather: "",
      pressure: "",
      timeOfDay: "",
    },
  })

  const watchTargetFish = form.watch("targetFish")

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)
    setError(null)
    setParsedWithErrors(false)
    try {
      console.log("Submitting form with values:", values)
      const result = await generateFishingAdvice(values)
      console.log("Received result:", result)

      // Check if there were parsing issues
      if (
        result.reasoning?.includes("解析错误") ||
        result.equipmentOptimization === "无法解析" ||
        result.equipmentOptimization === "JSON解析错误" ||
        result.equipmentOptimization === "生成错误"
      ) {
        setParsedWithErrors(true)
      }

      setAdvice(result)
    } catch (error) {
      console.error("Error in onSubmit:", error)
      setError(error instanceof Error ? error.message : "未知错误")
      setAdvice(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="bg-gray-50/50 backdrop-blur-sm shadow-md">
        <CardHeader>
          <CardTitle>环境参数输入</CardTitle>
          <CardDescription>请输入您的钓鱼环境参数，获取专业建议</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      钓点位置
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="水库/河流等具体位置" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="waterDepth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      水域深度
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="精确到米的水深数据" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="targetFish"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Fish className="h-4 w-4" />
                      目标鱼种
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择目标鱼种" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bass">鲈鱼</SelectItem>
                        <SelectItem value="mandarinfish">鳜鱼</SelectItem>
                        <SelectItem value="catfish">鲶鱼</SelectItem>
                        <SelectItem value="redfincatfish">翘嘴鱼</SelectItem>
                        <SelectItem value="horsemouth">马口鱼</SelectItem>
                        <SelectItem value="mongolicus">红尾鱼</SelectItem>
                        <SelectItem value="greentippedredcatfish">青稍红鲌</SelectItem>
                        <SelectItem value="spinibarbushollandi">军鱼</SelectItem>
                        <SelectItem value="trout">鳟鱼</SelectItem>
                        <SelectItem value="snakehead">黑鱼</SelectItem>
                        <SelectItem value="other">其他</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {watchTargetFish === "other" && (
                <FormField
                  control={form.control}
                  name="otherFish"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>其他鱼种描述</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入目标鱼种描述" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="waterCondition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Droplets className="h-4 w-4" />
                      实时水况
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择实时水况" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="clear">清澈</SelectItem>
                        <SelectItem value="muddy">浑浊</SelectItem>
                        <SelectItem value="fastFlow">快速流动</SelectItem>
                        <SelectItem value="slowFlow">缓慢流动</SelectItem>
                        <SelectItem value="stagnant">静止</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weather"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ThermometerSun className="h-4 w-4" />
                      气象数据
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择气象数据" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sunny">晴天</SelectItem>
                        <SelectItem value="cloudy">多云</SelectItem>
                        <SelectItem value="rainy">雨天</SelectItem>
                        <SelectItem value="windy">大风</SelectItem>
                        <SelectItem value="overcast">阴天</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Gauge className="h-4 w-4" />
                      气压信息
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="百帕级气压数值" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      垂钓时段
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择垂钓时段" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dawn">黎明</SelectItem>
                        <SelectItem value="morning">清晨</SelectItem>
                        <SelectItem value="noon">正午</SelectItem>
                        <SelectItem value="afternoon">午后</SelectItem>
                        <SelectItem value="dusk">黄昏</SelectItem>
                        <SelectItem value="night">夜晚</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  "生成钓鱼建议"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-6">
        <Card className="bg-gray-50/50 backdrop-blur-sm shadow-md">
          <CardHeader>
            <CardTitle>专业钓鱼建议</CardTitle>
            <CardDescription>基于您提供的环境参数生成的专业建议</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {error && (
              <div className="px-6">
                <ErrorMessage title="生成建议失败" message={error} />
              </div>
            )}

            {parsedWithErrors && (
              <div className="px-6">
                <Alert className="mb-4 bg-amber-50 text-amber-900 border-amber-200">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    部分内容生成或解析出现问题，但仍能显示可用的建议。您可以重试或尝试修改参数。
                  </AlertDescription>
                </Alert>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-gray-500">正在分析环境参数，生成专业建议...</p>
              </div>
            ) : advice ? (
              <Tabs defaultValue="reasoning" className="w-full">
                <div className="px-6 py-4 border-b bg-gray-50">
                  <TabsList className="grid grid-cols-4 gap-2 bg-transparent">
                    <TabsTrigger
                      value="reasoning"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Brain className="h-4 w-4 mb-1" />
                      <span>环境分析</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="equipment"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Settings className="h-4 w-4 mb-1" />
                      <span>装备优化</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="lure"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Fish className="h-4 w-4 mb-1" />
                      <span>拟饵策略</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="tactical"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Target className="h-4 w-4 mb-1" />
                      <span>战术要点</span>
                    </TabsTrigger>
                  </TabsList>
                </div>
                <div className="px-6 py-4 border-b bg-gray-50">
                  <TabsList className="grid grid-cols-4 gap-2 bg-transparent">
                    <TabsTrigger
                      value="timing"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Clock className="h-4 w-4 mb-1" />
                      <span>时段计划</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="advanced"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Zap className="h-4 w-4 mb-1" />
                      <span>进阶技巧</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="contingency"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <Shield className="h-4 w-4 mb-1" />
                      <span>应急预案</span>
                    </TabsTrigger>
                    <TabsTrigger
                      value="summary"
                      className="flex flex-col items-center justify-center bg-white hover:bg-blue-50 data-[state=active]:bg-blue-100 rounded-lg px-3 py-2 text-sm font-medium transition-all"
                    >
                      <FileText className="h-4 w-4 mb-1" />
                      <span>综合总结</span>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="p-6">
                  <TabsContent value="reasoning" className="mt-0">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900">环境分析与思维推理</h3>
                      <div className="space-y-3">
                        {typeof advice.reasoning === "object" && advice.reasoning !== null ? (
                          Object.entries(advice.reasoning).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <p className="text-gray-700 whitespace-pre-line">{advice.reasoning}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="equipment" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">装备优化建议</h3>
                      <div className="space-y-3">
                        {typeof advice.equipmentOptimization === "object" && advice.equipmentOptimization !== null ? (
                          Object.entries(advice.equipmentOptimization).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            {renderContent(advice.equipmentOptimization)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="lure" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">拟饵策略</h3>
                      <div className="space-y-3">
                        {typeof advice.lureStrategy === "object" && advice.lureStrategy !== null ? (
                          Object.entries(advice.lureStrategy).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">{renderContent(advice.lureStrategy)}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="tactical" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">战术执行要点</h3>
                      <div className="space-y-3">
                        {typeof advice.tacticalPoints === "object" && advice.tacticalPoints !== null ? (
                          Object.entries(advice.tacticalPoints).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            {renderContent(advice.tacticalPoints)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="timing" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">时段作战计划</h3>
                      <div className="space-y-3">
                        {typeof advice.timingPlan === "object" && advice.timingPlan !== null ? (
                          Object.entries(advice.timingPlan).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">{renderContent(advice.timingPlan)}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">进阶技巧提醒</h3>
                      <div className="space-y-3">
                        {typeof advice.advancedTips === "object" && advice.advancedTips !== null ? (
                          Object.entries(advice.advancedTips).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">{renderContent(advice.advancedTips)}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="contingency" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">应急调整预案</h3>
                      <div className="space-y-3">
                        {typeof advice.contingencyPlan === "object" && advice.contingencyPlan !== null ? (
                          Object.entries(advice.contingencyPlan).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            {renderContent(advice.contingencyPlan)}
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">综合总结</h3>
                      <div className="space-y-3">
                        {typeof advice.summary === "object" && advice.summary !== null ? (
                          Object.entries(advice.summary).map(([key, value]) => (
                            <div key={key} className="bg-white rounded-lg p-4 shadow-sm">
                              <div className="text-blue-600 font-medium mb-2">{key}</div>
                              <div className="text-gray-700">{String(value)}</div>
                            </div>
                          ))
                        ) : (
                          <div className="bg-white rounded-lg p-4 shadow-sm">{renderContent(advice.summary)}</div>
                        )}
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center px-6">
                <Fish className="h-16 w-16 text-blue-200 mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">尚未生成建议</h3>
                <p className="text-gray-500 max-w-xs">
                  请在左侧填写您的��鱼环境参数，点击"生成钓鱼建议"按钮获取专业建议
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {advice && (
          <Card className="bg-gray-50/50 backdrop-blur-sm shadow-md">
            <CardContent className="flex justify-center p-4">
              <Button
                variant="outline"
                onClick={() => form.handleSubmit(onSubmit)()}
                disabled={loading}
                className="w-full md:w-auto px-8 hover:bg-blue-50 hover:text-blue-600"
              >
                重新生成建议
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

