/**
 * Mandasari Premium - Authentication System
 */

const MandasariAuth = {
    sesi: Storage.get(STORAGE_KEYS.SESSION),

    init: () => {
        MandasariAuth.perbaruiTampilanNavigasi();
    },

    isLoggedIn: () => {
        return MandasariAuth.sesi !== null;
    },

    getUserAktif: () => {
        return MandasariAuth.sesi;
    },

    isEmailTersedia: (email) => {
        const daftarUser = Storage.get(STORAGE_KEYS.USERS) || [];
        return !daftarUser.some(u => u.email.toLowerCase() === email.toLowerCase());
    },

    perbaruiTampilanNavigasi: () => {
        // Deteksi selector umum yang tersebar di berbagai layout HTML kalian
        const menuUser = document.getElementById('user-profile-dropdown') || document.getElementById('user-menu');
        const linkAuth = document.getElementById('auth-buttons-group') || document.getElementById('auth-links');
        const namaUserEl = document.getElementById('display-user-name') || document.getElementById('user-greeting');

        const mobileAuthGroup = document.getElementById('mobile-auth-buttons-group');
        const mobileUserGroup = document.getElementById('mobile-user-profile-group');

        const statusLogin = MandasariAuth.isLoggedIn();

        if (statusLogin) {
            if (menuUser) menuUser.classList.remove('hidden');
            if (linkAuth) linkAuth.classList.add('hidden');
            if (namaUserEl) {
                const panggilan = MandasariAuth.sesi.name.split(' ')[0];
                namaUserEl.textContent = `Halo, ${panggilan}`;
            }
            if (mobileAuthGroup) mobileAuthGroup.classList.add('hidden');
            if (mobileUserGroup) mobileUserGroup.classList.remove('hidden');
        } else {
            if (menuUser) menuUser.classList.add('hidden');
            if (linkAuth) linkAuth.classList.remove('hidden');
            if (mobileAuthGroup) mobileAuthGroup.classList.remove('hidden');
            if (mobileUserGroup) mobileUserGroup.classList.add('hidden');
        }
    },

    daftar: (nama, email, password) => {
        if (!MandasariAuth.isEmailTersedia(email)) {
            return { success: false, message: 'Email ini sudah terdaftar.' };
        }

        const userBaru = {
            id: 'USER-' + Date.now(),
            name: nama,
            email: email,
            password: password,
            role: 'customer',
            joinedAt: new Date().toISOString()
        };

        const listUser = Storage.get(STORAGE_KEYS.USERS) || [];
        listUser.push(userBaru);
        Storage.set(STORAGE_KEYS.USERS, listUser);

        return { success: true, message: 'Akun berhasil dibuat! Silakan login.' };
    },

    masuk: (email, password) => {
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
            const { password: _, ...dataSesi } = user;
            MandasariAuth.simpanSesi(dataSesi);
            return { success: true, message: 'Login berhasil.', isAdmin: false };
        }

        return { success: false, message: 'Email atau password salah.' };
    },

    simpanSesi: (data) => {
        MandasariAuth.sesi = data;
        Storage.set(STORAGE_KEYS.SESSION, data);
        MandasariAuth.perbaruiTampilanNavigasi();
    },

    keluar: () => {
        MandasariAuth.sesi = null;
        Storage.remove(STORAGE_KEYS.SESSION);
        MandasariAuth.perbaruiTampilanNavigasi();

        if (typeof Toast !== 'undefined') Toast.show('Anda telah keluar dari akun.', 'info');

        const privatePages = ['checkout.html', 'admin.html', 'orders.html', 'wishlist.html'];
        const path = window.location.pathname;
        if (privatePages.some(page => path.includes(page))) {
            setTimeout(() => window.location.href = 'index.html', 1000);
        } else {
            setTimeout(() => window.location.reload(), 1000);
        }
    },

    requireLogin: (callback) => {
        if (MandasariAuth.isLoggedIn()) {
            if (callback) callback();
            return true;
        } else {
            if (typeof Toast !== 'undefined') Toast.show('Silakan login terlebih dahulu.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1200);
            return false;
        }
    }
};

document.addEventListener('DOMContentLoaded', MandasariAuth.init);

document.addEventListener('click', (e) => {
    const logoutBtn = e.target.closest('.action-logout') || e.target.closest('#logout-btn');
    if (logoutBtn) {
        e.preventDefault();
        MandasariAuth.keluar();
    }
});

MandasariAuth.login = MandasariAuth.masuk;
MandasariAuth.register = MandasariAuth.daftar;
MandasariAuth.proteksiFitur = MandasariAuth.requireLogin;
window.Auth = MandasariAuth;
