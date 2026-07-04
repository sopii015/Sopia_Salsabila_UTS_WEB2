/**
 * Mandasari Premium - Manajemen Produk Favorit (Wishlist)
 */

const FavoritMandasari = {
    init: () => {},

    ambilSemuaFavorit: () => {
        const daftarId = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        if (typeof KatalogMandasari !== 'undefined' && KatalogMandasari.semuaProduk.length > 0) {
            return daftarId
                .map(id => KatalogMandasari.ambilBerdasarkanId(id))
                .filter(produk => produk !== undefined);
        }
        return [];
    },

    hapusFavorit: (idProduk) => {
        let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        wishlist = wishlist.filter(id => id !== idProduk);
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        
        window.dispatchEvent(new Event('wishlist-updated'));
        window.dispatchEvent(new Event('favorit-diperbarui'));
        
        if (typeof Toast !== 'undefined') Toast.show('Dihapus dari daftar favorit', 'info');
    },

    apakahFavorit: (idProduk) => {
        const wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        return wishlist.includes(idProduk);
    },

    toggle: (idProduk) => {
        let wishlist = Storage.get(STORAGE_KEYS.WISHLIST) || [];
        const id = parseInt(idProduk);
        if (wishlist.includes(id)) {
            wishlist = wishlist.filter(item => item !== id);
            if (typeof Toast !== 'undefined') Toast.show('Dihapus dari favorit', 'info');
        } else {
            wishlist.push(id);
            if (typeof Toast !== 'undefined') Toast.show('Berhasil simpan ke favorit', 'success');
        }
        Storage.set(STORAGE_KEYS.WISHLIST, wishlist);
        window.dispatchEvent(new Event('wishlist-updated'));
        window.dispatchEvent(new Event('favorit-diperbarui'));
    }
};

FavoritMandasari.getItems = FavoritMandasari.ambilSemuaFavorit;
window.Wishlist = FavoritMandasari;
window.FavoritMandasari = FavoritMandasari;
