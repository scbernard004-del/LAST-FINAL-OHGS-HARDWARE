(function () {
  const endpoint = "/api/notify";
  const sentClicks = new Set();

  function textFrom(el) {
    if (!el) return "";
    return (el.getAttribute("data-product") ||
      el.getAttribute("aria-label") ||
      el.getAttribute("title") ||
      el.textContent ||
      "").trim().replace(/\s+/g, " ").slice(0, 220);
  }

  function pageName() {
    return window.location.pathname || "/";
  }

  async function notify(payload) {
    const controller = typeof AbortController === "function" ? new AbortController() : null;
    const timeout = controller ? setTimeout(() => controller.abort(), 2500) : null;
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        signal: controller ? controller.signal : undefined,
        body: JSON.stringify(Object.assign({
          source: "OHGS Website",
          page: pageName()
        }, payload || {}))
      });
    } catch (err) {
      if (!err || err.name !== "AbortError") {
        console.warn("OHGS notification could not be sent.", err);
      }
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  function formToObject(form) {
    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = String(value || "").trim();
    });

    const inputs = form.querySelectorAll("input, textarea, select");
    inputs.forEach((field, index) => {
      const key = field.name || field.id || field.placeholder || `field_${index + 1}`;
      if (!data[key]) data[key] = String(field.value || "").trim();
    });

    const findByWords = (words) => {
      const entries = Object.entries(data);
      const found = entries.find(([k]) => words.some(w => k.toLowerCase().includes(w)));
      return found ? found[1] : "";
    };

    return {
      name: data.name || data.fullname || findByWords(["name", "jina"]),
      phone: data.phone || data.mobile || data.whatsapp || findByWords(["phone", "mobile", "whatsapp", "simu"]),
      email: data.email || findByWords(["email", "barua"]),
      message: data.message || data.details || data.inquiry || findByWords(["message", "details", "inquiry", "maelezo", "ujumbe"]) || JSON.stringify(data),
      product: data.product || data.service || form.getAttribute("data-product") || document.title
    };
  }

  document.addEventListener("submit", async function (event) {
    const form = event.target;
    if (!form || !form.matches("form")) return;

    event.preventDefault();

    const details = formToObject(form);
    await notify({
      eventType: "form_submission",
      action: "Customer submitted website form",
      name: details.name,
      phone: details.phone,
      email: details.email,
      product: details.product,
      message: details.message
    });

    const successText = document.body.classList.contains("sw") || document.documentElement.lang === "sw"
      ? "Asante. Taarifa zako zimetumwa OHGS."
      : "Thank you. Your inquiry has been sent to OHGS.";

    let status = form.querySelector(".ohgs-form-status");
    if (!status) {
      status = document.createElement("p");
      status.className = "ohgs-form-status";
      form.appendChild(status);
    }
    status.textContent = successText;
    form.reset();
  }, true);

  document.addEventListener("click", function (event) {
    const link = event.target.closest("a, button");
    if (!link) return;

    const href = link.getAttribute("href") || "";
    const label = textFrom(link);
    const isWhatsApp = href.includes("wa.me") || href.toLowerCase().includes("whatsapp");
    const isOrder = isWhatsApp || /order|quote|inquiry|buy|whatsapp|agiza|omba|ulizia/i.test(label);

    if (!isOrder) return;

    const key = `${pageName()}|${href}|${label}`;
    if (sentClicks.has(key)) return;
    sentClicks.add(key);
    setTimeout(() => sentClicks.delete(key), 60000);

    notify({
      eventType: "order_click",
      action: isWhatsApp ? "Customer clicked WhatsApp/order button" : "Customer clicked inquiry/order button",
      product: link.getAttribute("data-product") || label || document.title,
      message: `Customer clicked: ${label || href}`
    });
  }, true);
})();
