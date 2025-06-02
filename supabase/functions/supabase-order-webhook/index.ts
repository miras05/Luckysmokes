import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const tableName = "orders";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set");
  throw new Error("Supabase environment variables missing");
}

console.log("✅ Supabase Order Webhook started...");

serve(async (req) => {
  try {
    const body = await req.json();
    console.log("📥 Webhook event body:", JSON.stringify(body, null, 2));

    const eventType = body.type;
    const data = body.data?.object;

    if (eventType !== "checkout.session.completed") {
      console.log(`⚠️ Ignoring event type: ${eventType}`);
      return new Response(JSON.stringify({ message: `Event ${eventType} ignored` }), { status: 200 });
    }

    console.log("🎯 Processing checkout.session.completed...");

    const customerName = data.customer_details?.name || "Unknown";
    const customerEmail = data.customer_details?.email || data.customer_email || "Unknown";
    const totalPrice = (data.amount_total || 0) / 100;

    // Адрес
    const shipping = data.shipping?.address || {};
    const fullAddress = [
      shipping.line1,
      shipping.line2,
      shipping.city,
      shipping.state,
      shipping.postal_code,
      shipping.country
    ].filter(Boolean).join(", ");

    // Items из metadata
    let items = [];
    try {
      const rawItems = data.metadata?.items || "[]";
      items = JSON.parse(rawItems);
      console.log("🛒 Parsed items:", items);
    } catch (err) {
      console.warn("⚠️ Failed to parse items from metadata:", err);
      items = [];
    }

    const orderData = {
      customer_name: customerName,
      email: customerEmail,
      address: fullAddress,
      items: items,
      total_price: totalPrice,
      status: "pending",
      stripe_session_id: data.id || null,
      created_at: new Date().toISOString()
    };

    console.log("📦 Sending order to Supabase:", orderData);

    const supabaseRes = await fetch(`${supabaseUrl}/rest/v1/${tableName}`, {
      method: "POST",
      headers: {
        "apikey": supabaseKey,
        "Authorization": `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation"
      },
      body: JSON.stringify(orderData)
    });

    const supabaseData = await supabaseRes.json();

    if (!supabaseRes.ok) {
      console.error("❌ Supabase error:", supabaseData);
      return new Response(JSON.stringify({ error: supabaseData }), { status: 500 });
    }

    console.log("✅ Order saved to Supabase:", supabaseData);
    return new Response(JSON.stringify({ received: true }), { status: 200 });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});