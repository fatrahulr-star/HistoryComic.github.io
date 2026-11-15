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
const inputChapter = document.getElementById('chapter');
const inputStatus = document.getElementById('status');
const labelSampul = document.getElementById('label-sampul');
const inputSampul = document.getElementById('sampul');
const previewSampulWadah = document.getElementById('preview-sampul-wadah');
const previewSampulImg = document.getElementById('preview-sampul-img');
const btnUbahSampulForm = document.getElementById('btn-ubah-sampul-form');
const btnHapusSampulForm = document.getElementById('btn-hapus-sampul-form');
const inputGantiSampul = document.getElementById('input-ganti-sampul');
const btnSimpanKomik = document.getElementById('btn-simpan-komik');
const wadahDaftar = document.getElementById('daftar-komik');
const judulDaftar = document.getElementById('judul-daftar');
const totalKomikBadge = document.getElementById('total-komik');
const inputCari = document.getElementById('input-cari');
const filterBtns = document.querySelectorAll('.filter-btn');
const catBtns = document.querySelectorAll('.cat-btn');

let modeDaftar = false;
let filterAktif = 'Semua';
let kategoriAktif = 'Komik';
let userSaatIni = null;
let koleksiKomik = [];
let idKomikGantiPoster = null;
let tombolPosterAktif = null;

// Sesuaikan tampilan form berdasarkan pilihan Komik atau Novel
function sesuaikanFormKategori(tipe) {
    inputKategori.value = tipe;
    if (tipe === 'Novel') {
        judulFormTambah.textContent = 'Tambah Novel Baru';
        labelJudul.textContent = 'Judul Novel';
        inputJudul.placeholder = 'Contoh: Omniscient Reader / Overlord';
        wadahVolume.style.display = 'block';
        labelSampul.textContent = 'Poster / Sampul Novel';
    } else {
        judulFormTambah.textContent = 'Tambah Komik Baru';
        labelJudul.textContent = 'Judul Komik';
        inputJudul.placeholder = 'Contoh: Solo Leveling';
        wadahVolume.style.display = 'none';
        inputVolume.value = '';
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

// 6. TAMPILKAN GRID KOMIK / NOVEL SESUAI TAB HALAMAN AKTIF
function tampilkanKomik() {
    wadahDaftar.innerHTML = '';
    const kataKunci = inputCari.value.toLowerCase();

    // Update teks UI berdasarkan tab halaman utama yang aktif (Komik vs Novel)
    btnBukaTambah.textContent = `+ Tambah ${kategoriAktif}`;
    inputCari.placeholder = `Cari judul ${kategoriAktif.toLowerCase()} di koleksimu...`;
    judulDaftar.textContent = `Daftar Koleksi ${kategoriAktif}`;

    const komikTersaring = koleksiKomik.filter((komik) => {
        const tipeBacaan = komik.kategori || 'Komik';
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

        const tipeBacaan = komik.kategori || 'Komik';
        const isNovel = tipeBacaan === 'Novel';
        const kelasTipe = isNovel ? 'type-novel' : 'type-komik';
        const ikonTipe = isNovel ? '📖' : '📘';

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

        // Jika Novel dan memiliki data Volume, tampilkan "Vol. X • Ch. Y"
        const teksChapter = (isNovel && komik.volume)
            ? `Vol. ${komik.volume} • Ch. ${komik.chapter}`
            : `Ch. ${komik.chapter}`;

        kartu.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <span class="status-pill ${kelasStatus}">${labelStatus}</span>
                <span class="type-pill ${kelasTipe}">${ikonTipe} ${tipeBacaan}</span>
                <button class="btn-hapus-card" onclick="hapusKomik('${komik.id}')" title="Hapus ${tipeBacaan}">🗑️</button>
                <button class="btn-ganti-poster" onclick="pilihGambarBaru('${komik.id}', this)" title="Ganti Gambar Poster ${tipeBacaan}">📷</button>
            </div>
            <div class="card-body">
                <h3 class="comic-title" title="${bersihkanTeks(komik.judul)}">${bersihkanTeks(komik.judul)}</h3>
                <div class="chapter-row">
                    <span class="chapter-badge">${teksChapter}</span>
                    <button class="btn-plus-ch" onclick="tambahChapter('${komik.id}', ${komik.chapter})" title="Tambah 1 Chapter">+1</button>
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

formKomik.addEventListener('submit', async (e) => {
    e.preventDefault();
    btnSimpanKomik.textContent = 'Menyimpan ke Cloud...';
    btnSimpanKomik.disabled = true;

    const tipeDipilih = inputKategori.value;
    const nilaiVolume = (tipeDipilih === 'Novel' && inputVolume.value.trim() !== '')
        ? Number(inputVolume.value)
        : null;

    let dataFoto = null;
    if (inputSampul.files && inputSampul.files[0]) {
        dataFoto = await kecilkanFoto(inputSampul.files[0]);
    }

    await addDoc(collection(db, "koleksi_komik"), {
        uid: userSaatIni.uid,
        kategori: tipeDipilih,
        judul: inputJudul.value.trim(),
        volume: nilaiVolume,
        chapter: Number(inputChapter.value),
        status: inputStatus.value,
        sampul: dataFoto
    });

    formKomik.reset();
    resetPreviewSampulForm();
    btnSimpanKomik.textContent = 'Simpan ke Koleksi';
    btnSimpanKomik.disabled = false;
    panelTambah.style.display = 'none';

    // Pindahkan ke tab halaman sesuai bacaan yang baru disimpan
    kategoriAktif = tipeDipilih;
    catBtns.forEach((b) => {
        b.classList.toggle('active', b.getAttribute('data-kategori') === kategoriAktif);
    });
    sesuaikanFormKategori(kategoriAktif);

    muatKomikDariCloud();
});

// 8. UPDATE CHAPTER, GANTI POSTER & HAPUS DI CLOUD
window.pilihGambarBaru = (idDokumen, elemenTombol) => {
    idKomikGantiPoster = idDokumen;
    tombolPosterAktif = elemenTombol;
    inputGantiSampul.value = '';
    inputGantiSampul.click();
};

inputGantiSampul.addEventListener('change', async () => {
    if (!inputGantiSampul.files || !inputGantiSampul.files[0] || !idKomikGantiPoster) return;

    if (tombolPosterAktif) {
        tombolPosterAktif.textContent = '⏳';
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
            tombolPosterAktif.textContent = '📷';
            tombolPosterAktif.disabled = false;
        }
    } finally {
        idKomikGantiPoster = null;
        tombolPosterAktif = null;
        inputGantiSampul.value = '';
    }
});

window.tambahChapter = async (idDokumen, chapterSekarang) => {
    await updateDoc(doc(db, "koleksi_komik", idDokumen), {
        chapter: chapterSekarang + 1
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

catBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        catBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        kategoriAktif = btn.getAttribute('data-kategori');
        sesuaikanFormKategori(kategoriAktif);
        tampilkanKomik();
    });
});
