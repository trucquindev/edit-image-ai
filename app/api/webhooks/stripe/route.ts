import { createTransaction } from '@/lib/actions/transaction.action';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Khởi tạo Stripe với API Key từ biến môi trường
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  const rawBody = await request.arrayBuffer(); // Chuyển body thành Buffer
  const body = Buffer.from(rawBody);

  const sig = request.headers.get('stripe-signature') as string;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!endpointSecret) {
    return NextResponse.json(
      { message: 'Missing STRIPE_WEBHOOK_SECRET' },
      { status: 500 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { message: 'Webhook error', error: err.message },
      { status: 400 }
    );
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === 'checkout.session.completed') {
    const { id, amount_total, metadata } = event.data.object;

    const transaction = {
      stripeId: id,
      amount: amount_total ? amount_total / 100 : 0,
      plan: metadata?.plan || '',
      credits: Number(metadata?.credits) || 0,
      buyerId: metadata?.buyerId || '',
      createdAt: new Date(),
    };

    const newTransaction = await createTransaction(transaction);

    return NextResponse.json({ message: 'OK', transaction: newTransaction });
  }

  return new Response('', { status: 200 });
}
