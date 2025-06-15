import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Simulate authentication logic
    if (email && password) {
      // In a real app, you'd verify credentials against a database
      const user = {
        id: "1",
        email,
        name: "Dream Creator",
      }

      // In a real app, you'd generate a proper JWT token
      const token = "mock_jwt_token_" + Date.now()

      return NextResponse.json({
        success: true,
        user,
        token,
      })
    }

    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
