/**
 * Mandasari Premium - Authentication System
 */

const MandasariAuth = {
    // Mengambil sesi pengguna yang tersimpan saat ini
    sesi: Storage.get(STORAGE_KEYS.SESSION),

    init: () => {
        MandasariAuth.perbaruiTampilanNavigasi();
    },

    // Mengecek status login
    isLoggedIn: () => {
        return MandasariAuth.sesi !== null;
    },

    // Mendapatkan data user saat ini
    getUserAktif: () => {
        return MandasariAuth.sesi;
    },

    // Memastikan email belum terdaftar
    isEmailTersedia: (email) => {
        const daftarUser = Storage.get(STORAGE_KEYS.USERS) || [];
        return !daftarUser.some(u => u.email.toLowerCase() === email.toLowerCase());
    },

    /**
     * Memperbarui elemen UI berdasarkan status login (Navbar/Sidebar)
     */
    perbaruiTampilanNavigasi: () => {
        const menuUser = document.getElementById('user-profile-dropdown');
        const linkAuth = document.getElementById('auth-buttons-group');
        const namaUserEl = document.getElementById('display-user-name');
        
        const statusLogin = MandasariAuth.isLoggedIn();

        if (statusLogin) {
            if (menuUser) menuUser.classList.remove('hidden');
            if (linkAuth) linkAuth.classList.add('hidden');
            if (namaUserEl) {
                const panggilan = MandasariAuth.sesi.name.split(' ')[0];
                namaUserEl.textContent = `Halo, ${panggilan}`;
            }
        } else {
            if (menuUser) menuUser.classList.add('hidden');
            if (linkAuth) linkAuth.classList.remove('hidden');
        }
    },

    /**
     * Fungsi Registrasi Pengguna Baru
     */
    daftar: (nama, email, password) => {
        if (!MandasariAuth.isEmailTersedia(email)) {
            return { success: false, message: 'Email ini sudah terdaftar.' };
        }

        const userBaru = {
            id: 'USER-' + Date.now(),
            name: nama,
            email: email,
            password: password, // Simulasi UTS: Simpan teks biasa
            role: 'customer',
            joinedAt: new Date().toISOString()
        };

        const listUser = Storage.get(STORAGE_KEYS.USERS) || [];
        listUser.push(userBaru);
        Storage.set(STORAGE_KEYS.USERS, listUser);

        return { success: true, message: 'Akun berhasil dibuat! Silakan login.' };
    },

    /**
     * Fungsi Login
     */
    masuk: (email, password) => {
        // Logika Admin Khusus (Bonus)
        if (email === 'admin@mandasari.com' && password === 'mandasari123') {
            const dataAdmin = {
                id: 'ADMIN-MDS',
                name: 'Admin Mandasari',
                email: 'admin@mandasari.com',
                role: 'admin'
            };
            MandasariAuth.simpanSesi(dataAdmin);
            return { success: true, message: 'Selamat datang, Admin.', isAdmin: true };
        }

        const daftarUser = Storage.get(STORAGE_KEYS.USERS) || [];
        const user = daftarUser.find(u => u.email === email && u.password === password);

        if (user) {
            // Hapus password dari objek sesi demi keamanan minimal
            const { password: _, ...dataSesi } = user;
            MandasariAuth.simpanSesi(dataSesi);
            return { success: true, message: 'Login berhasil.', isAdmin: false };
        }

        return { success: false, message: 'Email atau password salah.' };
    },

    // Helper untuk menyimpan sesi
    simpanSesi: (data) => {
        MandasariAuth.sesi = data;
        Storage.set(STORAGE_KEYS.SESSION, data);
        MandasariAuth.perbaruiTampilanNavigasi();
    },

    /**
     * Fungsi Logout
     */
    keluar: () => {
        MandasariAuth.sesi = null;
        Storage.remove(STORAGE_KEYS.SESSION);
        
        // Opsional: Bersihkan keranjang saat logout (tergantung kebutuhan bisnis)
        // Storage.remove(STORAGE_KEYS.CART);
        
        MandasariAuth.perbaruiTampilanNavigasi();
        
        // Notifikasi dan Redirect
        Toast.show('Anda telah keluar dari akun.', 'info');
        
        // Proteksi halaman: Jika di halaman privat, tendang ke index
        const privatePages = ['checkout.html', 'admin-dashboard.html', 'riwayat.html'];
        const path = window.location.pathname;
        if (privatePages.some(page => path.includes(page))) {
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            setTimeout(() => window.location.reload(), 1000);
        }
    },

    /**
     * Middleware Sederhana: Cek Login sebelum akses fitur
     */
    proteksiFitur: (callback) => {
        if (MandasariAuth.isLoggedIn()) {
            if (callback) callback();
            return true;
        } else {
            Toast.show('Silakan login terlebih dahulu.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return false;
        }
    }
};

// Jalankan inisialisasi
document.addEventListener('DOMContentLoaded', MandasariAuth.init);

// Global Event Listener untuk tombol Logout
document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('.action-logout');
    if (logoutBtn) {
        e.preventDefault();
        MandasariAuth.keluar();
    }
});