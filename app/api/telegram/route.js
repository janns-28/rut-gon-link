// FILE: app/api/telegram/route.js
import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';
import { kv } from '@vercel/kv';

// Lấy Token bảo mật từ .env
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function sendMessage(chatId, text) {
  if (!TELEGRAM_TOKEN) return;
  await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: text })
  });
}

export async function POST(request) {
// ... (Giữ nguyên toàn bộ logic Lệnh Bot của mày bên dưới) ...
