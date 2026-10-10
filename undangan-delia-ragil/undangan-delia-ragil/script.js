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
      "foto/EDIT-193.jpg","foto/EDIT.jpg","foto/EDIT-91.jpg"
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

// Galeri + tampilan layar penuh
const lb = document.getElementById("lb"), lbImg = document.getElementById("lbImg");
document.getElementById("grid").innerHTML = CONFIG.foto.galeri.map((_, i) =>
  '<button type="button" class="photo tile" data-foto="g' + i + '" aria-label="Foto galeri ' + (i + 1) + '">'
  + '<span class="ph"><svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><rect x="3" y="6" width="18" height="14" rx="2"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/></svg><em>Foto ' + (i + 1) + '</em></span></button>'
).join("");
CONFIG.foto.galeri.forEach((src, i) => {
  const tile = document.querySelector('[data-foto="g' + i + '"]');
  pasangFoto(tile, src);
  tile.addEventListener("click", () => {
    if (!tile.classList.contains("has")) return;
    lbImg.style.backgroundImage = 'url("' + src + '")';
    lb.hidden = false;
  });
});
const tutup = () => { lb.hidden = true; };
lb.addEventListener("click", tutup);
document.addEventListener("keydown", e => { if (e.key === "Escape") tutup(); });

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
