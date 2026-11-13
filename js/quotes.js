/* rotating quote card in the page header. Set window.PQ_QUOTES = [[text, author], ...] before loading. */
(function () {
  var Q = window.PQ_QUOTES || [];
  if (!Q.length) return;
  document.addEventListener("DOMContentLoaded", function () {
    var host = document.querySelector(".dv-head .dv-wrap"); if (!host) return;
    var box = document.createElement("figure"); box.className = "pq";
    box.innerHTML = '<i class="fa-solid fa-quote-left" aria-hidden="true"></i><blockquote id="pq-t"></blockquote><figcaption id="pq-a"></figcaption><div class="pq-dots" id="pq-d"></div>';
    host.appendChild(box);
    var t = box.querySelector("#pq-t"), a = box.querySelector("#pq-a"), d = box.querySelector("#pq-d"), n = 0, timer;
    d.innerHTML = Q.map(function (_, i) { return '<button type="button" aria-label="Quote ' + (i + 1) + '" data-i="' + i + '"></button>'; }).join("");
    function show(i) {
      n = i; box.classList.remove("in");
      setTimeout(function () {
        t.textContent = Q[i][0]; a.textContent = "— " + Q[i][1];
        [].forEach.call(d.children, function (b, k) { b.classList.toggle("on", k === i); });
        box.classList.add("in");
      }, 350);
    }
    function loop() { clearInterval(timer); timer = setInterval(function () { show((n + 1) % Q.length); }, 5000); }
    d.addEventListener("click", function (e) { var b = e.target.closest("button"); if (b) { show(+b.dataset.i); loop(); } });
    t.textContent = Q[0][0]; a.textContent = "— " + Q[0][1]; d.children[0].classList.add("on"); setTimeout(function () { box.classList.add("in"); }, 400); loop();
  });
})();
