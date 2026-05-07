/* PawClinic — Doctors Client-side Pagination */
(function () {
  'use strict';

  document.querySelectorAll('.doctors-listing').forEach(function (listing) {
    var grid       = listing.querySelector('.doctors-grid');
    var pagination = listing.querySelector('.doctors-pagination');
    var perPage    = parseInt(listing.dataset.perPage, 10) || 4;

    if (!grid) return;

    var allCards    = Array.from(grid.querySelectorAll('.doctor-card-wrap'));
    var totalItems  = allCards.length;
    var totalPages  = Math.max(1, Math.ceil(totalItems / perPage));
    var currentPage = 1;

    if (totalItems <= perPage) return; /* no pagination needed */

    function render() {
      var start = (currentPage - 1) * perPage;
      var end   = start + perPage;

      allCards.forEach(function (card, i) {
        card.style.display = (i >= start && i < end) ? '' : 'none';
      });

      if (pagination) renderPagination();
    }

    function renderPagination() {
      pagination.innerHTML = '';

      var prevBtn = document.createElement('button');
      prevBtn.className = 'pagination__btn';
      prevBtn.textContent = '←';
      prevBtn.setAttribute('aria-label', 'Previous page');
      prevBtn.disabled = currentPage <= 1;
      prevBtn.addEventListener('click', function () {
        if (currentPage > 1) { currentPage--; render(); }
      });
      pagination.appendChild(prevBtn);

      for (var i = 1; i <= totalPages; i++) {
        (function (pageNum) {
          var btn = document.createElement('button');
          btn.className = 'pagination__btn' + (pageNum === currentPage ? ' pagination__btn--active' : '');
          btn.textContent = pageNum;
          btn.setAttribute('aria-label', 'Page ' + pageNum);
          if (pageNum === currentPage) btn.setAttribute('aria-current', 'page');
          btn.addEventListener('click', function () {
            currentPage = pageNum;
            render();
          });
          pagination.appendChild(btn);
        })(i);
      }

      var nextBtn = document.createElement('button');
      nextBtn.className = 'pagination__btn';
      nextBtn.textContent = '→';
      nextBtn.setAttribute('aria-label', 'Next page');
      nextBtn.disabled = currentPage >= totalPages;
      nextBtn.addEventListener('click', function () {
        if (currentPage < totalPages) { currentPage++; render(); }
      });
      pagination.appendChild(nextBtn);
    }

    render();
  });
})();
