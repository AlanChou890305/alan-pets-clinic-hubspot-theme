/* PawClinic — Services Category Filter + Pagination */
(function () {
  'use strict';

  document.querySelectorAll('.services-listing').forEach(function (listing) {
    var filterBar  = listing.querySelector('.services-filter');
    var grid       = listing.querySelector('.services-grid');
    var metaEl     = listing.querySelector('.services-results-meta');
    var pagination = listing.querySelector('.services-pagination');
    var perPage    = parseInt(listing.dataset.perPage, 10) || 4;
    var activeCategory = 'all';
    var currentPage    = 1;

    if (!grid) return;

    var allCards = Array.from(grid.querySelectorAll('.service-card-wrap'));

    function getFiltered() {
      if (activeCategory === 'all') return allCards;
      return allCards.filter(function (card) {
        return card.dataset.category === activeCategory;
      });
    }

    function render() {
      var filtered = getFiltered();
      var totalItems = filtered.length;
      var totalPages = Math.max(1, Math.ceil(totalItems / perPage));
      currentPage = Math.min(currentPage, totalPages);

      var start = (currentPage - 1) * perPage;
      var end   = start + perPage;

      allCards.forEach(function (card) { card.style.display = 'none'; });
      filtered.slice(start, end).forEach(function (card) { card.style.display = ''; });

      /* Meta */
      if (metaEl) {
        var showing = Math.min(perPage, totalItems - start);
        metaEl.textContent = 'Showing ' + showing + ' of ' + totalItems +
          ' services · Page ' + currentPage + ' of ' + totalPages;
      }

      /* Pagination */
      if (pagination) {
        renderPagination(totalPages);
      }
    }

    function renderPagination(totalPages) {
      pagination.innerHTML = '';

      var prevBtn = document.createElement('button');
      prevBtn.className = 'pagination__btn';
      prevBtn.textContent = '←';
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
      nextBtn.disabled = currentPage >= totalPages;
      nextBtn.addEventListener('click', function () {
        if (currentPage < totalPages) { currentPage++; render(); }
      });
      pagination.appendChild(nextBtn);
    }

    /* Filter buttons */
    filterBar && filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.services-filter__btn');
      if (!btn) return;

      filterBar.querySelectorAll('.services-filter__btn').forEach(function (b) {
        b.classList.remove('services-filter__btn--active');
      });
      btn.classList.add('services-filter__btn--active');

      activeCategory = btn.dataset.category || 'all';
      currentPage = 1;
      render();
    });

    /* Init */
    render();
  });
})();
