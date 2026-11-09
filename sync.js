// ===== SINKRONISASI ANTAR PERANGKAT (Firebase Realtime Database) =====
// 1) Buat project di console.firebase.google.com -> Build -> Realtime Database -> Create.
// 2) Salin alamat databasenya ke FIREBASE_URL di bawah (tanpa garis miring di akhir).
// 3) Di tab Rules, tempel aturan yang ada di panduan, lalu Publish.
const FIREBASE_URL = ""; // contoh: "https://mahrev-default-rtdb.asia-southeast1.firebasedatabase.app"
const SYNC_PATH = "/warung-mahrev.json";

let syncOn = false, syncT = null, syncBusy = false;
window.syncTxt = () => !FIREBASE_URL ? "Hanya di perangkat ini" : syncOn ? "☁ Tersinkron" : "Offline";
function syncBadge() { const e = document.getElementById("sync"); if (e) e.textContent = " · " + window.syncTxt(); }
const syncSnap = () => ({ products: DB.products, sales: DB.sales, nid: DB.nid, pid: DB.pid, rev: DB.rev || 0 });

// Dipanggil otomatis setiap data disimpan.
window.cloudPush = () => {
  if (!FIREBASE_URL) return;
  clearTimeout(syncT);
  syncT = setTimeout(async () => {
    try { const r = await fetch(FIREBASE_URL + SYNC_PATH, { method: "PUT", body: JSON.stringify(syncSnap()) }); syncOn = r.ok; }
    catch (e) { syncOn = false }
    syncBadge();
  }, 400);
};

// Ambil data terbaru; data dengan waktu ubah paling baru yang dipakai.
async function cloudPull() {
  if (!FIREBASE_URL || syncBusy) return;
  syncBusy = true;
  try {
    const r = await fetch(FIREBASE_URL + SYNC_PATH), d = await r.json();
    syncOn = r.ok;
    if (d === null) cloudPush();                       // database masih kosong: unggah data perangkat ini
    else if (d && (d.rev || 0) > (DB.rev || 0)) {
      const a = document.activeElement;
      if (!(a && ["INPUT", "SELECT"].includes(a.tagName))) { // jangan ganggu saat sedang mengetik
        Object.assign(DB, { products: d.products || [], sales: d.sales || [], nid: d.nid, pid: d.pid, rev: d.rev });
        try { localStorage.setItem(KEY, JSON.stringify(DB)) } catch (e) {}
        go();
      }
    } else if (d && (d.rev || 0) < (DB.rev || 0)) cloudPush();
  } catch (e) { syncOn = false }
  syncBusy = false; syncBadge();
}
if (FIREBASE_URL) {
  cloudPull(); setInterval(cloudPull, 5000);
  addEventListener("online", cloudPull);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) cloudPull() });
}
