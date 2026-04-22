/**
 * Mandasari Premium - LocalStorage Manager
 * Mengelola penyimpanan data lokal untuk sesi, keranjang, dan transaksi.
 */

const STORAGE_KEYS = {
    USERS: 'mandasari_pelanggan',
    SESSION: 'mandasari_sesi_aktif',
    CART: 'mandasari_keranjang_belanja',
    ORDERS: 'mandasari_riwayat_transaksi',
    WISHLIST: 'mandasari_favorit',
    THEME: 'mandasari_tema_visual'
};

const Storage = {
    /**
     * Mengambil data dari LocalStorage
     * @param {string} key - Kunci penyimpanan
     * @returns {any|null} Data yang sudah di-parse ke JSON atau null jika kosong
     */
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Gagal mengambil data ${key}:`, error);
            return null;
        }
    },

    /**
     * Menyimpan data ke LocalStorage
     * @param {string} key - Kunci penyimpanan
     * @param {any} value - Data yang akan disimpan (akan diubah ke string JSON)
     */
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Gagal menyimpan data ${key}:`, error);
        }
    },

    /**
     * Menghapus data spesifik berdasarkan kunci
     */
    remove: (key) => {
        localStorage.removeItem(key);
    },

    /**
     * Inisialisasi awal penyimpanan saat aplikasi pertama kali dijalankan
     */
    init: () => {
        // Memastikan array kosong tersedia untuk data-data utama jika belum ada
        if (!Storage.get(STORAGE_KEYS.USERS)) Storage.set(STORAGE_KEYS.USERS, []);
        if (!Storage.get(STORAGE_KEYS.CART)) Storage.set(STORAGE_KEYS.CART, []);
        if (!Storage.get(STORAGE_KEYS.ORDERS)) Storage.set(STORAGE_KEYS.ORDERS, []);
        if (!Storage.get(STORAGE_KEYS.WISHLIST)) Storage.set(STORAGE_KEYS.WISHLIST, []);
        
        // Tema default: Light (Premium Look)
        if (!Storage.get(STORAGE_KEYS.THEME)) Storage.set(STORAGE_KEYS.THEME, 'light');
        
        console.log("Storage Mandasari Siap.");
    }
};

// Jalankan inisialisasi segera setelah file dimuat
Storage.init();