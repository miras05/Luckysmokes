import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@11.17.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    const { items, shippingData } = body;

    const line_items = items.map((item: any) => ({
  price_data: {
    currency: "usd",
    product_data: {
      name: item.flavor ? `${item.name} — ${item.flavor}` : item.name,
    },
    unit_amount: Math.round(item.price * 100),
  },
  quantity: item.quantity,
}));

    // Добавим доставку как отдельный item, если есть
    if (shippingData?.shippingCost) {
      line_items.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Shipping",
          },
          unit_amount: Math.round(shippingData.shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Создание сессии Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: 'https://luckysmokes.vercel.app/success.html',
      cancel_url: 'https://luckysmokes.vercel.app',
      metadata: {
        customer_name: shippingData.name,
        email: shippingData.email,
        phone: shippingData.phone,
        address: `${shippingData.address}, ${shippingData.city}, ${shippingData.state}, ${shippingData.zip}, ${shippingData.country}`,
        items: JSON.stringify(items), // Вкусы, количество, названия и т.д.
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err) {
    console.error("Stripe error", err);
    return new Response(JSON.stringify({ error: "Stripe error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});