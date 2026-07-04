/**
 * Mandasari Premium - Keranjang Belanja Logic
 */

const KeranjangMandasari = {
    items: Storage.get(STORAGE_KEYS.CART) || [],

    init: () => {
        KeranjangMandasari.perbaruiBadgeNavigasi();
    },

    tambahProduk: (produk, jumlah = 1) => {
        if (!MandasariAuth.isLoggedIn()) {
            if (typeof Toast !== 'undefined') Toast.show('Silakan masuk akun untuk mulai belanja', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return false;
        }

        const itemAda = KeranjangMandasari.items.find(item => item.id === produk.id);

        if (itemAda) {
            if (itemAda.quantity + jumlah > produk.stock) {
                if (typeof Toast !== 'undefined') Toast.show('Maaf, stok kue tidak mencukupi', 'error');
                return false;
            }
            itemAda.quantity += jumlah;
        } else {
            if (jumlah > produk.stock) {
                if (typeof Toast !== 'undefined') Toast.show('Jumlah melebihi stok yang tersedia', 'error');
                return false;
            }
            KeranjangMandasari.items.push({
                id: produk.id,
                name: produk.name,
                price: produk.price,
                image: produk.image,
                stock: produk.stock,
                category: produk.category,
                quantity: jumlah
            });
        }

        KeranjangMandasari.simpanData();
        if (typeof Toast !== 'undefined') Toast.show(`${produk.name} berhasil masuk keranjang`, 'success');
        return true;
    },

    addById: (id, jumlah = 1) => {
        if (typeof KatalogMandasari !== 'undefined') {
            const produk = KatalogMandasari.ambilBerdasarkanId(id);
            if (produk) KeranjangMandasari.tambahProduk(produk, jumlah);
        }
    },

    hapusItem: (idProduk) => {
        表达 = KeranjangMandasari.items = KeranjangMandasari.items.filter(item => item.id !== idProduk);
        KeranjangMandasari.simpanData();
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
    },

    updateJumlah: (idProduk, jumlahBaru) => {
        const item = KeranjangMandasari.items.find(i => i.id === idProduk);
        if (!item) return false;

        if (jumlahBaru <= 0) {
            KeranjangMandasari.hapusItem(idProduk);
            return true;
        }

        if (jumlahBaru > item.stock) {
            if (typeof Toast !== 'undefined') Toast.show(`Hanya tersedia ${item.stock} porsi`, 'warning');
            item.quantity = item.stock;
        } else {
            item.quantity = jumlahBaru;
        }

        KeranjangMandasari.simpanData();
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
        return true;
    },

    kosongkan: () => {
        KeranjangMandasari.items = [];
        KeranjangMandasari.simpanData();
        window.dispatchEvent(new CustomEvent('update-tampilan-keranjang'));
    },

    hitungRingkasan: () => {
        const subtotal = KeranjangMandasari.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const biayaLayanan = 0; // Set ke 0 biar sinkron dengan checkout (Gratis Ongkir)
        const totalAkhir = subtotal + biayaLayanan;

        return { subtotal, biayaLayanan, totalAkhir };
    },

    formatRupiah: (angka) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(angka);
    },

    simpanData: () => {
        Storage.set(STORAGE_KEYS.CART, KeranjangMandasari.items);
        KeranjangMandasari.perbaruiBadgeNavigasi();
    },

    perbaruiBadgeNavigasi: () => {
        const badgeIds = ['cart-badge', 'cart-badge-desktop', 'cart-badge-mobile'];
        const totalKuantitas = KeranjangMandasari.items.reduce((acc, item) => acc + item.quantity, 0);

        badgeIds.forEach(id => {
            const badge = document.getElementById(id);
            if (badge) {
                if (totalKuantitas > 0) {
                    badge.textContent = totalKuantitas;
                    badge.classList.remove('hidden');
                } else {
                    badge.classList.add('hidden');
                }
            }
        });
    }
};

KeranjangMandasari.add = KeranjangMandasari.tambahProduk;
KeranjangMandasari.formatCurrency = KeranjangMandasari.formatRupiah;
window.Cart = KeranjangMandasari;
window.KeranjangMandasari = KeranjangMandasari;

window.addEventListener('DOMContentLoaded', KeranjangMandasari.init);
