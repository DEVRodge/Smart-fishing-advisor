import { FishingAdvisor } from "@/components/fishing-advisor"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50/50 to-green-50/50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-2">智能路亚钓鱼建议系统</h1>
          <p className="text-gray-600">基于DeepSeek大模型的专业级垂钓方案定制</p>
        </div>
        <FishingAdvisor />
      </div>
    </main>
  )
}

