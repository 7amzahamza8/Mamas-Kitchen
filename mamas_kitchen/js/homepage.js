let allCooks = [];  // Global array to store fetched cooks

// Show loading message
document.getElementById('loading-message').style.display = 'block';

fetch("http://127.0.0.1:5000/cooks")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    allCooks = data.cooks;
    renderCooks(allCooks);
  })
  .catch(err => {
    console.error('Error fetching cooks:', err);
    document.getElementById('loading-message').innerHTML = '<p style="color:red;">Error loading cooks. Please try again.</p>';
  })
  .finally(() => {
    // Hide loading
    setTimeout(() => {
      document.getElementById('loading-message').style.display = 'none';
    }, 500);
  });

fetch("http://127.0.0.1:5000/cooks")
  .then(response => response.json())
  .then(data => {
    console.log(data);
    allCooks = data.cooks; // Save all cooks
    renderCooks(allCooks); // Initial render
  })
  .catch(err => {
    console.error('Error fetching cooks:', err);
  });

function renderCooks(cooks) {
  const cardsContainer = document.getElementById('cards');
  cardsContainer.innerHTML = ''; // Clear previous content

  cooks.forEach(cook => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <h3>${cook.name}</h3>
      <p><strong>Gender:</strong> ${cook.gender}</p>
      <p><strong>Location:</strong> ${cook.location}</p>
      <button onclick="location.href='profile.html?cook_id=${cook.id}'">Show Profile</button>
    `;
    cardsContainer.appendChild(card);
  });
}

function filterByLocation() {
  searchByName();
  const selected = document.getElementById('locationFilter').value;
  if (selected === 'all') {
    renderCooks(allCooks);
  } else {
    const filtered = allCooks.filter(cook => cook.location === selected);
    renderCooks(filtered);
  }
}

// Dark mode toggle remains the same...
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

document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme') || 'light';
  const html = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');

  if (savedTheme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌞 Light Mode';
  }
});
document.getElementById('profile-link').addEventListener('click', function () {
  const cookId = sessionStorage.getItem('cook_id');  // or localStorage

  if (cookId) {
    window.location.href = `/profile/${cookId}`;
  } else {
    alert('You need to log in first');
    window.location.href = 'index.html';
  }
});



// Handle profile image upload
document.getElementById('profile-image-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent the form from submitting the traditional way

  const formData = new FormData();
  const imageInput = document.getElementById('profile-image');

  if (imageInput.files.length > 0) {
      formData.append('image', imageInput.files[0]);

      // Sending the image to the server
      fetch('/update_cook_image', {
          method: 'POST',
          body: formData,
          credentials: 'include'  // Make sure the session cookie is sent
      })
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              alert('Profile image updated successfully');
              // Optionally, update the profile image on the page without refreshing
              document.getElementById('profile-image').src = data.profile_image;  // Assuming the server returns the updated image URL
          } else {
              alert('Error updating profile image: ' + data.error);
          }
      })
      .catch(error => {
          alert('An error occurred while uploading the image.');
          console.error('Error:', error);
      });
  } else {
      alert('Please select an image to upload.');
  }
});
fetch('/check_session', {
  method: 'GET',
  credentials: 'include'  // Make sure the session cookie is included in the request
})
.then(res => res.json())
.then(data => {
  if (data.cook_id) {
    console.log('User is logged in:', data);
    // Use data.cook_id to update UI
  } else {
    console.log('User is not logged in');
    // Handle redirect to login
  }
})
.catch(err => {
  console.error('Error checking session:', err);
});
function searchByName() {
  const searchTerm = document.getElementById('nameSearch').value.toLowerCase();
  const selectedLocation = document.getElementById('locationFilter').value;

  let filtered = allCooks;

  // Filter by location if not "all"
  if (selectedLocation !== 'all') {
    filtered = filtered.filter(cook => cook.location === selectedLocation);
  }

  // Then filter by name
  if (searchTerm) {
    filtered = filtered.filter(cook => cook.name.toLowerCase().includes(searchTerm));
  }

  renderCooks(filtered);
}



