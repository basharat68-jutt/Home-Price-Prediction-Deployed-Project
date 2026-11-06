// Keep this URL pointed at your running FastAPI backend.
const API_URL = "http://127.0.0.1:8000/predict";

const form = document.getElementById("predictionForm");
const submitBtn = document.getElementById("submitBtn");
const loading = document.getElementById("loading");
const result = document.getElementById("result");
const errorBox = document.getElementById("errorBox");
const priceValue = document.getElementById("priceValue");
const resetBtn = document.getElementById("resetBtn");

function showError(message) {
  errorBox.textContent = message;
  errorBox.classList.remove("hidden");
}

function hideMessages() {
  errorBox.classList.add("hidden");
  result.classList.add("hidden");
  loading.classList.add("hidden");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessages();

  const formData = new FormData(form);
  const data = {
    bedrooms: Number(formData.get("bedrooms")),
    bathrooms: Number(formData.get("bathrooms")),
    sqft_living: Number(formData.get("sqft_living")),
    sqft_lot: Number(formData.get("sqft_lot")),
    floors: Number(formData.get("floors")),
    waterfront: Number(formData.get("waterfront")),
    view: Number(formData.get("view")),
    condition: Number(formData.get("condition")),
    sqft_above: Number(formData.get("sqft_above")),
    sqft_basement: Number(formData.get("sqft_basement")),
    yr_built: Number(formData.get("yr_built")),
    yr_renovated: Number(formData.get("yr_renovated")),
    city: formData.get("city"),
    statezip: formData.get("statezip").trim()
  };

  const numericValues = Object.entries(data).filter(([key, value]) =>
    typeof value === "number" && !Number.isFinite(value)
  );
  if (numericValues.length) {
    showError("Please enter valid numbers in all property fields.");
    return;
  }

  if (data.condition < 1 || data.condition > 5) {
    showError("House condition must be between 1 and 5.");
    return;
  }
  if (![0, 1].includes(data.waterfront) || ![0, 1].includes(data.view)) {
    showError("Waterfront and view must be selected as Yes or No.");
    return;
  }

  loading.classList.remove("hidden");
  submitBtn.disabled = true;

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const detail = responseData.detail;
      const message = Array.isArray(detail)
        ? detail.map(item => item.msg || "Invalid input").join(", ")
        : (detail || `Server returned status ${response.status}.`);
      throw new Error(message);
    }

    if (typeof responseData.price !== "number" || !Number.isFinite(responseData.price)) {
      throw new Error("The API response did not contain a valid 'price' value.");
    }

    priceValue.textContent = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(responseData.price);

    loading.classList.add("hidden");
    result.classList.remove("hidden");
    result.scrollIntoView({ behavior: "smooth", block: "center" });
  } catch (error) {
    loading.classList.add("hidden");
    if (error instanceof TypeError) {
      showError("Could not connect to the FastAPI backend. Make sure it is running at http://127.0.0.1:8000 and check your CORS settings.");
    } else {
      showError(error.message || "Something went wrong while getting the estimate.");
    }
  } finally {
    submitBtn.disabled = false;
  }
});

resetBtn.addEventListener("click", () => {
  hideMessages();
  form.scrollIntoView({ behavior: "smooth", block: "start" });
});
