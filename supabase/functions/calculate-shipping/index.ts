// supabase/functions/calculate-shipping/index.ts
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";

serve(async (req) => {
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
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const body = await req.json();

    const { name, address, city, state, zip, email, phone } = body;

    // Проверка обязательных полей
    if (!name || !address || !city || !state || !zip || !email || !phone) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const from_address = {
      
  "name": "Lucky Smokes",
  "street1": "486 NW 27 Ave",
  "city": "Miami",
  "state": "FL",
  "zip": "33125",
  "country": "US",
  "phone": "+13055551234",
  "email": "miras.auganbaev@mail.ru"

    };

    const to_address = {
      name,
      street1: address,
      city,
      state,
      zip,
      country: "US",
      phone,
      email,
    };

    // Запрос в Shippo
    const shippoResponse = await fetch("https://api.goshippo.com/shipments/", {
      method: "POST",
      headers: {
        Authorization: `ShippoToken shippo_test_76a8fd6ddddf626927628561843181970d7df641`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        address_from: from_address,
        address_to: to_address,
        parcels: [
          {
            length: "10",
            width: "6",
            height: "4",
            distance_unit: "in",
            weight: "1",
            mass_unit: "lb",
          },
        ],
      }),
    });

    if (!shippoResponse.ok) {
      const text = await shippoResponse.text();
      console.error("Shippo API error:", text);
      return new Response(
        JSON.stringify({ error: "Shippo API error", details: text }),
        { status: 502, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    const shippoData = await shippoResponse.json();

    if (!shippoData.rates || shippoData.rates.length === 0) {
      return new Response(
        JSON.stringify({ error: "No shipping rates found" }),
        { status: 400, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    // Находим самый дешевый тариф
    const cheapestRate = shippoData.rates.reduce((min, rate) => {
      return parseFloat(rate.amount) < parseFloat(min.amount) ? rate : min;
    });

    return new Response(
      JSON.stringify({
        amount: cheapestRate.amount,
        estimated_days: cheapestRate.estimated_days,
        servicelevel_name: cheapestRate.servicelevel.name,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    console.error("Error in calculate-shipping function:", err);
    return new Response(
      JSON.stringify({ error: "Shipping calculation error", details: String(err) }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});