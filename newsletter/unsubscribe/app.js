(function () {
  var form = document.getElementById('unsub-form');
  if (!form) return;
  var btn = document.getElementById('unsub-btn');
  var err = document.getElementById('unsub-err');
  var wrap = document.getElementById('form-wrap');
  var ok = document.getElementById('unsub-ok');
  // Relay holds the MailerLite token off the static site. Set after forms proxy ships.
  var RELAY = 'https://forms.jerrywlambert.com/newsletter/unsubscribe';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    err.style.display = 'none';
    var email = document.getElementById('email').value.trim();
    var reasonEl = form.querySelector('input[name="reason"]:checked');
    if (!email || !reasonEl) {
      err.textContent = 'Email and a reason are required.';
      err.style.display = 'block';
      return;
    }
    var payload = {
      email: email,
      status: 'unsubscribed',
      fields: { 'Unsubscribe reason': reasonEl.value }
    };
    btn.disabled = true;
    btn.textContent = 'Working…';

    fetch(RELAY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error('relay ' + res.status);
      wrap.style.display = 'none';
      ok.style.display = 'block';
    }).catch(function () {
      err.textContent = 'Automatic unsubscribe is not connected yet. Email me@jerrywlambert.com with subject Unsubscribe and your reason, or try again later.';
      err.style.display = 'block';
      btn.disabled = false;
      btn.textContent = 'Unsubscribe';
    });
  });
})();
