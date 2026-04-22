/**
 * Mandasari Premium - Manajemen Produk Favorit (Wishlist)
 */

const FavoritMandasari = {
    init: () => {
        // Inisialisasi jika diperlukan saat halaman wishlist dibuka
    },

    /**
     * Mengambil daftar produk favorit lengkap dengan detailnya
     */
    ambilSemuaFavorit: () => {
        const daftarId = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        
        // Pastikan modul KatalogMandasari sudah memuat data produk
        if (typeof KatalogMandasari !== 'undefined' && KatalogMandasari.semuaProduk.length > 0) {
            return daftarId
                .map(id => KatalogMandasari.ambilBerdasarkanId(id))
                .filter(produk => produk !== undefined);
        }
        return [];
    },

    /**
     * Menghapus produk dari daftar favorit
     * @param {number} idProduk 
     */
    hapusFavorit: (idProduk) => {
        let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        wishlist = wishlist.filter(id => id !== idProduk);
        
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        
        // Kirim sinyal ke UI untuk memperbarui tampilan halaman favorit
        window.dispatchEvent(new Event('favorit-diperbarui'));
        
        if (typeof Toast !== 'undefined') {
            Toast.show('Dihapus dari daftar favorit', 'info');
        }
    },

    /**
     * Mengecek apakah sebuah produk ada di dalam wishlist
     */
    apakahFavorit: (idProduk) => {
        const wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        return wishlist.includes(idProduk);
    }
};

/**
 * Listener untuk event global 'toggle-wishlist'
 * Event ini biasanya dikirim dari kartu produk (KatalogMandasari)
 */
window.addEventListener('toggle-wishlist', (e) => {
    const idProduk = parseInt(e.detail.productId);
    let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
    
    if (wishlist.includes(idProduk)) {
        // Jika sudah ada, maka hapus (Unlike)
        wishlist = wishlist.filter(id => id !== idProduk);
        if (typeof Toast !== 'undefined') Toast.show('Dihapus dari favorit', 'info');
    } else {
        // Jika belum ada, tambahkan (Like)
        wishlist.push(idProduk);
        if (typeof Toast !== 'undefined') Toast.show('Berhasil simpan ke favorit', 'success');
    }
    
    Storage.set(STORAGE_KEYS.WISHLIST, wishlist);

    // Beri sedikit jeda sebelum memicu re-render agar animasi terasa pas
    setTimeout(() => {
        window.dispatchEvent(new Event('favorit-diperbarui'));
    }, 100);
});

// Ekspos ke global
window.FavoritMandasari = FavoritMandasari;