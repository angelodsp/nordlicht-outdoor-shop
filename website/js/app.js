// Nordlicht Outdoor · app.js
// Menü auf dem Handy: Die Schaltfläche "Menü" klappt die Navigation auf und zu.
// Ohne JavaScript bleibt die Schaltfläche versteckt und die Navigation offen.

(function () {
  var button = document.querySelector('.menu-btn');
  if (!button) return;

  var nav = document.getElementById(button.getAttribute('aria-controls'));
  if (!nav) return;

  function setOpen(open) {
    button.setAttribute('aria-expanded', open ? 'true' : 'false');
    nav.classList.toggle('ist-zu', !open);
  }

  // Erst jetzt, wo JavaScript läuft: Schaltfläche zeigen und Navigation zuklappen.
  button.hidden = false;
  setOpen(false);

  // Klick, Enter und Leertaste (echter <button>) schalten um.
  button.addEventListener('click', function () {
    setOpen(button.getAttribute('aria-expanded') !== 'true');
  });

  // Nach Klick auf einen Menülink wieder zuklappen.
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setOpen(false);
  });

  // Escape schließt das Menü und setzt den Fokus zurück auf die Schaltfläche.
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      button.focus();
    }
  });
})();
