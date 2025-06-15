import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Simulate user registration logic
    if (name && email && password) {
      // In a real app, you'd save the user to a database
      const user = {
        id: Date.now().toString(),
        name,
        email,
      }

      // In a real app, you'd generate a proper JWT token
      const token = "mock_jwt_token_" + Date.now()

      return NextResponse.json({
        success: true,
        user,
        token,
      })
    }

    return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
