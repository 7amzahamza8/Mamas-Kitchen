// --- GLOBAL VARIABLES ---
const params = new URLSearchParams(window.location.search);
const cookId = params.get("cook_id");

if (!cookId) {
  alert("Cook ID not found.");
}
const spinner = document.getElementById("loadingSpinner");
spinner.style.display = "flex"; // show before fetches

Promise.all([
  fetch(`http://127.0.0.1:5000/cooks/${cookId}`).then(res => res.json()),
  fetch(`http://127.0.0.1:5000/meals/${cookId}`).then(res => res.json()),
])
.then(([cookData, mealData]) => {
  const cook = cookData.cook;
  document.getElementById("profilePhoto").src = cook.profile_image || "/mamas_kitchen/img/profile.png";
  document.getElementById("cookName").textContent = cook.name;
  document.getElementById("cookEmail").textContent = cook.email;
  document.getElementById("cookLocation").textContent = cook.location;
  document.getElementById("cookPhone").textContent = cook.phone;

  const ratingDisplay = document.getElementById("cookRating");
  ratingDisplay.textContent = cook.average_rating !== null
    ? `⭐ ${cook.average_rating} / 5`
    : "No ratings yet";

  const gallery = document.getElementById("mealGallery");
  gallery.innerHTML = "";
  mealData.meals.forEach(meal => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="data:image/jpeg;base64,${meal.image}" 
           class="loading"
           data-name="${meal.name}"
           data-price="${meal.price}" 
           data-description="${meal.description}"
           alt="${meal.name}">
    `;
    gallery.appendChild(card);
  });

  spinner.style.display = "none"; // hide after all data loads
})
.catch(err => {
  console.error("Error loading profile or meals:", err);
  spinner.style.display = "none";
});


// --- THEME TOGGLE ---
function toggleTheme() {
  const html = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');

  if (html.getAttribute('data-theme') === 'dark') {
    html.removeAttribute('data-theme');
    themeToggle.textContent = '🌙 Dark Mode';
    localStorage.setItem('theme', 'light');
  } else {
    html.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌞 Light Mode';
    localStorage.setItem('theme', 'dark');
  }
}

// --- INITIALIZE ON LOAD ---
document.addEventListener("DOMContentLoaded", () => {
  // Theme init
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.querySelector('.theme-toggle').textContent = '🌞 Light Mode';
  }

  if (!cookId) return;

  // Fetch cook profile
  fetch(`http://127.0.0.1:5000/cooks/${cookId}`)
    .then(res => res.json())
    .then(data => {
      const cook = data.cook;
      
      document.getElementById("profilePhoto").src = cook.profile_image || "/mamas_kitchen/img/profile.png";
      document.getElementById("cookName").textContent = cook.name;
      document.getElementById("cookEmail").textContent = cook.email;
      document.getElementById("cookLocation").textContent = cook.location;
      document.getElementById("cookPhone").textContent = cook.phone;

      const ratingDisplay = document.getElementById("cookRating");
      if (cook.average_rating !== null) {
        ratingDisplay.textContent = `⭐ ${cook.average_rating} / 5`;
      } else {
        ratingDisplay.textContent = "No ratings yet";
      }
    })
    .catch(err => {
      console.error("Error fetching cook profile:", err);
    });

  // Fetch meals
  fetch(`http://127.0.0.1:5000/meals/${cookId}`)
    .then(res => res.json())
    .then(data => {
      const gallery = document.getElementById("mealGallery");
      gallery.innerHTML = "";

      data.meals.forEach(meal => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
          <img src="data:image/jpeg;base64,${meal.image}" 
               class="loading"
               data-name="${meal.name}"
               data-price="${meal.price}" 
               data-description="${meal.description}"
               alt="${meal.name}">
        `;

        const img = card.querySelector('img');
        img.onload = () => {
          img.classList.remove('loading');
          img.style.animation = 'fadeIn 0.6s ease-out';
        };

        gallery.appendChild(card);
      });

      // Meal card click behavior
      let selectedImage = null;
      document.querySelectorAll('.gallery .card img').forEach(img => {
        img.addEventListener('click', () => {
          const mealImage = document.getElementById('displayMealImage');
          const mealPrice = document.getElementById('displayMealPrice');
          const mealDescription = document.getElementById('displayMealDescription');
          const mealName = document.getElementById('displayMealName');

          if (selectedImage === img) {
            mealImage.src = "";
            mealImage.alt = "";
            mealPrice.textContent = "";
            mealDescription.textContent = "";
            if (mealName) mealName.textContent = "";
            selectedImage = null;
          } else {
            mealImage.src = img.src;
            mealImage.alt = img.alt;
            mealPrice.textContent = img.dataset.price;
            mealDescription.textContent = img.dataset.description;
            if (mealName) mealName.textContent = img.alt;
            selectedImage = img;
          }
        });
      });
    })
    .catch(err => {
      console.error("Error fetching meals:", err);
    });

  // Show or hide "Add Meal" button based on session
  let customerId = null;

  fetch('http://127.0.0.1:5000/check_session', {
    credentials: "include"
  })
    .then(res => res.json())
    .then(sessionData => {
      console.log("Session Data:", sessionData);
      console.log("cookId from URL:", cookId)
      const addMealBtn = document.getElementById("addMealBtn");
      if (
        sessionData.logged_in &&
        sessionData.user_type === "cook" &&
        sessionData.user_id == cookId
      ) {
        addMealBtn.style.display = "block";
      } else {
        addMealBtn.style.display = "none";
      }
    

      if (sessionData.logged_in && sessionData.user_type === 'customer') {
        document.getElementById('addMealBtn')?.remove();
        customerId = sessionData.user_id;
      }
    })
    .catch(err => {
      console.error("Error checking session:", err);
    });

  // Header scroll effect
  window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    header.classList.toggle('header-scrolled', window.scrollY > 50);
  });

  // Toggle meal form visibility
  const addMealBtn = document.getElementById("addMealBtn");
  if (addMealBtn) {
    addMealBtn.addEventListener("click", () => {
      document.getElementById("addMealForm").classList.toggle("hidden");
    });
  }


  // Submit new meal
  const mealForm = document.getElementById("mealUploadForm");
  if (mealForm) {
    mealForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const form = e.target;
      const formData = new FormData();

      formData.append("meal_name", form.mealName.value);
      formData.append("meal_price", form.mealPrice.value);
      formData.append("recipe", form.mealDescription.value);
      formData.append("image", form.mealImageUpload.files[0]);
      formData.append("cook_id", cookId);

      try {
        const res = await fetch("http://127.0.0.1:5000/add_meal", {
          method: "POST",
          body: formData
        });

        const result = await res.json();
        if (result.success) {
          alert("Meal added successfully!");
          location.reload();
        } else {
          alert("Error adding meal: " + result.error);
        }
      } catch (err) {
        console.error("Upload failed:", err);
        alert("Failed to upload meal.");
      }
    });
  }

  // Rating submission
  const submitRatingBtn = document.getElementById("submitRatingBtn");
  if (submitRatingBtn) {
    submitRatingBtn.addEventListener("click", async () => {
      try {
        const ratingInput = document.getElementById("ratingInput");
        const ratingValue = parseInt(ratingInput.value, 10);

        const sessionRes = await fetch('http://127.0.0.1:5000/check_session', {
          credentials: 'include'
        });
        const sessionData = await sessionRes.json();

        if (!sessionData.logged_in || sessionData.user_type !== 'customer') {
          alert("You must be logged in as a customer to rate.");
          return;
        }

        const ratingData = {
          customer_id: sessionData.customer_id,
          cook_id: cookId,
          rating_value: ratingValue
        };

        const ratingRes = await fetch("http://127.0.0.1:5000/submit_rating", {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ratingData)
        });

        const result = await ratingRes.json();
        if (!ratingRes.ok) {
          throw new Error(result.message || "Rating submission failed");
        }

        alert("Rating submitted successfully!");
        location.reload();
      } catch (error) {
        console.error("Rating error:", error);
        alert(error.message || "Failed to submit rating. Please try again.");
      }
    });
  }
  
  
});
document.addEventListener("DOMContentLoaded", () => {
  const profilePhoto = document.getElementById("profilePhoto");
  const imageUpload = document.getElementById("imageUpload");

  // When profile image is clicked, open file picker
  profilePhoto.addEventListener("click", () => {
    imageUpload.click();
  });

  // When file is selected, send to backend
  imageUpload.addEventListener("change", async () => {
    if (!imageUpload.files.length) return;

    const formData = new FormData();
    formData.append("image", imageUpload.files[0]);
    formData.append("cook_id", cookId); // you already have this global

    try {
      const res = await fetch("http://127.0.0.1:5000/update_cook_image", {
        method: "POST",
        body: formData,
        credentials:"include"
      });

      const result = await res.json();
      if (res.ok && result.success) {
        alert("Profile image updated!");
        // Bust browser cache
        fetch(`http://127.0.0.1:5000/cooks/${cookId}`)
          .then(res => res.json())
          .then(data => {
            const cook = data.cook;
            document.getElementById("profilePhoto").src = cook.profile_image || "/mamas_kitchen/img/profile.png";
          });
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Profile image upload failed:", err);
      alert("Upload failed. Please try again.");
    }
  });
});
document.addEventListener("DOMContentLoaded", async () => {
  const cookId = window.location.pathname.split("/").pop();
  const gallery = document.getElementById("meal-gallery");

  const [mealRes, sessionRes] = await Promise.all([
    fetch(`http://127.0.0.1:5000/api/cook_meals/${cookId}`),
    fetch("http://127.0.0.1:5000/api/session")
  ]);

  const mealData = await mealRes.json();
  const sessionData = await sessionRes.json();

  if (!mealData || !mealData.meals) {
    gallery.innerHTML = "<p>No meals found.</p>";
    return;
  }

  mealData.meals.forEach(meal => {
    const card = document.createElement("div");
    card.className = "card";

    // Check if logged-in user is the cook owner
    const isOwner = sessionData.logged_in && sessionData.user_type === "cook" && sessionData.user_id == cookId;

    card.innerHTML = `
      <img src="data:image/jpeg;base64,${meal.image}" 
           class="loading"
           data-name="${meal.name}"
           data-price="${meal.price}" 
           data-description="${meal.description}"
           alt="${meal.name}">
      ${isOwner ? `
        <button class="delete-meal-btn" data-meal-id="${meal.id}" style="margin-top: 10px; background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer;">
          🗑️ Delete
        </button>
      ` : ''}
    `;

    // Fade-in effect
    const img = card.querySelector('img');
    img.onload = () => {
      img.classList.remove('loading');
      img.style.animation = 'fadeIn 0.6s ease-out';
    };

    gallery.appendChild(card);
  });

  // Delete button handler
  document.querySelectorAll('.delete-meal-btn').forEach(button => {
    button.addEventListener('click', async (e) => {
      const mealId = e.target.dataset.mealId;

      if (!confirm("Are you sure you want to delete this meal?")) return;

      try {
        const res = await fetch(`http://127.0.0.1:5000/delete_meal/${mealId}`, {
          method: 'DELETE',
          credentials: 'include'
        });

        const result = await res.json();
        if (res.ok && result.success) {
          alert("Meal deleted.");
          location.reload();
        } else {
          throw new Error(result.error || "Failed to delete meal.");
        }
      } catch (err) {
        console.error("Delete error:", err);
        alert("Error deleting meal. Please try again.");
      }
    });
  });
});


