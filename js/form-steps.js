/* PawClinic — Multi-step Booking Form */
(function () {
  'use strict';

  document.querySelectorAll('.booking-form-wrap').forEach(function (wrap) {
    var panels   = wrap.querySelectorAll('.booking-form__panel');
    var stepNums = wrap.querySelectorAll('.booking-form__step-num');
    var stepLabels = wrap.querySelectorAll('.booking-form__step');
    var stepLines  = wrap.querySelectorAll('.booking-form__step-line');
    var totalSteps = panels.length;
    var current    = 0;

    function showStep(index) {
      panels.forEach(function (p, i) {
        p.classList.toggle('booking-form__panel--active', i === index);
      });

      stepNums.forEach(function (num, i) {
        var step = num.closest('.booking-form__step');
        step.classList.toggle('booking-form__step--active', i === index);
        step.classList.toggle('booking-form__step--done', i < index);
      });

      stepLines.forEach(function (line, i) {
        line.classList.toggle('booking-form__step-line--done', i < index);
      });

      current = index;

      /* Populate summary on step 3 */
      if (index === totalSteps - 1) {
        populateSummary(wrap);
      }
    }

    function validateStep(index) {
      var panel = panels[index];
      var required = panel.querySelectorAll('[required]');
      var valid = true;

      required.forEach(function (field) {
        field.classList.remove('booking-form__field--error');
        if (!field.value.trim()) {
          field.classList.add('booking-form__field--error');
          field.style.borderColor = '#EF4444';
          valid = false;
        } else {
          field.style.borderColor = '';
        }
      });

      return valid;
    }

    function populateSummary(wrap) {
      var allInputs = wrap.querySelectorAll('input, select, textarea');
      var summaryEl = wrap.querySelector('.booking-confirm__summary');
      if (!summaryEl) return;

      var rows = '';
      allInputs.forEach(function (input) {
        if (!input.name || input.type === 'hidden' || !input.value.trim()) return;
        var label = wrap.querySelector('label[for="' + input.id + '"]');
        var labelText = label ? label.textContent.replace('*', '').trim() : input.name;
        var val = input.tagName === 'SELECT'
          ? input.options[input.selectedIndex].text
          : input.value;
        rows += '<div class="booking-confirm__row">' +
          '<span class="booking-confirm__key">' + labelText + '</span>' +
          '<span class="booking-confirm__val">' + val + '</span>' +
          '</div>';
      });

      summaryEl.innerHTML = rows || '<p style="font-size:.875rem;color:#6B7280">No information entered yet.</p>';
    }

    /* Wire up Next / Prev buttons */
    wrap.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-form-next]');
      if (btn) {
        if (validateStep(current)) {
          showStep(Math.min(current + 1, totalSteps - 1));
        }
        return;
      }

      var prevBtn = e.target.closest('[data-form-prev]');
      if (prevBtn) {
        showStep(Math.max(current - 1, 0));
      }
    });

    /* Init */
    showStep(0);
  });
})();
