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

    function val(id) {
      var el = wrap.querySelector('#' + id);
      return el ? el.value.trim() : '';
    }

    function showSuccess() {
      var success = wrap.querySelector('#booking-success');
      var panel = success ? success.closest('.booking-form__panel') : null;
      if (success) success.style.display = 'block';
      if (panel) {
        var nav = panel.querySelector('.booking-form__nav');
        if (nav) nav.style.display = 'none';
        var summary = panel.querySelector('.booking-confirm__summary');
        if (summary) summary.style.display = 'none';
      }
    }

    function showError(msg) {
      var box = wrap.querySelector('.booking-form__error');
      if (box) {
        box.textContent = msg;
        box.style.display = 'block';
      }
    }

    /* Submit to the HubSpot Forms Submissions API v3 (when a form GUID is set). */
    function submitBooking(submitBtn) {
      var portalId = wrap.getAttribute('data-portal-id');
      var formGuid = wrap.getAttribute('data-form-guid');
      var region = wrap.getAttribute('data-region') || 'na1';

      /* Demo mode: no form configured → just show success. */
      if (!formGuid) {
        showSuccess();
        return;
      }

      var name = val('bf_name');
      var firstName = name.split(' ')[0] || '';
      var lastName = name.split(' ').slice(1).join(' ') || '';

      var detailLines = [
        'Pet type: ' + val('bf_pet_type'),
        "Pet's name: " + val('bf_pet_name'),
        'Service: ' + val('bf_service'),
        'Preferred doctor: ' + val('bf_doctor'),
        'Preferred date: ' + val('bf_date'),
        'Preferred time: ' + val('bf_time'),
        'Notes: ' + val('bf_notes')
      ];

      var fields = [
        { name: 'firstname', value: firstName },
        { name: 'lastname', value: lastName },
        { name: 'email', value: val('bf_email') },
        { name: 'phone', value: val('bf_phone') },
        { name: 'message', value: detailLines.join('\n') }
      ].filter(function (f) { return f.value; });

      var endpoint = 'https://api.hsforms.com/submissions/v3/integration/submit/' +
        portalId + '/' + formGuid;

      var payload = {
        fields: fields,
        context: {
          pageUri: window.location.href,
          pageName: document.title
        }
      };

      if (submitBtn) { submitBtn.disabled = true; }

      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (res) {
        if (res.ok) {
          showSuccess();
        } else {
          return res.json().then(function (data) {
            var msg = (data && data.message) ? data.message : 'Submission failed. Please try again or call us.';
            showError(msg);
            if (submitBtn) { submitBtn.disabled = false; }
          });
        }
      }).catch(function () {
        showError('Network error. Please try again or call us.');
        if (submitBtn) { submitBtn.disabled = false; }
      });
    }

    /* Wire up Next / Prev / Submit buttons */
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
        return;
      }

      var submitBtn = e.target.closest('[data-form-submit]');
      if (submitBtn) {
        submitBooking(submitBtn);
      }
    });

    /* Init */
    showStep(0);
  });
})();
