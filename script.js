// FAQ
const faqItems = document.querySelectorAll("#faq-item");
faqItems.forEach((faqItem) => {
  const faqAnswer = faqItem.querySelector("p");
  faqAnswer.style.marginTop = "15px";

  faqItem.addEventListener("click", function () {
    faqAnswer.style.display =
      faqAnswer.style.display === "none" || faqAnswer.style.display === ""
        ? "block"
        : "none";
  });
});

// бургер
const burger = document.getElementById("burger");
const sideMenu = document.getElementById("sideMenu");

burger.addEventListener("click", (e) => {
  e.stopPropagation();
  sideMenu.classList.toggle("open");
  burger.classList.toggle("open");
  document.body.classList.toggle("no-scroll");
});

document.addEventListener("click", (e) => {
  if (
    !sideMenu.contains(e.target) &&
    !burger.contains(e.target) &&
    sideMenu.classList.contains("open")
  ) {
    sideMenu.classList.remove("open");
    burger.classList.remove("open");
    document.body.classList.remove("no-scroll");
  }
});

// модалка
const productCard = document.querySelectorAll(".product-card");
productCard.forEach((card) => {
  card.addEventListener("click", () => {
    const wrapper = card.querySelector(".product-card__wrapper");
    const productImage = wrapper.querySelector(".product-card__img");
    const productBrand = wrapper.querySelector(".product__brand");
    const productTitle = wrapper.querySelector(".product__model");
    const productDescription = wrapper.querySelector(".product__description");
    const productPrice = wrapper.querySelector(".product__price");
    const modalDiv = document.querySelector(".product-overlay");
    const windoww = modalDiv.querySelector(".product-window");

    windoww.innerHTML = `<span class="close-btn">&times;</span>`;

    document.querySelector(".close-btn").addEventListener("click", () => {
      modalDiv.style.display = "none";
      document.body.style.overflow = "";
    });

    const quantityContainer = document.createElement("div");
    quantityContainer.className = "quantity-selector";
    quantityContainer.innerHTML = `
      <button class="qty-minus">−</button>
      <input type="number" class="qty-input" value="1" min="1" />
      <button class="qty-plus">+</button>`;
    const input = quantityContainer.querySelector(".qty-input");
    const minus = quantityContainer.querySelector(".qty-minus");
    const plus = quantityContainer.querySelector(".qty-plus");

    minus.addEventListener("click", () => {
      if (input.value > 1) input.value--;
    });

    plus.addEventListener("click", () => {
      input.value++;
    });

    const flavors = JSON.parse(wrapper.dataset.flavors);
    const select = document.createElement("select");
    flavors.forEach((flavor) => {
      const option = document.createElement("option");
      option.value = flavor;
      option.textContent = flavor;
      select.appendChild(option);
    });

    const addToCart = document.createElement("button");
    addToCart.textContent = "Add to cart";
    Object.assign(addToCart.style, {
      padding: "15px",
      backgroundColor: "#ffcc00",
      color: "black",
      border: "none",
      borderRadius: "5px",
      fontWeight: "bold",
      fontSize: "17px",
    });

    addToCart.addEventListener("click", () => {
      const product = {
        id: card.dataset.productId || productTitle.textContent.trim(),
        name:
          // productBrand.textContent.trim() +
          // " " +
          productTitle.textContent.trim(),
        flavor: select.value,
        quantity: parseInt(input.value),
        image: productImage.src,
        price:
          parseFloat(productPrice.textContent.replace(/[^0-9.]/g, "")) || 0,
      };

      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      const existing = cart.find(
        (item) => item.id === product.id && item.flavor === product.flavor
      );
      if (existing) {
        existing.quantity += product.quantity;
      } else {
        cart.push(product);
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      addToCart.textContent = "Added!";
      setTimeout(() => {
        addToCart.textContent = "Add to cart";
      }, 1000);
    });

//     const buyNow = document.createElement("button");
//     buyNow.type = "button";
//     buyNow.textContent = "Buy now";
//     Object.assign(buyNow.style, {
//       padding: "15px",
//       backgroundColor: "#000",
//       color: "white",
//       border: "none",
//       borderRadius: "5px",
//       fontWeight: "bold",
//       fontSize: "17px",
//     });
//     const SUPABASE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3hvcHJsamNvb2F4cGtpZ2t2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5OTM0NjMsImV4cCI6MjA2MzU2OTQ2M30._K4PlESPqqo2h2svcTRrU0VMmZXFD_7t40lttCDJq2Y";

// buyNow.addEventListener("click", async () => {
//   const item = {
//     name: productBrand.textContent.trim() + " " + productTitle.textContent.trim(),
//     price: parseFloat(productPrice.textContent.replace(/[^0-9.]/g, "")),
//     quantity: parseInt(input.value)
//   };

//   try {
//     const res = await fetch("https://mtoxoprljcooaxpkigkv.supabase.co/functions/v1/create-checkout-session", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Authorization": `Bearer ${SUPABASE_JWT}`
//       },
//       body: JSON.stringify({ items: [item] })
//     });

//     const data = await res.json();

//     if (res.ok && data.url) {
//       console.log("Redirecting to:", data.url);
//       window.location.href = data.url;
//     } else {
//       alert("Ошибка создания сессии оплаты.");
//       console.error(data);
//     }
//   } catch (err) {
//     alert("Произошла ошибка при оплате.");
//     console.error(err);
//   }
// });
const proceedToShipping = document.createElement("button");
proceedToShipping.type = "button";
proceedToShipping.textContent = "Proceed to Shipping";
Object.assign(proceedToShipping.style, {
  padding: "15px",
  backgroundColor: "#4CAF50",
  color: "white",
  border: "none",
  borderRadius: "5px",
  fontWeight: "bold",
  fontSize: "17px",
  marginTop: "10px",
});

proceedToShipping.addEventListener("click", () => {
  const item = {
    name: productBrand.textContent.trim() + " " + productTitle.textContent.trim(),
    price: parseFloat(productPrice.textContent.replace(/[^0-9.]/g, "")),
    quantity: parseInt(input.value)
  };

  localStorage.setItem("modalItem", JSON.stringify(item));

  window.location.href = "shipping.html";
});

    modalDiv.style.display = "flex";
    document.body.style.overflow = "hidden";

    windoww.appendChild(productImage.cloneNode(true));
    windoww.appendChild(productBrand.cloneNode(true));
    windoww.appendChild(productTitle.cloneNode(true));
    windoww.appendChild(productDescription.cloneNode(true));
    windoww.appendChild(productPrice.cloneNode(true));
    windoww.appendChild(quantityContainer);
    windoww.appendChild(select);
    windoww.appendChild(addToCart);
    windoww.appendChild(proceedToShipping);
    // windoww.appendChild(buyNow);
  });
});

// корзина
function renderCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const container = document.getElementById("cart-items");
  const summary = document.getElementById("cart-total");
  const checkoutBtn = document.getElementById("checkout-btn");
  if (!container) return; // Защита: Если элемента нет, выходим

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = "<p>Your cart is empty.</p>";
    if (checkoutBtn) checkoutBtn.style.display = "none";
    if (summary) summary.style.display = "none";
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.style = `
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 15px;
      border-bottom: 1px solid #ddd;
    `;

    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    div.innerHTML = `
      <img src="${item.image}" alt="${
      item.name
    }" style="object-fit: contain; border-radius: 5px;">
      <div style="flex-grow: 1;">
        <strong>${item.name}</strong><br>
        <p style="margin: 5px 0;">Flavor: ${item.flavor}</p>
        <p style="margin: 5px 0;">Quantity: ${item.quantity}</p>
        <p style="margin: 5px 0;">Price: $${item.price.toFixed(2)}</p>
        <p style="margin: 5px 0;">Total: $${itemTotal.toFixed(2)}</p>
      </div>
      <button type="button" onclick="removeItem(${index})" style="background: red; color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer;">Delete</button>
    `;
    container.appendChild(div);
  });

  summary.innerHTML = `<strong>Total: $${total.toFixed(2)}</strong>`;
  summary.style.display = "block";
  if (checkoutBtn) checkoutBtn.style.display = "inline-block";
}

function removeItem(index) {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];

  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    localStorage.setItem("cart", JSON.stringify(cart));
    renderCart(); // обновляем отрисовку после удаления
  }
}

window.addEventListener("DOMContentLoaded", renderCart);

const checkoutShippingBtn = document.querySelector(".checkout-shipping");
  if (checkoutShippingBtn) {
    checkoutShippingBtn.addEventListener("click", function () {
      window.location.href = "shipping.html";
    });
  }

// кнопка checkout
const checkoutBtn = document.getElementById("checkout-btn");
const SUPABASE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10b3hvcHJsamNvb2F4cGtpZ2t2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Nzk5MzQ2MywiZXhwIjoyMDYzNTY5NDYzfQ.7RZnb21Ed7yASQs9fPl1DtCp9j4UWXzrrt6sgftARbU";



if (checkoutBtn) {
  checkoutBtn.addEventListener("click", async () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    const items = cart.map(item => ({
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    try {
      const res = await fetch("https://mtoxoprljcooaxpkigkv.supabase.co/functions/v1/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_JWT}`
        },
        body: JSON.stringify({ items })
      });

      const data = await res.json();

      if (res.ok && data.url) {
        console.log("Redirecting to:", data.url);
        // Очищаем корзину после перехода на оплату (если нужно) 
        localStorage.removeItem("cart");
        window.location.href = data.url;
      } else {
        alert("Ошибка создания сессии оплаты.");
        console.error(data);
      }
    } catch (err) {
      alert("Произошла ошибка при оплате.");
      console.error(err);
    }
  });
}
