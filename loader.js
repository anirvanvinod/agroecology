window.onload = function() {
      // Find the loader-wrapper element and fade it out slowly
      var loaderWrapper = document.querySelector(".loader-wrapper");
      loaderWrapper.style.transition = "opacity 0.5s"; // Optional: Add a transition effect
      loaderWrapper.style.opacity = 0; // Set opacity to 0 to fade out
    };