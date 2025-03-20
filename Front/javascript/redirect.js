// redirect.js

// Function to redirect to a specified URL
function redirectTo(url) {
  if (!url) {
    console.error("URL is required for redirection.");
    return;
  }
  window.location.href = url;
}

// Example usage
// redirectTo('https://www.example.com');
