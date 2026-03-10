import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory OTP store (development / small scale)
const otpStore = new Map<string, { code: string; expires: number }>();

// Cleanup expired OTPs every time the route runs
function cleanupExpiredOtps() {
  const now = Date.now();

  for (const [email, data] of otpStore.entries()) {
    if (now > data.expires) {
      otpStore.delete(email);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    cleanupExpiredOtps();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email required' },
        { status: 400 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { code, expires });

    await resend.emails.send({
      from: 'DocuMind AI <onboarding@resend.dev>',
      to: email,
      subject: 'Your DocuMind verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
          <h2 style="color: #1e293b; margin-bottom: 8px;">Verify your email</h2>
          <p style="color: #64748b; margin-bottom: 24px;">
            Enter this code to complete your registration:
          </p>

          <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #1e293b;">
              ${code}
            </span>
          </div>

          <p style="color: #94a3b8; font-size: 13px;">
            This code expires in 10 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);

    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  cleanupExpiredOtps();

  const { searchParams } = new URL(request.url);

  const email = searchParams.get('email');
  const code = searchParams.get('code');

  if (!email || !code) {
    return NextResponse.json(
      { success: false, error: 'Email and code required' },
      { status: 400 }
    );
  }

  const stored = otpStore.get(email);

  if (!stored) {
    return NextResponse.json(
      { success: false, error: 'No OTP found for this email' },
      { status: 400 }
    );
  }

  if (Date.now() > stored.expires) {
    otpStore.delete(email);

    return NextResponse.json(
      { success: false, error: 'OTP expired' },
      { status: 400 }
    );
  }

  if (stored.code !== code) {
    return NextResponse.json(
      { success: false, error: 'Invalid OTP' },
      { status: 400 }
    );
  }

  otpStore.delete(email);

  return NextResponse.json({ success: true });
}