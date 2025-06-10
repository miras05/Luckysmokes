document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("shipping-form");
  const addressFields = document.getElementById("address-fields");
  const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
  const addressInputs = addressFields.querySelectorAll("input");

  function updateFields() {
    const selected = document.querySelector('input[name="delivery"]:checked')?.value;
    if (selected === "pickup") {
      addressFields.style.display = "none";
      addressInputs.forEach(input => {
        input.required = false;
        input.value = ""; // Очистить значения
      });
    } else {
      addressFields.style.display = "block";
      addressInputs.forEach(input => {
        input.required = true;
      });
    }
  }

  updateFields();
  deliveryRadios.forEach(radio => {
    radio.addEventListener("change", updateFields);
  });

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const deliveryMethod = formData.get("delivery");

    const data = {
      name: formData.get("name"),
      address: formData.get("address"),
      city: formData.get("city"),
      state: formData.get("state"),
      zip: formData.get("zip"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      deliveryMethod: deliveryMethod,
    };

    try {
      let shippingCost = 0;

      if (deliveryMethod === "delivery") {
        const response = await fetch("https://mtoxoprljcooaxpkigkv.supabase.co/functions/v1/calculate-shipping", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3hvcHJsamNvb2F4cGtpZ2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTM0NjMsImV4cCI6MjA2MzU2OTQ2M30._K4PlESPqqo2h2svcTRrU0VMmZXFD_7t40lttCDJq2Y"
          },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok || result.error) {
          alert("Error calculating shipping: " + (result.error || "Unknown error"));
          console.error("Shipping error details:", result.details || "");
          return;
        }

        shippingCost = result.amount;

        localStorage.setItem("shippingData", JSON.stringify({
          ...data,
          shippingCost: shippingCost,
          estimatedDays: result.estimated_days,
          serviceLevel: result.servicelevel_name,
        }));

      } else {
        localStorage.setItem("shippingData", JSON.stringify({
          ...data,
          shippingCost: 0,
          estimatedDays: null,
          serviceLevel: null,
        }));
      }

      // 🛒 Собираем товары из модалки или корзины
      let items = [];

      const modalItem = JSON.parse(localStorage.getItem("modalItem"));
      if (modalItem) {
        items.push({
          name: modalItem.name,
          price: modalItem.price,
          quantity: modalItem.quantity,
        });
      } else {
        const cart = JSON.parse(localStorage.getItem("cart")) || [];
        items = cart.map(item => ({
          name: item.name,
          flavor: item.flavor,
          price: item.price,
          quantity: item.quantity
        }));
      }

      // Добавляем доставку, если выбрана
      if (deliveryMethod === "delivery") {
        items.push({
          name: "Shipping",
          price: shippingCost,
          quantity: 1
        });
      }

      const res = await fetch("https://mtoxoprljcooaxpkigkv.supabase.co/functions/v1/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3hvcHJsamNvb2F4cGtpZ2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTM0NjMsImV4cCI6MjA2MzU2OTQ2M30._K4PlESPqqo2h2svcTRrU0VMmZXFD_7t40lttCDJq2Y"
        },
        body: JSON.stringify({ items, shippingData: data })
      });

      const checkout = await res.json();

      if (res.ok && checkout.url) {
        if (!modalItem) {
          localStorage.removeItem("cart");
        }
        localStorage.removeItem("modalItem");
        window.location.href = checkout.url;
      } else {
        alert("Ошибка создания сессии оплаты.");
        console.error(checkout);
      }

    } catch (err) {
      console.error("Fetch error:", err);
      alert("Failed to calculate shipping.");
    }
  });
});