// =========================================================================
// 1. SISTEM KEAMANAN KRIPTOGRAFI (SHA-256 HASHING & ANTI-XSS)
// =========================================================================

// Fungsi mengubah password menjadi kode Hash SHA-256 (Tidak bisa dibaca manusia)
async function hashPassword(password, email) {
    const salt = "shinigami_salt_2026_" + email.toLowerCase();
    const teksGabungan = password + salt;
    const msgBuffer = new TextEncoder().encode(teksGabungan);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Fungsi membersihkan teks agar tidak bisa disusupi script berbahaya (Anti-XSS)
function bersihkanTeks(teks) {
    const div = document.createElement('div');
    div.textContent = teks;
    return div.innerHTML;
}

// =========================================================================
// 2. ELEMEN DOM & STATE APLIKASI
// =========================================================================
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
const btnTutupModal = document.getElementById('btn-tutup-modal');
const btnBukaTambah = document.getElementById('btn-buka-tambah');
const btnTutupTambah = document.getElementById('btn-tutup-tambah');
const panelTambah = document.getElementById('panel-tambah');
const infoAkunNav = document.getElementById('info-akun-nav');
const teksUser = document.getElementById('teks-user');
const btnKeluar = document.getElementById('btn-keluar');

const formKomik = document.getElementById('form-komik');
const inputJudul = document.getElementById('judul');
const inputChapter = document.getElementById('chapter');
const inputStatus = document.getElementById('status');
const inputSampul = document.getElementById('sampul');
const wadahDaftar = document.getElementById('daftar-komik');
const totalKomikBadge = document.getElementById('total-komik');
const inputCari = document.getElementById('input-cari');
const filterBtns = document.querySelectorAll('.filter-btn');

// Variabel Keamanan & State
let modeDaftar = false; // false = Mode Login, true = Mode Mengatur Password Baru
let percobaanGagal = 0;
let waktuTerkunci = 0;
let filterAktif = 'Semua';

let daftarAkun = JSON.parse(localStorage.getItem('akun_komik_aman_v2')) || {};
let sesiAktif = JSON.parse(localStorage.getItem('sesi_komik_aman_v2')) || null;
let koleksiKomik = [];

// =========================================================================
// 3. PENGATURAN MODAL LOGIN & TAB
// =========================================================================

// Pindah antara mode "Login" dan "Mengatur Password (Daftar)"
linkGantiMode.addEventListener('click', (e) => {
    e.preventDefault();
    modeDaftar = !modeDaftar;
    pesanAuth.textContent = '';

    if (modeDaftar) {
        judulModalAuth.textContent = 'Mengatur Password Akun';
        btnSubmitAuth.textContent = 'Simpan Password & Masuk';
        teksBantuanAuth.textContent = 'Sudah punya password?';
        linkGantiMode.textContent = 'Kembali ke Login';
    } else {
        judulModalAuth.textContent = 'Login with Password';
        btnSubmitAuth.textContent = 'Login';
        teksBantuanAuth.textContent = 'Untuk mendapatkan password lihat tutorial ini:';
        linkGantiMode.textContent = 'Mengatur Password';
    }
});

// Pindah Tab Social & Password
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

btnBukaLogin.addEventListener('click', () => {
    modalAuth.style.display = 'flex';
});

btnTutupModal.addEventListener('click', () => {
    if (sesiAktif) {
        modalAuth.style.display = 'none';
    } else {
        pesanAuth.textContent = 'Silakan login terlebih dahulu untuk mengakses jurnalmu.';
    }
});

// =========================================================================
// 4. PROSES AUTENTIKASI AMAN (LOGIN & REGISTER)
// =========================================================================
formAuth.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Cek apakah sedang terkunci karena Brute-Force
    const sekarang = Date.now();
    if (sekarang < waktuTerkunci) {
        const sisaDetik = Math.ceil((waktuTerkunci - sekarang) / 1000);
        pesanAuth.textContent = `Terlalu banyak percobaan gagal! Tunggu ${sisaDetik} detik.`;
        return;
    }

    const email = inputEmail.value.trim().toLowerCase();
    const password = inputPassword.value;

    if (password.length < 8) {
        pesanAuth.textContent = ' demi keamanan, password minimal harus 8 karakter!';
        return;
    }

    // Mengenkripsi password dengan SHA-256
    const passwordTerenkripsi = await hashPassword(password, email);

    if (modeDaftar) {
        // MODE MENGATUR PASSWORD BARU / DAFTAR
        if (daftarAkun[email]) {
            pesanAuth.textContent = 'Email ini sudah terdaftar! Silakan kembali ke Login.';
            return;
        }

        daftarAkun[email] = {
            passwordHash: passwordTerenkripsi,
            dibuatPada: new Date().toISOString()
        };
        localStorage.setItem('akun_komik_aman_v2', JSON.stringify(daftarAkun));

        buatSesiLogin(email);
    } else {
        // MODE LOGIN
        const akun = daftarAkun[email];
        if (akun && akun.passwordHash === passwordTerenkripsi) {
            percobaanGagal = 0;
            buatSesiLogin(email);
        } else {
            percobaanGagal += 1;
            if (percobaanGagal >= 5) {
                waktuTerkunci = Date.now() + 30000; // Kunci selama 30 detik
                percobaanGagal = 0;
                pesanAuth.textContent = 'Terlalu banyak salah password! Dikunci selama 30 detik.';
            } else {
                pesanAuth.textContent = `Email atau Password salah! (Sisa percobaan: ${5 - percobaanGagal}x)`;
            }
        }
    }
});

function buatSesiLogin(email) {
    // Membuat token acak
    const tokenAcak = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2);
    sesiAktif = { email: email, token: tokenAcak };
    localStorage.setItem('sesi_komik_aman_v2', JSON.stringify(sesiAktif));
    formAuth.reset();
    pesanAuth.textContent = '';
    perbaruiTampilanAuth();
}

btnKeluar.addEventListener('click', () => {
    sesiAktif = null;
    localStorage.removeItem('sesi_komik_aman_v2');
    perbaruiTampilanAuth();
});

function perbaruiTampilanAuth() {
    if (sesiAktif && sesiAktif.email) {
        modalAuth.style.display = 'none';
        btnBukaLogin.style.display = 'none';
        btnBukaTambah.style.display = 'inline-block';
        infoAkunNav.style.display = 'flex';
        teksUser.textContent = sesiAktif.email;

        koleksiKomik = JSON.parse(localStorage.getItem(`koleksi_${sesiAktif.email}`)) || [];
        tampilkanKomik();
    } else {
        modalAuth.style.display = 'flex';
        btnBukaLogin.style.display = 'inline-block';
        btnBukaTambah.style.display = 'none';
        infoAkunNav.style.display = 'none';
        panelTambah.style.display = 'none';
        wadahDaftar.innerHTML = '';
        totalKomikBadge.textContent = '0 Komik';
    }
}

// =========================================================================
// 5. KELOLA DATA & TAMPILAN GRID ALA SHINIGAMI
// =========================================================================
btnBukaTambah.addEventListener('click', () => {
    panelTambah.style.display = panelTambah.style.display === 'none' ? 'block' : 'none';
});

btnTutupTambah.addEventListener('click', () => {
    panelTambah.style.display = 'none';
});

function simpanKeMemori() {
    if (sesiAktif && sesiAktif.email) {
        localStorage.setItem(`koleksi_${sesiAktif.email}`, JSON.stringify(koleksiKomik));
    }
}

function kecilkanFoto(fileGambar) {
    return new Promise((resolve) => {
        const pembaca = new FileReader();
        pembaca.readAsDataURL(fileGambar);
        pembaca.onload = function(event) {
            const gambar = new Image();
            gambar.src = event.target.result;
            gambar.onload = function() {
                const canvas = document.createElement('canvas');
                const lebarMaks = 260;
                const skala = lebarMaks / gambar.width;
                canvas.width = lebarMaks;
                canvas.height = gambar.height * skala;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(gambar, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.75));
            };
        };
    });
}

function tampilkanKomik() {
    wadahDaftar.innerHTML = '';
    const kataKunci = inputCari.value.toLowerCase();

    // Saring komik berdasarkan pencarian dan tab filter
    const komikTersaring = koleksiKomik.filter((komik) => {
        const cocokJudul = komik.judul.toLowerCase().includes(kataKunci);
        const cocokStatus = filterAktif === 'Semua' || komik.status === filterAktif;
        return cocokJudul && cocokStatus;
    });

    totalKomikBadge.textContent = `${komikTersaring.length} Komik`;

    if (komikTersaring.length === 0) {
        wadahDaftar.innerHTML = `<p style="color:#a1a1aa; grid-column: 1/-1; text-align:center; padding: 40px 0;">Belum ada komik yang ditemukan.</p>`;
        return;
    }

    komikTersaring.forEach((komik) => {
        const indexAsli = koleksiKomik.indexOf(komik);
        const kartu = document.createElement('div');
        kartu.className = 'comic-card';

        // Warna label status
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
            : `<div class="poster-placeholder">📘</div>`;

        kartu.innerHTML = `
            <div class="poster-wrapper">
                ${posterHTML}
                <span class="status-pill ${kelasStatus}">${labelStatus}</span>
                <button class="btn-hapus-card" onclick="hapusKomik(${indexAsli})" title="Hapus Komik">🗑️</button>
            </div>
            <div class="card-body">
                <h3 class="comic-title" title="${bersihkanTeks(komik.judul)}">${bersihkanTeks(komik.judul)}</h3>
                <div class="chapter-row">
                    <span class="chapter-badge">Ch. ${komik.chapter}</span>
                    <button class="btn-plus-ch" onclick="tambahChapter(${indexAsli})" title="Tambah 1 Chapter">+1</button>
                </div>
            </div>
        `;

        wadahDaftar.appendChild(kartu);
    });
}

// Simpan komik baru
formKomik.addEventListener('submit', async (e) => {
    e.preventDefault();
    let dataFoto = null;
    if (inputSampul.files && inputSampul.files[0]) {
        dataFoto = await kecilkanFoto(inputSampul.files[0]);
    }

    koleksiKomik.unshift({
        judul: inputJudul.value.trim(),
        chapter: Number(inputChapter.value),
        status: inputStatus.value,
        sampul: dataFoto
    });

    simpanKeMemori();
    tampilkanKomik();
    formKomik.reset();
    panelTambah.style.display = 'none';
});

// Fitur Pencarian Langsung & Filter Tab
inputCari.addEventListener('input', tampilkanKomik);

filterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterAktif = btn.getAttribute('data-filter');
        tampilkanKomik();
    });
});

window.tambahChapter = function(index) {
    koleksiKomik[index].chapter += 1;
    simpanKeMemori();
    tampilkanKomik();
};

window.hapusKomik = function(index) {
    koleksiKomik.splice(index, 1);
    simpanKeMemori();
    tampilkanKomik();
};

// Jalankan saat halaman dibuka
perbaruiTampilanAuth();