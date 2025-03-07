import { AlertCircle } from "lucide-react"

interface ErrorMessageProps {
  title?: string
  message: string
}

export function ErrorMessage({ title = "出错了", message }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
        <div>
          <h3 className="text-sm font-medium text-red-800">{title}</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{message}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

