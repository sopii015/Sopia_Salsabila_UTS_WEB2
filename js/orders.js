/**
 * Mandasari Premium - Manajemen Transaksi & Pesanan
 */

const PesananMandasari = {
    init: () => {},

    ambilPesananPelanggan: () => {
        if (!MandasariAuth.isLoggedIn()) return [];
        
        const semuaPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        const userAktif = MandasariAuth.getUserAktif();
        
        return semuaPesanan
            .filter(order => order.customerId === userAktif.id)
            .sort((a, b) => new Date(b.waktuTransaksi) - new Date(a.waktuTransaksi));
    },

    cariBerdasarkanId: (idTransaksi) => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        return daftarPesanan.find(order => order.id === idTransaksi);
    },

    perbaruiStatus: (idTransaksi, statusBaru) => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        const index = daftarPesanan.findIndex(order => order.id === idTransaksi);
        
        if (index !== -1) {
            daftarPesanan[index].status = statusBaru;
            daftarPesanan[index].lastUpdated = new Date().toISOString();
            Storage.set(STORAGE_KEYS.ORDERS, daftarPesanan);
            return true;
        }
        return false;
    },

    hitungTotalTransaksi: () => {
        const daftarPesanan = Storage.get(STORAGE_KEYS.ORDERS) || [];
        return daftarPesanan.length;
    }
};

PesananMandasari.getUserOrders = PesananMandasari.ambilPesananPelanggan;
PesananMandasari.updateOrderStatus = PesananMandasari.perbaruiStatus;
window.Orders = PesananMandasari;
window.PesananMandasari = PesananMandasari;
