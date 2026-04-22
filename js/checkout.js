/**
 * Mandasari Premium - Checkout & Order Processing
 */

const ProsesCheckout = {
    init: () => {
        // Cek jika keranjang kosong saat masuk ke halaman checkout
        if (KeranjangMandasari.items.length === 0) {
            Toast.show('Keranjang Anda masih kosong', 'warning');
            setTimeout(() => window.location.href = 'index.html', 2000);
        }
    },

    /**
     * Membuat ID Transaksi yang Unik
     * Format: MDS-YYMMDD-RANDOM (Contoh: MDS-260421-K8A9B)
     */
    buatIdTransaksi: () => {
        const tgl = new Date();
        const yy = tgl.getFullYear().toString().slice(-2);
        const mm = String(tgl.getMonth() + 1).padStart(2, '0');
        const dd = String(tgl.getDate()).padStart(2, '0');
        
        // String acak untuk mencegah duplikasi
        const karakter = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let randomStr = '';
        for (let i = 0; i < 5; i++) {
            randomStr += karakter.charAt(Math.floor(Math.random() * karakter.length));
        }

        return `MDS-${yy}${mm}${dd}-${randomStr}`;
    },

    /**
     * Memproses Pesanan Akhir
     */
    buatPesanan: (dataPengiriman, metodeBayar) => {
        // Validasi Sesi
        if (!MandasariAuth.isLoggedIn()) {
            Toast.show('Sesi berakhir, silakan login kembali', 'error');
            return false;
        }

        const itemKue = KeranjangMandasari.items;
        if (itemKue.length === 0) {
            Toast.show('Tidak ada produk untuk diproses', 'error');
            return false;
        }

        const ringkasan = KeranjangMandasari.hitungRingkasan();
        const user = MandasariAuth.getUserAktif();

        // Menyusun data pesanan baru
        const pesananBaru = {
            id: ProsesCheckout.buatIdTransaksi(),
            customerId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            waktuTransaksi: new Date().toISOString(),
            status: 'Processing', // Status awal: Diproses
            daftarItem: [...itemKue],
            pengiriman: {
                penerima: dataPengiriman.nama,
                telepon: dataPengiriman.hp,
                alamatLengkap: dataPengiriman.alamat,
                catatan: dataPengiriman.catatan || '-'
            },
            pembayaran: {
                metode: metodeBayar,
                status: 'Menunggu Verifikasi'
            },
            rincianBiaya: {
                subtotal: ringkasan.subtotal,
                layanan: ringkasan.biayaLayanan,
                totalBayar: ringkasan.totalAkhir
            }
        };

        // Simpan ke "Database" LocalStorage
        const totalDatabaseOrders = Storage.get(STORAGE_KEYS.ORDERS) || [];
        totalDatabaseOrders.push(pesananBaru);
        Storage.set(STORAGE_KEYS.ORDERS, totalDatabaseOrders);

        // Bersihkan keranjang setelah berhasil order
        KeranjangMandasari.kosongkan();

        return pesananBaru.id;
    }
};

// Daftarkan ke global window
window.ProsesCheckout = ProsesCheckout;