const left = document.querySelector('.left');
const right = document.querySelector('.right');
const container = document.querySelector('.container');
const nearFutureBtn = document.querySelector('.split.right .btn');

left.addEventListener('mouseenter', () => container.classList.add('hover-left'));
left.addEventListener('mouseleave', () => container.classList.remove('hover-left'));

right.addEventListener('mouseenter', () => container.classList.add('hover-right'));
right.addEventListener('mouseleave', () => container.classList.remove('hover-right'));

document.getElementById('leftBtn').addEventListener('click', function(event) {
  event.preventDefault(); // Prevent the default anchor action
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.style.display = 'block'; // Show the error message
  setTimeout(() => { // Hide the error message after 2 seconds
    errorMessage.style.display = 'none';
  }, 5000);
});

nearFutureBtn.addEventListener('click', function(event) {
  // No need to prevent default action since it's a regular anchor link
  // Navigate to the main landing page
  window.location.href = nearFutureBtn.href;
});

window.addEventListener("load", function () {
            var loader = document.getElementById("prepreloader");
            loader.style.display = "none";
        });