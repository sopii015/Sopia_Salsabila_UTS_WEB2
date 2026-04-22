/**
 * Mandasari Premium - Manajemen Transaksi & Pesanan
 */

const PesananMandasari = {
    init: () => {
        // Fungsi inisialisasi jika diperlukan saat halaman dimuat
    },

    /**
     * Mengambil riwayat pesanan khusus untuk user yang sedang login
     */
    ambilPesananPelanggan: () => {
        if (!MandasariAuth.isLoggedIn()) return [];
        
        const semuaPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        const userAktif = MandasariAuth.getUserAktif();
        
        // Filter pesanan berdasarkan ID User dan urutkan dari yang terbaru (descending)
        return semuaPesanan
            .filter(order => order.customerId === userAktif.id)
            .sort((a, b) => new Date(b.waktuTransaksi) - new Date(a.waktuTransaksi));
    },

    /**
     * Mencari detail pesanan berdasarkan ID Transaksi
     */
    cariBerdasarkanId: (idTransaksi) => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        return daftarPesanan.find(order => order.id === idTransaksi);
    },

    /**
     * Update status pesanan (Digunakan oleh Admin)
     * @param {string} idTransaksi 
     * @param {string} statusBaru ('Processing', 'Shipped', 'Delivered')
     */
    perbaruiStatus: (idTransaksi, statusBaru) => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        const index = daftarPesanan.findIndex(order => order.id === idTransaksi);
        
        if (index !== -1) {
            // Update status dan simpan kembali ke LocalStorage
            daftarPesanan[index].status = statusBaru;
            Storage.set(STORAGE_KEYS.ORDERS, daftarPesanan);
            
            // Logika opsional: Catat waktu perubahan status jika diperlukan
            daftarPesanan[index].lastUpdated = new Date().toISOString();
            
            return true;
        }
        
        return false;
    },

    /**
     * Menghitung total transaksi sukses untuk statistik admin
     */
    hitungTotalTransaksi: () => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        return daftarPesanan.length;
    }
};

// Ekspos ke global window agar dapat digunakan oleh modul lain (seperti admin.js)
window.PesananMandasari = PesananMandasari;