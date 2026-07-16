/* FAQ Accordion — expand/collapse question panels.
   Reads data-allow-multiple on each .faq__list to decide whether opening
   one item closes the others. */
(function () {
  function initList(list) {
    var allowMultiple = list.getAttribute('data-allow-multiple') === 'true';
    var items = list.querySelectorAll('.faq-item');

    items.forEach(function (item) {
      var btn = item.querySelector('.faq-item__question');
      var answer = item.querySelector('.faq-item__answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', function () {
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        if (!allowMultiple) {
          items.forEach(function (other) {
            if (other === item) return;
            var ob = other.querySelector('.faq-item__question');
            var oa = other.querySelector('.faq-item__answer');
            if (ob && oa) {
              ob.setAttribute('aria-expanded', 'false');
              oa.hidden = true;
              other.classList.remove('is-open');
            }
          });
        }

        btn.setAttribute('aria-expanded', String(!isOpen));
        answer.hidden = isOpen;
        item.classList.toggle('is-open', !isOpen);
      });
    });
  }

  function init() {
    document.querySelectorAll('.faq__list').forEach(initList);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
