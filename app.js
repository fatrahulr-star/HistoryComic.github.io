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
    div.textContent = teks;
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
const inputStatus = document.getElementById('status');
const labelSampul = document.getElementById('label-sampul');
const inputSampul = document.getElementById('sampul');
const previewSampulWadah = document.getElementById('preview-sampul-wadah');
const previewSampulImg = document.getElementById('preview-sampul-img');
const btnUbahSampulForm = document.getElementById('btn-ubah-sampul-form');
const btnHapusSampulForm = document.getElementById('btn-hapus-sampul-form');
const inputGantiSampul = document.getElementById('input-ganti-sampul');
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
const btnSimpanEdit = document.getElementById('btn-simpan-edit');
const btnSimpanKomik = document.getElementById('btn-simpan-komik');
const wadahDaftar = document.getElementById('daftar-komik');
const judulDaftar = document.getElementById('judul-daftar');
const totalKomikBadge = document.getElementById('total-komik');
const inputCari = document.getElementById('input-cari');
const filterBtns = document.querySelectorAll('.filter-btn');
const tabKomik = document.getElementById('tab-komik');
const tabNovel = document.getElementById('tab-novel');
const tabBuku = document.getElementById('tab-buku');
const cabangNovelBar = document.getElementById('cabang-novel-bar');
const subNovelBtns = document.querySelectorAll('.sub-novel-btn');

let modeDaftar = false;
let filterAktif = 'Semua';
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

// Sesuaikan tampilan form berdasarkan pilihan Komik, Light Novel, Novel Biasa, atau Buku Bacaan Biasa
function sesuaikanFormKategori(tipe) {
    inputKategori.value = tipe;
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
        labelSampul.textContent = 'Poster / Sampul Buku Bacaan';
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
        labelSampul.textContent = 'Poster / Sampul Komik';
    }
}

inputKategori.addEventListener('change', () => {
    sesuaikanFormKategori(inputKategori.value);
});

// Pengaturan Tab Modal
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
        wadahDaftar.innerHTML = '';
        totalKomikBadge.textContent = `0 ${kategoriAktif}`;
    }
});

// 5. AMBIL DATA KOMIK & NOVEL DARI CLOUD FIRESTORE
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

// 6. TAMPILKAN GRID KOMIK / LIGHT NOVEL / NOVEL BIASA SESUAI TAB AKTIF
function tampilkanKomik() {
    wadahDaftar.innerHTML = '';
    const kataKunci = inputCari.value.toLowerCase();

    // Update teks UI berdasarkan tab yang aktif (Komik / Light Novel / Novel Biasa)
    btnBukaTambah.textContent = `+ Tambah ${kategoriAktif}`;
    inputCari.placeholder = `Cari judul ${kategoriAktif.toLowerCase()} di koleksimu...`;
    judulDaftar.textContent = `Daftar Koleksi ${kategoriAktif}`;

    const komikTersaring = koleksiKomik.filter((komik) => {
        const tipeBacaan = normalisasiKategori(komik.kategori);
        const cocokJudul = komik.judul.toLowerCase().includes(kataKunci);
        const cocokStatus = filterAktif === 'Semua' || komik.status === filterAktif;
        const cocokKategori = tipeBacaan === kategoriAktif;
        return cocokJudul && cocokStatus && cocokKategori;
    });

    totalKomikBadge.textContent = `${komikTersaring.length} ${kategoriAktif}`;

    if (komikTersaring.length === 0) {
        wadahDaftar.innerHTML = `<p style="color:#a1a1aa; grid-column: 1/-1; text-align:center; padding: 40px 0;">Belum ada ${kategoriAktif.toLowerCase()} yang ditemukan.</p>`;
        return;
    }

    komikTersaring.forEach((komik) => {
        const kartu = document.createElement('div');
        kartu.className = 'comic-card';

        const tipeBacaan = normalisasiKategori(komik.kategori);
        const isLightNovel = tipeBacaan === 'Light Novel';
        const isNovelBiasa = tipeBacaan === 'Novel Biasa';
        const isBukuBiasa = tipeBacaan === 'Buku Bacaan Biasa';

        let kelasTipe = 'type-komik';
        let ikonTipe = '📘';
        if (isLightNovel) {
            kelasTipe = 'type-novel';
            ikonTipe = '✨';
        } else if (isNovelBiasa) {
            kelasTipe = 'type-novel-biasa';
            ikonTipe = '📖';
        } else if (isBukuBiasa) {
            kelasTipe = 'type-buku';
            ikonTipe = '📕';
        }

        let kelasStatus = 'status-reading';
        let labelStatus = 'Reading';
        if (komik.status === 'Tamat') {
            kelasStatus = 'status-tamat';
            labelStatus = 'Completed';
        } else if (komik.status === 'Rencana Baca') {
            kelasStatus = 'status-rencana';
            labelStatus = 'Plan';
        }

        const posterHTML = komik.sampul
            ? `<img src="${komik.sampul}" alt="${bersihkanTeks(komik.judul)}">`
            : `<div class="poster-placeholder">${ikonTipe}</div>`;

        // Format teks progress bacaan
        let teksChapter = '';
        let aksiTambahHTML = '';
        let labelEditCabang = '📝 Edit Nama & Chapter';

        if (isBukuBiasa) {
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
                <span class="status-pill ${kelasStatus}">${labelStatus}</span>
                <span class="type-pill ${kelasTipe}">${ikonTipe} ${tipeBacaan}</span>
                <button class="btn-hapus-card" onclick="hapusKomik('${komik.id}')" title="Hapus ${tipeBacaan}">🗑️</button>
                <button class="btn-menu-edit" onclick="toggleMenuEdit(event, '${komik.id}')" title="Menu Edit ${tipeBacaan}">✏️</button>
                <div id="menu-edit-${komik.id}" class="cabang-edit-menu">
                    <button type="button" class="cabang-edit-item" onclick="pilihGambarBaru('${komik.id}', this)">📷 Edit Foto</button>
                    <button type="button" class="cabang-edit-item" onclick="bukaModalEdit('${komik.id}')">${labelEditCabang}</button>
                </div>
            </div>
            <div class="card-body">
                <h3 class="comic-title" title="${bersihkanTeks(komik.judul)}">${bersihkanTeks(komik.judul)}</h3>
                <div class="chapter-row">
                    <span class="chapter-badge">${teksChapter}</span>
                    ${aksiTambahHTML}
                </div>
            </div>
        `;
        wadahDaftar.appendChild(kartu);
    });
}

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
    if (tipe === 'Komik') {
        tabKomik.classList.add('active');
        tabNovel.classList.remove('active');
        tabBuku.classList.remove('active');
        cabangNovelBar.style.display = 'none';
    } else if (tipe === 'Buku Bacaan Biasa') {
        tabKomik.classList.remove('active');
        tabNovel.classList.remove('active');
        tabBuku.classList.add('active');
        cabangNovelBar.style.display = 'none';
    } else {
        subNovelAktif = tipe;
        tabKomik.classList.remove('active');
        tabNovel.classList.add('active');
        tabBuku.classList.remove('active');
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
    const halAwal = isBukuBiasa ? (Number(inputHalamanAwal.value) || 1) : null;
    const halAkhir = isBukuBiasa ? (Number(inputHalamanAkhir.value) || 1) : null;
    const nilaiChapter = isBukuBiasa ? halAkhir : (Number(inputChapter.value) || 0);

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
        status: inputStatus.value,
        sampul: dataFoto
    });

    formKomik.reset();
    resetPreviewSampulForm();
    btnSimpanKomik.textContent = 'Simpan ke Koleksi';
    btnSimpanKomik.disabled = false;
    panelTambah.style.display = 'none';

    // Pindahkan ke tab sesuai bacaan yang baru disimpan
    sinkronkanTabDenganKategori(tipeDipilih);
    muatKomikDariCloud();
});

// 8. MENU EDIT BERCABANG (1. EDIT FOTO, 2. EDIT NAMA & CHAPTER / HALAMAN) & HAPUS DI CLOUD
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

// Cabang 1: Edit Foto Poster
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

// Cabang 2: Edit Nama Komik/Novel & Tambahan Chapter / Rentang Halaman
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
    inputEditJudul.value = data.judul;

    if (tipe === 'Buku Bacaan Biasa') {
        grupEditChapter.style.display = 'none';
        grupEditHalaman.style.display = 'block';
        editHalamanAwal.value = data.halamanAwal || 1;
        editHalamanAkhir.value = data.halamanAkhir || data.chapter || 1;
        inputTambahHalaman.value = 0;
        updatePreviewHalamanEdit();
    } else {
        grupEditChapter.style.display = 'block';
        grupEditHalaman.style.display = 'none';
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

// Navigasi 3 Tab Utama: Komik, Novel (Bercabang: Light Novel & Novel Biasa), dan Buku Bacaan Biasa
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

subNovelBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        const pilihan = btn.getAttribute('data-subnovel');
        sinkronkanTabDenganKategori(pilihan);
        tampilkanKomik();
    });
});
