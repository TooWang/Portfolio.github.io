// cover.js - optional interactions for gallery cover section
// Currently a scaffold; add scroll or parallax effects here if needed.

document.addEventListener('DOMContentLoaded', () => {
  const cover = document.querySelector('.gallery-cover');
  if (!cover) return;
  // Example: gentle fade of subtitle on scroll within first 100px (disabled by default)
  // window.addEventListener('scroll', () => {
  //   const y = Math.min(window.scrollY, 100);
  //   const subtitle = cover.querySelector('.gallery-cover-subtitle');
  //   if (subtitle) {
  //     subtitle.style.opacity = String(1 - y / 120);
  //   }
  // }, { passive: true });
});
