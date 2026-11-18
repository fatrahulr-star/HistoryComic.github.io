import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, 
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { 
    getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// =========================================================================
// TEMPELKAN KODE firebaseConfig DARI FIREBASE CONSOLE KAMU DI BAWAH INI:
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyCFPKNQAZRTlWLi25SssXuAyTd9vY0UyXA",
  authDomain: "historycomic.firebaseapp.com",
  projectId: "historycomic",
  storageBucket: "historycomic.firebasestorage.app",
  messagingSenderId: "749295013287",
  appId: "1:749295013287:web:11afd45556353395903a82"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Fungsi Anti-XSS untuk keamanan teks
function bersihkanTeks(teks) {
    const div = document.createElement('div');
    div.textContent = teks || '';
    return div.innerHTML;
}

// Elemen DOM
const modalAuth = document.getElementById('modal-auth');
const formAuth = document.getElementById('form-auth');
const inputEmail = document.getElementById('email-user');
const inputPassword = document.getElementById('password-user');
const pesanAuth = document.getElementById('pesan-auth');
const judulModalAuth = document.getElementById('judul-modal-auth');
const btnSubmitAuth = document.getElementById('btn-submit-auth');
const linkGantiMode = document.getElementById('link-ganti-mode');
const teksBantuanAuth = document.getElementById('teks-bantuan-auth');

const btnBukaLogin = document.getElementById('btn-buka-login');
const btnBukaTambah = document.getElementById('btn-buka-tambah');
const btnTutupTambah = document.getElementById('btn-tutup-tambah');
const panelTambah = document.getElementById('panel-tambah');
const infoAkunNav = document.getElementById('info-akun-nav');
const teksUser = document.getElementById('teks-user');
const btnKeluar = document.getElementById('btn-keluar');

const formKomik = document.getElementById('form-komik');
const judulFormTambah = document.getElementById('judul-form-tambah');
const inputKategori = document.getElementById('kategori');
const labelJudul = document.getElementById('label-judul');
const inputJudul = document.getElementById('judul');
const wadahVolume = document.getElementById('wadah-volume');
const inputVolume = document.getElementById('volume');
const wadahChapter = document.getElementById('wadah-chapter');
const inputChapter = document.getElementById('chapter');
const wadahHalamanBuku = document.getElementById('wadah-halaman-buku');
const inputHalamanAwal = document.getElementById('halaman-awal');
const inputHalamanAkhir = document.getElementById('halaman-akhir');
const wadahLaguSosmed = document.getElementById('wadah-lagu-sosmed');
const inputArtisLagu = document.getElementById('artis-lagu');
const inputTimestampLagu = document.getElementById('timestamp-lagu');
const inputPlatformLagu = document.getElementById('platform-lagu');
const inputLinkLagu = document.getElementById('link-lagu');
const inputCatatanLagu = document.getElementById('catatan-lagu');
const labelStatus = document.getElementById('label-status');
const inputStatus = document.getElementById('status');
const optStatusReading = document.getElementById('opt-status-reading');
const optStatusCompleted = document.getElementById('opt-status-completed');
const optStatusPlan = document.getElementById('opt-status-plan');
const labelSampul = document.getElementById('label-sampul');
const inputSampul = document.getElementById('sampul');
const previewSampulWadah = document.getElementById('preview-sampul-wadah');
const previewSampulImg = document.getElementById('preview-sampul-img');
const btnUbahSampulForm = document.getElementById('btn-ubah-sampul-form');
const btnHapusSampulForm = document.getElementById('btn-hapus-sampul-form');
const inputGantiSampul = document.getElementById('input-ganti-sampul');
const showcaseAudioWadah = document.getElementById('showcase-audio-wadah');

const modalEdit = document.getElementById('modal-edit');
const judulModalEdit = document.getElementById('judul-modal-edit');
const btnTutupEdit = document.getElementById('btn-tutup-edit');
const formEditInfo = document.getElementById('form-edit-info');
const labelEditJudul = document.getElementById('label-edit-judul');
const inputEditJudul = document.getElementById('input-edit-judul');
const grupEditChapter = document.getElementById('grup-edit-chapter');
const inputTambahChapter = document.getElementById('input-tambah-chapter');
const teksChLama = document.getElementById('teks-ch-lama');
const teksChBaru = document.getElementById('teks-ch-baru');
const grupEditHalaman = document.getElementById('grup-edit-halaman');
const editHalamanAwal = document.getElementById('edit-halaman-awal');
const editHalamanAkhir = document.getElementById('edit-halaman-akhir');
const inputTambahHalaman = document.getElementById('input-tambah-halaman');
const teksHalPreview = document.getElementById('teks-hal-preview');
const grupEditLagu = document.getElementById('grup-edit-lagu');
const editArtisLagu = document.getElementById('edit-artis-lagu');
const editTimestampLagu = document.getElementById('edit-timestamp-lagu');
const editPlatformLagu = document.getElementById('edit-platform-lagu');
const editLinkLagu = document.getElementById('edit-link-lagu');
const editCatatanLagu = document.getElementById('edit-catatan-lagu');
const editStatusLagu = document.getElementById('edit-status-lagu');
const btnSimpanEdit = document.getElementById('btn-simpan-edit');

const btnSimpanKomik = document.getElementById('btn-simpan-komik');
const wadahDaftar = document.getElementById('daftar-komik');
const judulDaftar = document.getElementById('judul-daftar');
const totalKomikBadge = document.getElementById('total-komik');
const inputCari = document.getElementById('input-cari');
const filterBtns = document.querySelectorAll('.filter-btn');
const filterReadingBtn = document.getElementById('filter-reading');
const filterCompletedBtn = document.getElementById('filter-completed');
const filterPlanBtn = document.getElementById('filter-plan');

const tabKomik = document.getElementById('tab-komik');
const tabNovel = document.getElementById('tab-novel');
const tabBuku = document.getElementById('tab-buku');
const tabLagu = document.getElementById('tab-lagu');
const cabangNovelBar = document.getElementById('cabang-novel-bar');
const subNovelBtns = document.querySelectorAll('.sub-novel-btn');

let modeDaftar = false;
let filterAktif = 'Semua';
let filterPlatformSosmed = 'All';
let kategoriAktif = 'Komik';
let subNovelAktif = 'Light Novel';
let userSaatIni = null;
let koleksiKomik = [];
let idKomikGantiPoster = null;
let tombolPosterAktif = null;
let komikSedangDiedit = null;

function normalisasiKategori(kategoriData) {
    if (!kategoriData) return 'Komik';
    if (kategoriData === 'Novel') return 'Light Novel';
    return kategoriData;
}

function perbaruiLabelStatusUI(tipe) {
    const isLagu = tipe === 'Lagu / Soundtrack';
    if (isLagu) {
        labelStatus.textContent = 'Status Audio Sosmed';
        optStatusReading.textContent = '🎧 Favorit / Sering Dipakai (On Repeat)';
        optStatusCompleted.textContent = '✅ Sudah Dipakai di Status (Used)';
        optStatusPlan.textContent = '📌 Siap Dipakai Status (Saved)';
    } else {
        labelStatus.textContent = 'Status Baca';
        optStatusReading.textContent = 'Sedang Dibaca (Reading)';
        optStatusCompleted.textContent = 'Sudah Tamat (Completed)';
        optStatusPlan.textContent = 'Rencana Baca (Plan)';
    }
}

function perbaruiLabelFilterTab(tipe) {
    const isLagu = tipe === 'Lagu / Soundtrack';
    if (isLagu) {
        filterReadingBtn.textContent = '🎧 Favorit';
        filterCompletedBtn.textContent = '✅ Sudah Dipakai';
        filterPlanBtn.textContent = '📌 Siap Pakai';
    } else {
        filterReadingBtn.textContent = 'Reading';
        filterCompletedBtn.textContent = 'Completed';
        filterPlanBtn.textContent = 'Plan to Read';
    }
}

// Sesuaikan tampilan form berdasarkan pilihan Komik, Light Novel, Novel Biasa, Buku Bacaan Biasa, atau Lagu / Soundtrack
function sesuaikanFormKategori(tipe) {
    inputKategori.value = tipe;
    perbaruiLabelStatusUI(tipe);

    if (tipe === 'Light Novel') {
        judulFormTambah.textContent = 'Tambah Light Novel Baru';
        labelJudul.textContent = 'Judul Light Novel';
        inputJudul.placeholder = 'Contoh: Omniscient Reader / Overlord';
        wadahVolume.style.display = 'block';
        wadahChapter.style.display = 'block';
        inputChapter.required = true;
        wadahHalamanBuku.style.display = 'none';
        inputHalamanAwal.required = false;
        inputHalamanAkhir.required = false;
        wadahLaguSosmed.style.display = 'none';
        labelSampul.textContent = 'Poster / Sampul Light Novel';
    } else if (tipe === 'Novel Biasa') {
        judulFormTambah.textContent = 'Tambah Novel Biasa Baru';
        labelJudul.textContent = 'Judul Novel Biasa';
        inputJudul.placeholder = 'Contoh: Bumi / Laut Bercerita';
        wadahVolume.style.display = 'none';
        inputVolume.value = '';
        wadahChapter.style.display = 'block';
        inputChapter.required = true;
        wadahHalamanBuku.style.display = 'none';
        inputHalamanAwal.required = false;
        inputHalamanAkhir.required = false;
        wadahLaguSosmed.style.display = 'none';
        labelSampul.textContent = 'Poster / Sampul Novel Biasa';
    } else if (tipe === 'Buku Bacaan Biasa') {
        judulFormTambah.textContent = 'Tambah Buku Bacaan Biasa';
        labelJudul.textContent = 'Judul Buku Bacaan';
        inputJudul.placeholder = 'Contoh: Atomic Habits / Filosofi Teras';
        wadahVolume.style.display = 'none';
        inputVolume.value = '';
        wadahChapter.style.display = 'none';
        inputChapter.required = false;
        wadahHalamanBuku.style.display = 'grid';
        inputHalamanAwal.required = true;
        inputHalamanAkhir.required = true;
        wadahLaguSosmed.style.display = 'none';
        labelSampul.textContent = 'Poster / Sampul Buku Bacaan';
    } else if (tipe === 'Lagu / Soundtrack') {
        judulFormTambah.textContent = 'Tambah Lagu / Soundtrack Status Sosmed';
        labelJudul.textContent = 'Judul Lagu / Soundtrack';
        inputJudul.placeholder = 'Contoh: Deep Down / Sparkle (Ost. Your Name)';
        wadahVolume.style.display = 'none';
        inputVolume.value = '';
        wadahChapter.style.display = 'none';
        inputChapter.required = false;
        wadahHalamanBuku.style.display = 'none';
        inputHalamanAwal.required = false;
        inputHalamanAkhir.required = false;
        wadahLaguSosmed.style.display = 'grid';
        labelSampul.textContent = 'Cover Album / Thumbnail Audio (Opsional)';
    } else {
        judulFormTambah.textContent = 'Tambah Komik Baru';
        labelJudul.textContent = 'Judul Komik';
        inputJudul.placeholder = 'Contoh: Solo Leveling';
        wadahVolume.style.display = 'none';
        inputVolume.value = '';
        wadahChapter.style.display = 'block';
        inputChapter.required = true;
        wadahHalamanBuku.style.display = 'none';
        inputHalamanAwal.required = false;
        inputHalamanAkhir.required = false;
        wadahLaguSosmed.style.display = 'none';
        labelSampul.textContent = 'Poster / Sampul Komik';
    }
}

inputKategori.addEventListener('change', () => {
    sesuaikanFormKategori(inputKategori.value);
});

// Pengaturan Tab Modal Login
linkGantiMode.addEventListener('click', (e) => {
    e.preventDefault();
    modeDaftar = !modeDaftar;
    pesanAuth.textContent = '';

    if (modeDaftar) {
        judulModalAuth.textContent = 'Mengatur Password Akun';
        btnSubmitAuth.textContent = 'Buat Akun & Masuk';
        teksBantuanAuth.textContent = 'Sudah punya akun?';
        linkGantiMode.textContent = 'Kembali ke Login';
    } else {
        judulModalAuth.textContent = 'Login with Password';
        btnSubmitAuth.textContent = 'Login';
        teksBantuanAuth.textContent = 'Untuk mendapatkan password lihat tutorial ini:';
        linkGantiMode.textContent = 'Mengatur Password';
    }
});

document.getElementById('tab-social').addEventListener('click', () => {
    document.getElementById('tab-social').classList.add('active');
    document.getElementById('tab-password').classList.remove('active');
    document.getElementById('konten-social').style.display = 'block';
    document.getElementById('konten-password').style.display = 'none';
});

document.getElementById('tab-password').addEventListener('click', () => {
    document.getElementById('tab-password').classList.add('active');
    document.getElementById('tab-social').classList.remove('active');
    document.getElementById('konten-password').style.display = 'block';
    document.getElementById('konten-social').style.display = 'none';
});

btnBukaLogin.addEventListener('click', () => modalAuth.style.display = 'flex');

// 1. LOGIN & DAFTAR DENGAN EMAIL/PASSWORD (SERVER FIREBASE)
formAuth.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = inputEmail.value.trim();
    const pass = inputPassword.value;
    pesanAuth.textContent = 'Memproses...';

    try {
        if (modeDaftar) {
            await createUserWithEmailAndPassword(auth, email, pass);
        } else {
            await signInWithEmailAndPassword(auth, email, pass);
        }
        formAuth.reset();
        pesanAuth.textContent = '';
    } catch (error) {
        pesanAuth.textContent = 'Gagal: Email/Password salah atau akun sudah terdaftar.';
    }
});

// 2. LOGIN DENGAN GOOGLE (TAB SOCIAL)
document.getElementById('btn-login-google').addEventListener('click', async () => {
    try {
        await signInWithPopup(auth, googleProvider);
    } catch (error) {
        pesanAuth.textContent = 'Gagal masuk dengan Google.';
    }
});

// 3. LOGOUT
btnKeluar.addEventListener('click', () => signOut(auth));

// 4. PANTAU STATUS LOGIN PENGGUNA
onAuthStateChanged(auth, (user) => {
    if (user) {
        userSaatIni = user;
        modalAuth.style.display = 'none';
        btnBukaLogin.style.display = 'none';
        btnBukaTambah.style.display = 'inline-block';
        infoAkunNav.style.display = 'flex';
        teksUser.textContent = user.email;
        muatKomikDariCloud();
    } else {
        userSaatIni = null;
        koleksiKomik = [];
        modalAuth.style.display = 'flex';
        btnBukaLogin.style.display = 'inline-block';
        btnBukaTambah.style.display = 'none';
        infoAkunNav.style.display = 'none';
        panelTambah.style.display = 'none';
        showcaseAudioWadah.style.display = 'none';
        wadahDaftar.innerHTML = '';
        totalKomikBadge.textContent = `0 ${kategoriAktif}`;
    }
});

// 5. AMBIL DATA KOLEKSI DARI CLOUD FIRESTORE
async function muatKomikDariCloud() {
    wadahDaftar.innerHTML = `<p style="color:#a1a1aa; grid-column: 1/-1; text-align:center; padding: 40px 0;">Memuat koleksi dari Cloud...</p>`;
    const q = query(collection(db, "koleksi_komik"), where("uid", "==", userSaatIni.uid));
    const snapshot = await getDocs(q);

    koleksiKomik = [];
    snapshot.forEach((dokumen) => {
        koleksiKomik.push({ id: dokumen.id, ...dokumen.data() });
    });

    tampilkanKomik();
}

// Render Showcase Kartu 2x2 "🎵 Audio" ala Koleksi Sosmed (Khusus Tab Lagu / Soundtrack)
function renderShowcaseAudio(semuaLaguUser) {
    if (kategoriAktif !== 'Lagu / Soundtrack') {
        showcaseAudioWadah.style.display = 'none';
        return;
    }

    showcaseAudioWadah.style.display = 'block';

    // Ambil maksimal 4 gambar sampul dari koleksi lagu untuk membuat 2x2 collage seperti gambar contoh
    const laguDenganSampul = semuaLaguUser.filter((item) => Boolean(item.sampul));
    const ikonFallback = ['🎵', '🎧', '🎶', '✨'];
    let cellsHTML = '';

    for (let i = 0; i < 4; i++) {
        if (laguDenganSampul[i]) {
            cellsHTML += `
                <div class="audio-collage-cell">
                    <img src="${laguDenganSampul[i].sampul}" alt="${bersihkanTeks(laguDenganSampul[i].judul)}">
                </div>
            `;
        } else {
            cellsHTML += `<div class="audio-collage-cell">${ikonFallback[i]}</div>`;
        }
    }

    const jmlSiapPakai = semuaLaguUser.filter((l) => l.status === 'Rencana Baca').length;
    const jmlFavorit = semuaLaguUser.filter((l) => l.status === 'Sedang Dibaca').length;
    const jmlSudahDipakai = semuaLaguUser.filter((l) => l.status === 'Tamat').length;

    const daftarPilihanPills = [
        { nilai: 'All', label: 'All' },
        { nilai: 'Instagram Story / Reels', label: '📸 Reels & Story' },
        { nilai: 'TikTok Sound', label: '🎵 TikTok' },
        { nilai: 'WhatsApp Status', label: '💬 WA Status' },
        { nilai: 'YouTube Shorts', label: '🎬 Shorts' },
        { nilai: 'Vibe Aesthetic / Chill', label: '✨ Aesthetic / Chill' },
        { nilai: 'Vibe Hype / Anime / Gaming', label: '🔥 Hype / Anime' }
    ];

    const pillsHTML = daftarPilihanPills.map((p) => {
        const kelasAktif = filterPlatformSosmed === p.nilai ? 'active' : '';
        return `<button type="button" class="sosmed-pill ${kelasAktif}" onclick="pilihFilterPlatform('${p.nilai}')">${p.label}</button>`;
    }).join('');

    showcaseAudioWadah.innerHTML = `
        <div class="sosmed-pills-bar">
            ${pillsHTML}
        </div>
        <div class="audio-collection-row">
            <div class="audio-folder-card">
                <div class="audio-collage-grid">
                    ${cellsHTML}
                </div>
                <div class="audio-folder-label">
                    <span>🎵</span>
                    <span>Audio</span>
                </div>
            </div>
            <div class="audio-collection-info">
                <h3>Koleksi Lagu & Soundtrack Status Sosmed</h3>
                <p>Simpan backsound, lagu favorit, potongan detik reff, dan link audio untuk kebutuhan Instagram Story, Reels, TikTok, maupun WhatsApp Status.</p>
                <div class="audio-stats-badges">
                    <span class="audio-stat-chip">🎵 Total: ${semuaLaguUser.length} Audio</span>
                    <span class="audio-stat-chip">🎧 Favorit: ${jmlFavorit}</span>
                    <span class="audio-stat-chip">📌 Siap Pakai: ${jmlSiapPakai}</span>
                    <span class="audio-stat-chip">✅ Sudah Dipakai: ${jmlSudahDipakai}</span>
                </div>
            </div>
        </div>
    `;
}

window.pilihFilterPlatform = (nilaiPlatform) => {
    filterPlatformSosmed = nilaiPlatform;
    tampilkanKomik();
};

// 6. TAMPILKAN GRID KOLEKSI SESUAI TAB AKTIF
function tampilkanKomik() {
    wadahDaftar.innerHTML = '';
    const kataKunci = inputCari.value.toLowerCase();

    perbaruiLabelFilterTab(kategoriAktif);

    // Update teks UI berdasarkan tab yang aktif
    const labelTombolTambah = kategoriAktif === 'Lagu / Soundtrack' ? 'Lagu / Audio' : kategoriAktif;
    btnBukaTambah.textContent = `+ Tambah ${labelTombolTambah}`;
    inputCari.placeholder = kategoriAktif === 'Lagu / Soundtrack'
        ? 'Cari judul lagu, penyanyi, atau catatan vibe status...'
        : `Cari judul ${kategoriAktif.toLowerCase()} di koleksimu...`;
    judulDaftar.textContent = `Daftar Koleksi ${kategoriAktif}`;

    const semuaLaguUser = koleksiKomik.filter((item) => normalisasiKategori(item.kategori) === 'Lagu / Soundtrack');
    renderShowcaseAudio(semuaLaguUser);

    const komikTersaring = koleksiKomik.filter((komik) => {
        const tipeBacaan = normalisasiKategori(komik.kategori);
        const teksPencarianGabungan = `${komik.judul || ''} ${komik.artisLagu || ''} ${komik.catatanLagu || ''} ${komik.platformLagu || ''}`.toLowerCase();
        const cocokJudul = teksPencarianGabungan.includes(kataKunci);
        const cocokStatus = filterAktif === 'Semua' || komik.status === filterAktif;
        const cocokKategori = tipeBacaan === kategoriAktif;

        let cocokPlatform = true;
        if (kategoriAktif === 'Lagu / Soundtrack' && filterPlatformSosmed !== 'All') {
            cocokPlatform = (komik.platformLagu || 'Semua Sosmed') === filterPlatformSosmed;
        }

        return cocokJudul && cocokStatus && cocokKategori && cocokPlatform;
    });

    totalKomikBadge.textContent = `${komikTersaring.length} ${labelTombolTambah}`;

    if (komikTersaring.length === 0) {
        wadahDaftar.innerHTML = `<p style="color:#a1a1aa; grid-column: 1/-1; text-align:center; padding: 40px 0;">Belum ada ${kategoriAktif.toLowerCase()} yang ditemukan.</p>`;
        return;
    }

    komikTersaring.forEach((komik) => {
        const kartu = document.createElement('div');
        const tipeBacaan = normalisasiKategori(komik.kategori);
        const isLightNovel = tipeBacaan === 'Light Novel';
        const isNovelBiasa = tipeBacaan === 'Novel Biasa';
        const isBukuBiasa = tipeBacaan === 'Buku Bacaan Biasa';
        const isLagu = tipeBacaan === 'Lagu / Soundtrack';

        kartu.className = isLagu ? 'comic-card audio-card' : 'comic-card';

        let kelasTipe = 'type-komik';
        let ikonTipe = '📘';
        let labelBadgeTipe = tipeBacaan;

        if (isLightNovel) {
            kelasTipe = 'type-novel';
            ikonTipe = '✨';
        } else if (isNovelBiasa) {
            kelasTipe = 'type-novel-biasa';
            ikonTipe = '📖';
        } else if (isBukuBiasa) {
            kelasTipe = 'type-buku';
            ikonTipe = '📕';
        } else if (isLagu) {
            kelasTipe = 'type-lagu';
            ikonTipe = '🎵';
            labelBadgeTipe = komik.platformLagu || 'Soundtrack';
        }

        let kelasStatus = 'status-reading';
        let labelStatusKartu = isLagu ? 'Favorit' : 'Reading';
        if (komik.status === 'Tamat') {
            kelasStatus = 'status-tamat';
            labelStatusKartu = isLagu ? 'Sudah Dipakai' : 'Completed';
        } else if (komik.status === 'Rencana Baca') {
            kelasStatus = 'status-rencana';
            labelStatusKartu = isLagu ? 'Siap Pakai' : 'Plan';
        }

        const posterHTML = komik.sampul
            ? `<img src="${komik.sampul}" alt="${bersihkanTeks(komik.judul)}">`
            : `<div class="poster-placeholder">${ikonTipe}</div>`;

        // Format teks progress bacaan atau detail lagu status sosmed
        let teksChapter = '';
        let aksiTambahHTML = '';
        let labelEditCabang = '📝 Edit Nama & Chapter';
        let infoTambahanLaguHTML = '';

        if (isLagu) {
            const jmlDipakai = Number(komik.chapter) || 0;
            const bagianDetik = komik.timestampLagu ? `⏱️ ${bersihkanTeks(komik.timestampLagu)}` : `🎵 Dipakai ${jmlDipakai}x`;
            teksChapter = bagianDetik;
            labelEditCabang = '📝 Edit Info Lagu';

            const teksArtis = komik.artisLagu ? `🎤 ${bersihkanTeks(komik.artisLagu)}` : '🎤 Audio / Soundtrack Sosmed';
            const teksCatatan = komik.catatanLagu
                ? `<div class="song-note">💡 ${bersihkanTeks(komik.catatanLagu)}</div>`
                : '';

            infoTambahanLaguHTML = `
                <div class="song-artist" title="${teksArtis}">${teksArtis}</div>
                ${teksCatatan}
            `;

            const tombolLinkHTML = komik.linkLagu
                ? `<a href="${bersihkanTeks(komik.linkLagu)}" target="_blank" rel="noopener noreferrer" class="btn-aksi-lagu" title="Buka Link Audio / Lagu">▶️</a>`
                : '';

            aksiTambahHTML = `
                ${tombolLinkHTML}
                <button type="button" class="btn-aksi-lagu" onclick="salinInfoLagu('${komik.id}', this)" title="Salin Judul & Detik Lagu untuk Status Sosmed">📋</button>
                <button type="button" class="btn-plus-ch" onclick="tambahChapter('${komik.id}', ${jmlDipakai})" title="Tambah +1 Kali Dipakai di Status">+1</button>
            `;
        } else if (isBukuBiasa) {
            const halAwal = komik.halamanAwal || 1;
            const halAkhir = komik.halamanAkhir || komik.chapter || 1;
            teksChapter = `Hal. ${halAwal} - ${halAkhir}`;
            aksiTambahHTML = `<button class="btn-plus-ch" onclick="tambahHalaman('${komik.id}', ${halAkhir})" title="Tambah 1 Halaman">+1</button>`;
            labelEditCabang = '📝 Edit Nama & Halaman';
        } else if (isLightNovel && komik.volume) {
            teksChapter = `Vol. ${komik.volume} • Ch. ${komik.chapter}`;
            aksiTambahHTML = `<button class="btn-plus-ch" onclick="tambahChapter('${komik.id}', ${komik.chapter})" title="Tambah 1 Chapter">+1</button>`;
        } else {
            teksChapter = `Ch. ${komik.chapter}`;
            aksiTambahHTML = `<button class="btn-plus-ch" onclick="tambahChapter('${komik.id}', ${komik.chapter})" title="Tambah 1 Chapter">+1</button>`;
        }

        kartu.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <span class="status-pill ${kelasStatus}">${labelStatusKartu}</span>
                <span class="type-pill ${kelasTipe}">${ikonTipe} ${bersihkanTeks(labelBadgeTipe)}</span>
                <button class="btn-hapus-card" onclick="hapusKomik('${komik.id}')" title="Hapus ${tipeBacaan}">🗑️</button>
                <button class="btn-menu-edit" onclick="toggleMenuEdit(event, '${komik.id}')" title="Menu Edit ${tipeBacaan}">✏️</button>
                <div id="menu-edit-${komik.id}" class="cabang-edit-menu">
                    <button type="button" class="cabang-edit-item" onclick="pilihGambarBaru('${komik.id}', this)">📷 Edit Foto</button>
                    <button type="button" class="cabang-edit-item" onclick="bukaModalEdit('${komik.id}')">${labelEditCabang}</button>
                </div>
            </div>
            <div class="card-body">
                <h3 class="comic-title" title="${bersihkanTeks(komik.judul)}">${bersihkanTeks(komik.judul)}</h3>
                ${infoTambahanLaguHTML}
                <div class="chapter-row">
                    <span class="chapter-badge" title="${teksChapter}">${teksChapter}</span>
                    ${aksiTambahHTML}
                </div>
            </div>
        `;
        wadahDaftar.appendChild(kartu);
    });
}

// Salin Info Lagu ke Clipboard untuk Memudahkan Cari Sound saat Bikin Status Sosmed
window.salinInfoLagu = async (idDokumen, elemenTombol) => {
    const item = koleksiKomik.find((k) => k.id === idDokumen);
    if (!item) return;

    const bagianArtis = item.artisLagu ? ` - ${item.artisLagu}` : '';
    const bagianDetik = item.timestampLagu ? ` (${item.timestampLagu})` : '';
    const teksSalin = `${item.judul}${bagianArtis}${bagianDetik}`;

    try {
        await navigator.clipboard.writeText(teksSalin);
        const teksAsli = elemenTombol.textContent;
        elemenTombol.textContent = '✅';
        setTimeout(() => {
            elemenTombol.textContent = teksAsli;
        }, 1200);
    } catch (err) {
        alert(`Disalin: ${teksSalin}`);
    }
};

// 7. KOMPRES FOTO SAMPUL & SIMPAN KE CLOUD
function kecilkanFoto(fileGambar) {
    return new Promise((resolve) => {
        const pembaca = new FileReader();
        pembaca.readAsDataURL(fileGambar);
        pembaca.onload = (event) => {
            const gambar = new Image();
            gambar.src = event.target.result;
            gambar.onload = () => {
                const canvas = document.createElement('canvas');
                const lebarMaks = 240;
                const skala = lebarMaks / gambar.width;
                canvas.width = lebarMaks;
                canvas.height = gambar.height * skala;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(gambar, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
        };
    });
}

// Preview & Ganti Gambar Poster saat memilih file di Form Tambah
function resetPreviewSampulForm() {
    inputSampul.value = '';
    previewSampulImg.src = '';
    previewSampulWadah.style.display = 'none';
}

inputSampul.addEventListener('change', () => {
    if (inputSampul.files && inputSampul.files[0]) {
        const pembaca = new FileReader();
        pembaca.onload = (e) => {
            previewSampulImg.src = e.target.result;
            previewSampulWadah.style.display = 'flex';
        };
        pembaca.readAsDataURL(inputSampul.files[0]);
    } else {
        previewSampulImg.src = '';
        previewSampulWadah.style.display = 'none';
    }
});

btnUbahSampulForm.addEventListener('click', () => {
    inputSampul.click();
});

btnHapusSampulForm.addEventListener('click', () => {
    resetPreviewSampulForm();
});

btnBukaTambah.addEventListener('click', () => {
    if (panelTambah.style.display === 'none') {
        sesuaikanFormKategori(kategoriAktif);
        panelTambah.style.display = 'block';
    } else {
        panelTambah.style.display = 'none';
    }
});
btnTutupTambah.addEventListener('click', () => panelTambah.style.display = 'none');

function sinkronkanTabDenganKategori(tipe) {
    kategoriAktif = tipe;
    tabKomik.classList.remove('active');
    tabNovel.classList.remove('active');
    tabBuku.classList.remove('active');
    tabLagu.classList.remove('active');

    if (tipe === 'Komik') {
        tabKomik.classList.add('active');
        cabangNovelBar.style.display = 'none';
    } else if (tipe === 'Buku Bacaan Biasa') {
        tabBuku.classList.add('active');
        cabangNovelBar.style.display = 'none';
    } else if (tipe === 'Lagu / Soundtrack') {
        tabLagu.classList.add('active');
        cabangNovelBar.style.display = 'none';
    } else {
        subNovelAktif = tipe;
        tabNovel.classList.add('active');
        cabangNovelBar.style.display = 'grid';
        subNovelBtns.forEach((b) => {
            b.classList.toggle('active', b.getAttribute('data-subnovel') === subNovelAktif);
        });
    }
    sesuaikanFormKategori(kategoriAktif);
}

formKomik.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSimpanKomik.textContent = 'Menyimpan ke Cloud...';
    btnSimpanKomik.disabled = true;

    const tipeDipilih = inputKategori.value;
    const nilaiVolume = (tipeDipilih === 'Light Novel' && inputVolume.value.trim() !== '')
        ? Number(inputVolume.value)
        : null;

    const isBukuBiasa = tipeDipilih === 'Buku Bacaan Biasa';
    const isLagu = tipeDipilih === 'Lagu / Soundtrack';
    const halAwal = isBukuBiasa ? (Number(inputHalamanAwal.value) || 1) : null;
    const halAkhir = isBukuBiasa ? (Number(inputHalamanAkhir.value) || 1) : null;
    const nilaiChapter = isBukuBiasa
        ? halAkhir
        : (isLagu ? 0 : (Number(inputChapter.value) || 0));

    let dataFoto = null;
    if (inputSampul.files && inputSampul.files[0]) {
        dataFoto = await kecilkanFoto(inputSampul.files[0]);
    }

    await addDoc(collection(db, "koleksi_komik"), {
        uid: userSaatIni.uid,
        kategori: tipeDipilih,
        judul: inputJudul.value.trim(),
        volume: nilaiVolume,
        chapter: nilaiChapter,
        halamanAwal: halAwal,
        halamanAkhir: halAkhir,
        artisLagu: isLagu ? inputArtisLagu.value.trim() : null,
        timestampLagu: isLagu ? inputTimestampLagu.value.trim() : null,
        platformLagu: isLagu ? inputPlatformLagu.value : null,
        linkLagu: isLagu ? inputLinkLagu.value.trim() : null,
        catatanLagu: isLagu ? inputCatatanLagu.value.trim() : null,
        status: inputStatus.value,
        sampul: dataFoto
    });

    formKomik.reset();
    resetPreviewSampulForm();
    btnSimpanKomik.textContent = 'Simpan ke Koleksi';
    btnSimpanKomik.disabled = false;
    panelTambah.style.display = 'none';

    // Pindahkan ke tab sesuai item yang baru disimpan
    sinkronkanTabDenganKategori(tipeDipilih);
    muatKomikDariCloud();
});

// 8. MENU EDIT BERCABANG (1. EDIT FOTO, 2. EDIT NAMA & CHAPTER / HALAMAN / INFO LAGU) & HAPUS DI CLOUD
function tutupSemuaMenuEdit() {
    document.querySelectorAll('.cabang-edit-menu.terbuka').forEach((menu) => {
        menu.classList.remove('terbuka');
    });
    document.querySelectorAll('.btn-menu-edit.active').forEach((btn) => {
        btn.classList.remove('active');
    });
}

window.toggleMenuEdit = (event, idDokumen) => {
    event.stopPropagation();
    const menuTarget = document.getElementById(`menu-edit-${idDokumen}`);
    const tombolKlik = event.currentTarget;
    const sedangTerbuka = menuTarget && menuTarget.classList.contains('terbuka');

    tutupSemuaMenuEdit();

    if (menuTarget && !sedangTerbuka) {
        menuTarget.classList.add('terbuka');
        tombolKlik.classList.add('active');
    }
};

document.addEventListener('click', () => {
    tutupSemuaMenuEdit();
});

// Cabang 1: Edit Foto Poster / Cover Album
window.pilihGambarBaru = (idDokumen, elemenTombol) => {
    tutupSemuaMenuEdit();
    idKomikGantiPoster = idDokumen;
    tombolPosterAktif = elemenTombol;
    inputGantiSampul.value = '';
    inputGantiSampul.click();
};

inputGantiSampul.addEventListener('change', async () => {
    if (!inputGantiSampul.files || !inputGantiSampul.files[0] || !idKomikGantiPoster) return;

    if (tombolPosterAktif) {
        tombolPosterAktif.textContent = '⏳ Menyimpan...';
        tombolPosterAktif.disabled = true;
    }

    try {
        const fotoBaru = await kecilkanFoto(inputGantiSampul.files[0]);
        await updateDoc(doc(db, "koleksi_komik", idKomikGantiPoster), {
            sampul: fotoBaru
        });
        await muatKomikDariCloud();
    } catch (error) {
        if (tombolPosterAktif) {
            tombolPosterAktif.textContent = '📷 Edit Foto';
            tombolPosterAktif.disabled = false;
        }
    } finally {
        idKomikGantiPoster = null;
        tombolPosterAktif = null;
        inputGantiSampul.value = '';
    }
});

// Cabang 2: Edit Nama & Tambahan Chapter / Rentang Halaman / Info Lagu
function updatePreviewHalamanEdit() {
    const awal = Math.max(1, Number(editHalamanAwal.value) || 1);
    const akhirDasar = Math.max(1, Number(editHalamanAkhir.value) || 1);
    const tambahan = Math.max(0, Number(inputTambahHalaman.value) || 0);
    const akhirTotal = akhirDasar + tambahan;
    teksHalPreview.textContent = `Hal. ${awal} - ${akhirTotal}`;
}

window.bukaModalEdit = (idDokumen) => {
    tutupSemuaMenuEdit();
    const data = koleksiKomik.find((item) => item.id === idDokumen);
    if (!data) return;

    komikSedangDiedit = data;
    const tipe = normalisasiKategori(data.kategori);
    judulModalEdit.textContent = `Edit ${tipe}`;
    labelEditJudul.textContent = `Nama / Judul ${tipe}`;
    inputEditJudul.value = data.judul || '';

    if (tipe === 'Buku Bacaan Biasa') {
        grupEditChapter.style.display = 'none';
        grupEditHalaman.style.display = 'block';
        grupEditLagu.style.display = 'none';
        editHalamanAwal.value = data.halamanAwal || 1;
        editHalamanAkhir.value = data.halamanAkhir || data.chapter || 1;
        inputTambahHalaman.value = 0;
        updatePreviewHalamanEdit();
    } else if (tipe === 'Lagu / Soundtrack') {
        grupEditChapter.style.display = 'none';
        grupEditHalaman.style.display = 'none';
        grupEditLagu.style.display = 'block';
        editArtisLagu.value = data.artisLagu || '';
        editTimestampLagu.value = data.timestampLagu || '';
        editPlatformLagu.value = data.platformLagu || 'Semua Sosmed';
        editLinkLagu.value = data.linkLagu || '';
        editCatatanLagu.value = data.catatanLagu || '';
        editStatusLagu.value = data.status || 'Rencana Baca';
    } else {
        grupEditChapter.style.display = 'block';
        grupEditHalaman.style.display = 'none';
        grupEditLagu.style.display = 'none';
        inputTambahChapter.value = 0;
        teksChLama.textContent = `Ch. ${data.chapter}`;
        teksChBaru.textContent = `Ch. ${data.chapter}`;
    }

    modalEdit.style.display = 'flex';
};

inputTambahChapter.addEventListener('input', () => {
    if (!komikSedangDiedit) return;
    const tambahan = Math.max(0, Number(inputTambahChapter.value) || 0);
    const totalBaru = Number(komikSedangDiedit.chapter) + tambahan;
    teksChBaru.textContent = `Ch. ${totalBaru}`;
});

editHalamanAwal.addEventListener('input', updatePreviewHalamanEdit);
editHalamanAkhir.addEventListener('input', updatePreviewHalamanEdit);
inputTambahHalaman.addEventListener('input', updatePreviewHalamanEdit);

btnTutupEdit.addEventListener('click', () => {
    modalEdit.style.display = 'none';
    komikSedangDiedit = null;
});

modalEdit.addEventListener('click', (e) => {
    if (e.target === modalEdit) {
        modalEdit.style.display = 'none';
        komikSedangDiedit = null;
    }
});

formEditInfo.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!komikSedangDiedit) return;

    btnSimpanEdit.textContent = 'Menyimpan...';
    btnSimpanEdit.disabled = true;

    const judulBaru = inputEditJudul.value.trim();
    const tipe = normalisasiKategori(komikSedangDiedit.kategori);

    try {
        if (tipe === 'Buku Bacaan Biasa') {
            const awalBaru = Math.max(1, Number(editHalamanAwal.value) || 1);
            const akhirDasar = Math.max(1, Number(editHalamanAkhir.value) || 1);
            const tambahanHal = Math.max(0, Number(inputTambahHalaman.value) || 0);
            const akhirBaru = akhirDasar + tambahanHal;

            await updateDoc(doc(db, "koleksi_komik", komikSedangDiedit.id), {
                kategori: 'Buku Bacaan Biasa',
                judul: judulBaru,
                halamanAwal: awalBaru,
                halamanAkhir: akhirBaru,
                chapter: akhirBaru
            });
        } else if (tipe === 'Lagu / Soundtrack') {
            await updateDoc(doc(db, "koleksi_komik", komikSedangDiedit.id), {
                kategori: 'Lagu / Soundtrack',
                judul: judulBaru,
                artisLagu: editArtisLagu.value.trim(),
                timestampLagu: editTimestampLagu.value.trim(),
                platformLagu: editPlatformLagu.value,
                linkLagu: editLinkLagu.value.trim(),
                catatanLagu: editCatatanLagu.value.trim(),
                status: editStatusLagu.value
            });
        } else {
            const tambahanCh = Math.max(0, Number(inputTambahChapter.value) || 0);
            const chapterBaru = Number(komikSedangDiedit.chapter) + tambahanCh;

            await updateDoc(doc(db, "koleksi_komik", komikSedangDiedit.id), {
                judul: judulBaru,
                chapter: chapterBaru
            });
        }

        modalEdit.style.display = 'none';
        komikSedangDiedit = null;
        await muatKomikDariCloud();
    } finally {
        btnSimpanEdit.textContent = 'Simpan Perubahan';
        btnSimpanEdit.disabled = false;
    }
});

window.tambahChapter = async (idDokumen, chapterSekarang) => {
    await updateDoc(doc(db, "koleksi_komik", idDokumen), {
        chapter: chapterSekarang + 1
    });
    muatKomikDariCloud();
};

window.tambahHalaman = async (idDokumen, halamanAkhirSekarang) => {
    const baru = halamanAkhirSekarang + 1;
    await updateDoc(doc(db, "koleksi_komik", idDokumen), {
        halamanAkhir: baru,
        chapter: baru
    });
    muatKomikDariCloud();
};

window.hapusKomik = async (idDokumen) => {
    await deleteDoc(doc(db, "koleksi_komik", idDokumen));
    muatKomikDariCloud();
};

inputCari.addEventListener('input', tampilkanKomik);
filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAktif = btn.getAttribute('data-filter');
        tampilkanKomik();
    });
});

// Navigasi 4 Tab Utama: Komik, Novel (Bercabang: Light Novel & Novel Biasa), Buku Bacaan Biasa, dan Lagu / Soundtrack
tabKomik.addEventListener('click', () => {
    sinkronkanTabDenganKategori('Komik');
    tampilkanKomik();
});

tabNovel.addEventListener('click', () => {
    sinkronkanTabDenganKategori(subNovelAktif);
    tampilkanKomik();
});

tabBuku.addEventListener('click', () => {
    sinkronkanTabDenganKategori('Buku Bacaan Biasa');
    tampilkanKomik();
});

tabLagu.addEventListener('click', () => {
    sinkronkanTabDenganKategori('Lagu / Soundtrack');
    tampilkanKomik();
});

subNovelBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const pilihan = btn.getAttribute('data-subnovel');
        sinkronkanTabDenganKategori(pilihan);
        tampilkanKomik();
    });
});