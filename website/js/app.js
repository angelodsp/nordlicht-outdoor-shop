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


// ---------------------------------------------------------------------------
// Warenkorb
// Liegt im localStorage des Browsers, nur Artikel: id, name, preisCent, menge.
// Keine persönlichen Daten. Gespeichert wird erst beim ersten Hineinlegen,
// ein leerer Warenkorb wird ganz gelöscht. Gerechnet wird in ganzen Cent.
// ---------------------------------------------------------------------------
(function () {
  var SCHLUESSEL = 'nordlicht-warenkorb';
  var MAX_MENGE = 99;
  var euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });

  // Aktueller Inhalt im Arbeitsspeicher. Falls der Browser nicht speichern darf,
  // hält der Warenkorb wenigstens bis zum Seitenwechsel.
  var artikel = lesen();
  var speicherGeht = true;

  // ---- Hilfsfunktionen ----------------------------------------------------

  // 1999 -> "19,99 €"
  function formatEuro(cent) {
    return euro.format(cent / 100);
  }

  // "89.90" -> 8990. Text wird in Euro und Cent zerlegt, ohne Kommazahl-Rechnung.
  function preisInCent(text) {
    var treffer = /^(\d+)(?:\.(\d{1,2}))?$/.exec(String(text).trim());
    if (!treffer) return null;
    var cent = treffer[2] ? (treffer[2] + '0').slice(0, 2) : '00';
    return parseInt(treffer[1], 10) * 100 + parseInt(cent, 10);
  }

  // Prüft einen Eintrag aus dem Speicher. Dort kann jeder im Browser etwas ändern.
  function istGueltig(a) {
    return a && typeof a.id === 'string' && a.id !== '' &&
      typeof a.name === 'string' && a.name !== '' &&
      Number.isInteger(a.preisCent) && a.preisCent >= 0 &&
      Number.isInteger(a.menge) && a.menge >= 1 && a.menge <= MAX_MENGE;
  }

  // ---- Speicher -----------------------------------------------------------

  function lesen() {
    try {
      var roh = window.localStorage.getItem(SCHLUESSEL);
      if (!roh) return [];
      var daten = JSON.parse(roh);
      if (!Array.isArray(daten)) return [];
      return daten.filter(istGueltig).map(function (a) {
        return { id: a.id, name: a.name, preisCent: a.preisCent, menge: a.menge };
      });
    } catch (e) {
      return [];
    }
  }

  // Schreibt den Warenkorb. Ist er leer, wird der Schlüssel gelöscht.
  function speichern() {
    try {
      if (artikel.length === 0) {
        window.localStorage.removeItem(SCHLUESSEL);
      } else {
        window.localStorage.setItem(SCHLUESSEL, JSON.stringify(artikel));
      }
      speicherGeht = true;
    } catch (e) {
      speicherGeht = false;
    }
  }

  // ---- Ändern -------------------------------------------------------------

  function finden(id) {
    for (var i = 0; i < artikel.length; i++) {
      if (artikel[i].id === id) return artikel[i];
    }
    return null;
  }

  function hinzufuegen(id, name, preisCent) {
    var vorhanden = finden(id);
    if (vorhanden) {
      vorhanden.menge = Math.min(vorhanden.menge + 1, MAX_MENGE);
      vorhanden.name = name;
      vorhanden.preisCent = preisCent;
    } else {
      artikel.push({ id: id, name: name, preisCent: preisCent, menge: 1 });
    }
    speichern();
  }

  function mengeAendern(id, plusMinus) {
    var a = finden(id);
    if (!a) return;
    a.menge = Math.max(1, Math.min(a.menge + plusMinus, MAX_MENGE));
    speichern();
  }

  function entfernen(id) {
    artikel = artikel.filter(function (a) { return a.id !== id; });
    speichern();
  }

  function leeren() {
    artikel = [];
    speichern();
  }

  function anzahl() {
    return artikel.reduce(function (summe, a) { return summe + a.menge; }, 0);
  }

  function gesamtCent() {
    return artikel.reduce(function (summe, a) { return summe + a.preisCent * a.menge; }, 0);
  }

  // ---- Anzeige: Zähler im Kopf und Meldung --------------------------------

  function zaehlerAktualisieren() {
    var n = anzahl();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = String(n);
      var link = el.closest('a');
      if (link) link.setAttribute('aria-label', 'Warenkorb, ' + n + ' Artikel');
    });
  }

  // Eine gemeinsame Meldung pro Seite. role="status" sorgt dafür,
  // dass Screenreader den Text vorlesen, ohne den Fokus zu verschieben.
  var meldung = document.createElement('div');
  meldung.className = 'meldung';
  meldung.setAttribute('role', 'status');
  meldung.setAttribute('aria-live', 'polite');
  document.body.appendChild(meldung);
  var meldungTimer;

  function melden(text) {
    if (!speicherGeht) {
      text += ' Dein Browser speichert den Warenkorb gerade nicht, er bleibt nur bis zum Seitenwechsel erhalten.';
    }
    clearTimeout(meldungTimer);
    meldung.textContent = '';
    meldung.classList.remove('sichtbar');
    // Kurz warten, damit Screenreader auch eine gleiche Meldung erneut vorlesen.
    setTimeout(function () {
      meldung.textContent = text;
      meldung.classList.add('sichtbar');
      meldungTimer = setTimeout(function () {
        meldung.classList.remove('sichtbar');
      }, 4000);
    }, 50);
  }

  // ---- In den Warenkorb (Start- und Produktseiten) ------------------------

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-add-to-cart]');
    if (!button) return;
    var produkt = button.closest('[data-product]');
    if (!produkt) return;

    var id = produkt.dataset.id;
    var name = produkt.dataset.name;
    var preisCent = preisInCent(produkt.dataset.price);
    if (!id || !name || preisCent === null) return;

    hinzufuegen(id, name, preisCent);
    zaehlerAktualisieren();
    melden(name + ' liegt jetzt in deinem Warenkorb.');
  });

  // Ist der Shop in einem zweiten Tab offen, dort den Zähler mitziehen.
  window.addEventListener('storage', function (event) {
    if (event.key !== SCHLUESSEL && event.key !== null) return;
    artikel = lesen();
    zaehlerAktualisieren();
    if (seite) seiteZeichnen();
  });

  // ---- Warenkorb-Seite ----------------------------------------------------

  var seite = document.querySelector('[data-cart-page]');

  function element(tag, klasse, text) {
    var el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (text !== undefined) el.textContent = text;
    return el;
  }

  function knopf(klasse, aktion, text, label) {
    var b = element('button', klasse, text);
    b.type = 'button';
    b.dataset.action = aktion;
    if (label) b.setAttribute('aria-label', label);
    return b;
  }

  // Baut die Liste neu auf. Texte nur über textContent, nie als HTML.
  function seiteZeichnen() {
    var liste = seite.querySelector('[data-cart-list]');
    var gefuellt = seite.querySelector('[data-cart-filled]');
    var leer = seite.querySelector('[data-cart-empty]');
    var fertig = seite.querySelector('[data-cart-done]');

    liste.textContent = '';
    artikel.forEach(function (a) {
      var zeile = element('li', 'wk-zeile');
      zeile.dataset.id = a.id;

      var info = element('div', 'wk-info');
      info.appendChild(element('span', 'wk-name', a.name));
      info.appendChild(element('span', 'wk-einzel', 'je ' + formatEuro(a.preisCent)));

      var menge = element('div', 'wk-menge');
      menge.setAttribute('role', 'group');
      menge.setAttribute('aria-label', 'Menge von ' + a.name);
      var minus = knopf('wk-pm', 'minus', '−', 'Menge von ' + a.name + ' verringern');
      minus.disabled = a.menge <= 1;
      var plus = knopf('wk-pm', 'plus', '+', 'Menge von ' + a.name + ' erhöhen');
      plus.disabled = a.menge >= MAX_MENGE;
      menge.appendChild(minus);
      menge.appendChild(element('span', 'wk-anzahl', String(a.menge)));
      menge.appendChild(plus);

      var summe = element('span', 'wk-summe', formatEuro(a.preisCent * a.menge));
      var weg = knopf('wk-entfernen', 'entfernen', 'Entfernen', a.name + ' entfernen');

      zeile.appendChild(info);
      zeile.appendChild(menge);
      zeile.appendChild(summe);
      zeile.appendChild(weg);
      liste.appendChild(zeile);
    });

    seite.querySelector('[data-cart-total]').textContent = formatEuro(gesamtCent());

    var hatArtikel = artikel.length > 0;
    gefuellt.hidden = !hatArtikel;
    leer.hidden = hatArtikel || !fertig.hidden;
  }

  // Nach dem Neuzeichnen den Fokus dorthin zurücksetzen, wo er war.
  function fokusZurueck(id, aktion) {
    var ziel = seite.querySelector('.wk-zeile[data-id="' + CSS.escape(id) + '"] [data-action="' + aktion + '"]');
    if (ziel && ziel.disabled) {
      ziel = ziel.parentNode.querySelector('[data-action]:not([disabled])');
    }
    if (!ziel) {
      ziel = seite.querySelector('.wk-zeile [data-action="entfernen"]') || seite.querySelector('#wk-titel');
    }
    ziel.focus();
  }

  if (seite) {
    var hinweis = seite.querySelector('[data-cart-nojs]');
    if (hinweis) hinweis.hidden = true;
    seiteZeichnen();

    seite.querySelector('[data-cart-list]').addEventListener('click', function (event) {
      var b = event.target.closest('[data-action]');
      if (!b) return;
      var id = b.closest('.wk-zeile').dataset.id;
      var a = finden(id);
      if (!a) return;
      var aktion = b.dataset.action;

      if (aktion === 'plus') mengeAendern(id, 1);
      if (aktion === 'minus') mengeAendern(id, -1);
      if (aktion === 'entfernen') entfernen(id);

      seiteZeichnen();
      zaehlerAktualisieren();
      fokusZurueck(id, aktion);

      if (aktion === 'entfernen') {
        melden(a.name + ' entfernt.' + (artikel.length === 0 ? ' Dein Warenkorb ist jetzt leer.' : ''));
      } else {
        melden('Menge von ' + a.name + ': ' + a.menge + '. Summe: ' + formatEuro(gesamtCent()) + '.');
      }
    });

    // Demo-Bestellung: sendet nichts, leert nur den Warenkorb.
    seite.querySelector('[data-cart-order]').addEventListener('click', function () {
      leeren();
      var fertig = seite.querySelector('[data-cart-done]');
      fertig.hidden = false;
      seiteZeichnen();
      zaehlerAktualisieren();
      fertig.focus();
    });
  }

  zaehlerAktualisieren();
})();
