/* PawClinic — Hero Carousel */
(function () {
  'use strict';

  document.querySelectorAll('.hero-carousel').forEach(function (carousel) {
    var track   = carousel.querySelector('.hero-carousel__track');
    var slides  = carousel.querySelectorAll('.hero-carousel__slide');
    var dots    = carousel.querySelectorAll('.hero-carousel__dot');
    var prevBtn = carousel.querySelector('.hero-carousel__prev');
    var nextBtn = carousel.querySelector('.hero-carousel__next');
    var total   = slides.length;
    var current = 0;
    var timer   = null;
    var autoRotate = carousel.dataset.autoRotate !== 'false';
    var interval   = parseInt(carousel.dataset.interval, 10) || 5000;

    if (total < 2) return;

    function goTo(index) {
      slides[current].setAttribute('aria-hidden', 'true');
      dots[current] && dots[current].classList.remove('hero-carousel__dot--active');

      current = (index + total) % total;

      track.style.transform = 'translateX(-' + (current * 100) + '%)';
      slides[current].removeAttribute('aria-hidden');
      dots[current] && dots[current].classList.add('hero-carousel__dot--active');
    }

    function startAuto() {
      if (!autoRotate) return;
      timer = setInterval(function () { goTo(current + 1); }, interval);
    }

    function stopAuto() {
      clearInterval(timer);
    }

    prevBtn && prevBtn.addEventListener('click', function () {
      stopAuto(); goTo(current - 1); startAuto();
    });

    nextBtn && nextBtn.addEventListener('click', function () {
      stopAuto(); goTo(current + 1); startAuto();
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        stopAuto(); goTo(i); startAuto();
      });
    });

    /* Pause on hover */
    carousel.addEventListener('mouseenter', stopAuto);
    carousel.addEventListener('mouseleave', startAuto);

    /* Touch/swipe support */
    var touchStartX = 0;
    carousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) {
        stopAuto();
        goTo(diff > 0 ? current + 1 : current - 1);
        startAuto();
      }
    });

    /* Init */
    goTo(0);
    startAuto();
  });
})();
