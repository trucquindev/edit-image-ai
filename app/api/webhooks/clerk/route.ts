/* eslint-disable @typescript-eslint/no-explicit-any */
import { clerkClient } from '@clerk/nextjs';
import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
// import { NextResponse } from 'next/server';
import { Webhook } from 'svix';

import { createUser, deleteUser, updateUser } from '@/lib/actions/user.action';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return new Response(
      'Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local',
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing Svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Error: Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  // ✅ Trả về response ngay lập tức để tránh timeout
  setTimeout(async () => {
    await handleWebhook(eventType, evt.data);
  }, 0);

  return new Response('Webhook received', { status: 200 });
}

async function handleWebhook(eventType: string, data: any) {
  try {
    if (eventType === 'user.created') {
      const {
        id,
        email_addresses,
        image_url,
        first_name,
        last_name,
        username,
      } = data;

      const user = {
        clerkId: id,
        email: email_addresses[0].email_address,
        username: username!,
        firstName: first_name,
        lastName: last_name,
        photo: image_url,
      };

      const newUser = await createUser(user);

      if (newUser) {
        await clerkClient.users.updateUserMetadata(id, {
          publicMetadata: { userId: newUser._id },
        });
      }
    }

    if (eventType === 'user.updated') {
      const { id, image_url, first_name, last_name, username } = data;

      await updateUser(id, {
        firstName: first_name,
        lastName: last_name,
        username: username!,
        photo: image_url,
      });
    }

    if (eventType === 'user.deleted') {
      await deleteUser(data.id!);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
}

export function GET() {
  return new Response('This is the Clerk Webhook endpoint.', { status: 200 });
}
