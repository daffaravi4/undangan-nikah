/* =========================================================
   PENGATURAN UNDANGAN - ubah bagian ini saja
   Tanggal, nama hari, hitung mundur, dan tombol kalender
   akan ikut berubah otomatis.
   ========================================================= */
const CONFIG = {
  tanggal: "2026-10-16",          // format TAHUN-BULAN-TANGGAL

  acara: [
    {
      nama: "Akad Nikah",
      mulai: "08:00", selesai: "10:00",   // jam WIB
      tempat: "Kediaman Mempelai Wanita",
      alamat: "Desa kedunganyar rt 03 rw 01 kec.wringinanom kab.gresik",
      peta: ""                            // kosongkan = cari otomatis dari tempat + alamat
    },
    {
      nama: "Resepsi",
      mulai: "11:00", selesai: "14:00",
      tempat: "Kediaman Mempelai Wanita",
      alamat: "Desa kedunganyar rt 03 rw 01 kec.wringinanom kab.gresik",
      peta: ""
    }
  ],

  // Taruh foto di folder "foto" lalu sesuaikan nama file di sini.
  // Kalau file belum ada, tampil kotak placeholder.
  foto: {
    hero:   "foto/hero.jpg",
    wanita: "foto/MEMPELAI WANITA.jpg",
    pria:   "foto/MEMPELAI PRIA.jpg",
    galeri: [
      "foto/EDIT-98.jpg", "foto/EDIT-107.jpg", "foto/EDIT-132.jpg",
      "foto/EDIT-133.jpg", "foto/EDIT-153.jpg", "foto/EDIT-168.jpg",
      "foto/EDIT-193.jpg","foto/EDIT.jpg",
    ]
  },

  namaMempelai: "Delia dan Ragil"
};

/* =========================================================
   Di bawah ini tidak perlu diubah
   ========================================================= */
const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Tanggal & nama hari otomatis
const [Y, M, D] = CONFIG.tanggal.split("-").map(Number);
const namaHari = HARI[new Date(Date.UTC(Y, M - 1, D)).getUTCDay()];
const tanggalPanjang = namaHari + ", " + D + " " + BULAN[M - 1] + " " + Y;
document.querySelectorAll('[data-bind="dateLong"]').forEach(el => { el.textContent = tanggalPanjang; });

const jam = t => t.replace(":", ".");
const waktu = t => new Date(CONFIG.tanggal + "T" + t + ":00+07:00");

// Nama tamu dari tautan, contoh: ...?to=Budi%20Santoso
try {
  const to = new URLSearchParams(location.search).get("to");
  if (to && to.trim()) document.getElementById("guestName").textContent = to.trim().slice(0, 60);
} catch (e) {}

// Buka undangan
const cover = document.getElementById("cover");
document.getElementById("openBtn").addEventListener("click", () => {
  cover.classList.add("open");
  document.body.classList.remove("locked");
  window.scrollTo(0, 0);
  setTimeout(() => { cover.style.display = "none"; }, 1400);
});

// Kartu acara
document.getElementById("events").innerHTML = CONFIG.acara.map(a =>
  '<article class="event">'
  + '<h3>' + esc(a.nama) + '</h3>'
  + '<p class="time">' + jam(a.mulai) + ' – ' + jam(a.selesai) + ' WIB</p>'
  + (a.tempat ? '<p class="venue">' + esc(a.tempat) + '</p>' : '')
  + (a.alamat ? '<p class="addr">' + esc(a.alamat) + '</p>' : '')
  + '</article>'
).join("");

// Hitung mundur (menuju jam mulai acara pertama)
const pad = n => String(n).padStart(2, "0");
const target = waktu(CONFIG.acara[0].mulai).getTime();
const countBox = document.getElementById("count");
function tick() {
  const diff = target - Date.now();
  if (diff <= 0) {
    countBox.innerHTML = '<p class="count-done">Hari bahagia telah tiba</p>';
    return clearInterval(timer);
  }
  const s = Math.floor(diff / 1000);
  document.getElementById("cd").textContent = pad(Math.floor(s / 86400));
  document.getElementById("ch").textContent = pad(Math.floor(s % 86400 / 3600));
  document.getElementById("cm").textContent = pad(Math.floor(s % 3600 / 60));
  document.getElementById("cs").textContent = pad(s % 60);
}
const timer = setInterval(tick, 1000);
tick();

// Slot foto: tampil hanya jika file-nya ada
function pasangFoto(el, src) {
  if (!el || !src) return;
  const img = new Image();
  img.onload = () => { el.style.setProperty("--img", 'url("' + src + '")'); el.classList.add("has"); };
  img.src = src;
}
pasangFoto(document.querySelector('[data-foto="hero"]'), CONFIG.foto.hero);
pasangFoto(document.querySelector('[data-foto="wanita"]'), CONFIG.foto.wanita);
pasangFoto(document.querySelector('[data-foto="pria"]'), CONFIG.foto.pria);

// Galeri: kotak preview kecil (1 slot = 1 foto). Klik foto -> tampil besar dan bisa di-scroll ke bawah
const lb = document.getElementById("lb"), lbFeed = document.getElementById("lbImg");
const galeriBox = document.getElementById("grid");
const lbClose = lb.querySelector(".lb-close");
const lbCount = document.createElement("div");
galeriBox.className = "galeri-grid";
lbFeed.className = "lb-feed";
lbCount.className = "lb-count";
lb.appendChild(lbCount);

Promise.all(CONFIG.foto.galeri.map(src => new Promise(res => {
  const im = new Image();
  im.onload = () => res({ src, w: im.naturalWidth, h: im.naturalHeight });
  im.onerror = () => res(null);
  im.src = src;
}))).then(hasil => {
  const ada = hasil.filter(Boolean);
  if (!ada.length) {
    galeriBox.innerHTML = '<p class="galeri-kosong">Foto galeri akan segera hadir.</p>';
    return;
  }
  galeriBox.innerHTML = ada.map((f, i) =>
    '<button type="button" class="thumb" data-i="' + i + '" aria-label="Buka foto ' + (i + 1) + '">'
    + '<img src="' + esc(f.src) + '" alt="" loading="lazy" decoding="async"></button>'
  ).join("");
  lbFeed.innerHTML = ada.map((f, i) =>
    '<img src="' + esc(f.src) + '" alt="Foto galeri ' + (i + 1) + '" width="' + f.w + '" height="' + f.h + '" decoding="async">'
  ).join("");
  const imgs = [...lbFeed.children];
  let terakhir = null;

  const updateCount = () => {
    const batas = lb.scrollTop + 80;
    let idx = imgs.findIndex(im => im.offsetTop + im.offsetHeight > batas);
    if (idx < 0 || lb.scrollTop + lb.clientHeight >= lb.scrollHeight - 2) idx = imgs.length - 1;
    lbCount.textContent = (idx + 1) + " / " + imgs.length;
  };
  const buka = i => {
    terakhir = galeriBox.children[i];
    lb.hidden = false;
    document.body.classList.add("viewing");
    lb.scrollTop = Math.max(0, imgs[i].offsetTop - 64);
    updateCount();
    lbClose.focus();
  };
  const tutup = () => {
    if (lb.hidden) return;
    lb.hidden = true;
    document.body.classList.remove("viewing");
    if (terakhir) terakhir.focus();
  };
  galeriBox.querySelectorAll(".thumb").forEach(b => b.addEventListener("click", () => buka(Number(b.dataset.i))));
  lb.addEventListener("scroll", updateCount, { passive: true });
  lbClose.addEventListener("click", tutup);
  document.addEventListener("keydown", e => { if (e.key === "Escape") tutup(); });
});

// Penanda menu aktif
const links = [...document.querySelectorAll(".nav a")];
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  links.forEach(a => { const s = document.querySelector(a.getAttribute("href")); if (s) io.observe(s); });
}
