#!/usr/bin/env node

// Simple script to check if the environment is properly set up
const fs = require("fs")
const path = require("path")

console.log("Checking environment setup...")

// Check if .env.local exists
const envPath = path.join(process.cwd(), ".env.local")
if (!fs.existsSync(envPath)) {
  console.error("\x1b[31m%s\x1b[0m", "❌ .env.local file not found!")
  console.log("Please create a .env.local file based on .env.example")
  process.exit(1)
}

// Read .env.local
const envContent = fs.readFileSync(envPath, "utf8")

// Check for DeepSeek API key
if (!envContent.includes("DEEPSEEK_API_KEY=") || envContent.includes("DEEPSEEK_API_KEY=your_deepseek_api_key_here")) {
  console.error("\x1b[31m%s\x1b[0m", "❌ DeepSeek API key not set in .env.local!")
  console.log("Please add your DeepSeek API key to .env.local")
  process.exit(1)
}

console.log("\x1b[32m%s\x1b[0m", "✅ Environment setup looks good!")
console.log("You can now run the application with:")
console.log("  npm run dev")
console.log("  or")
console.log("  yarn dev")

