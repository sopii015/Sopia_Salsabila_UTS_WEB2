/**
 * Mandasari Premium - LocalStorage Manager
 */

const STORAGE_KEYS = {
    USERS: 'mandasari_pelanggan',
    SESSION: 'mandasari_sesi_aktif', // Kunci sesi login global
    CART: 'mandasari_keranjang_belanja', // Kunci keranjang belanja global
    ORDERS: 'mandasari_riwayat_transaksi',
    WISHLIST: 'mandasari_favorit',
    THEME: 'mandasari_tema_visual'
};

const Storage = {
    get: (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Gagal mengambil data ${key}:`, error);
            return null;
        }
    },
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Gagal menyimpan data ${key}:`, error);
        }
    },
    remove: (key) => {
        localStorage.removeItem(key);
    },
    init: () => {
        if (!Storage.get(STORAGE_KEYS.USERS)) Storage.set(STORAGE_KEYS.USERS, []);
        if (!Storage.get(STORAGE_KEYS.CART)) Storage.set(STORAGE_KEYS.CART, []);
        if (!Storage.get(STORAGE_KEYS.ORDERS)) Storage.set(STORAGE_KEYS.ORDERS, []);
        if (!Storage.get(STORAGE_KEYS.WISHLIST)) Storage.set(STORAGE_KEYS.WISHLIST, []);
        if (!Storage.get(STORAGE_KEYS.THEME)) Storage.set(STORAGE_KEYS.THEME, 'light');
        console.log("Storage Mandasari Siap.");
    }
};

Storage.init();
