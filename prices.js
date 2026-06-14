// ========== DATA HARGA ECERAN & GROSIR ==========
// Dewasa - Lengan Pendek
const dewasaPendek = {
    eceran: { "S": 44000, "M": 44000, "L": 44000, "XL": 44000, "2XL": 50000, "3XL": 54000, "4XL": 61000 },
    grosir:  { "S": 36000, "M": 36000, "L": 36000, "XL": 36000, "2XL": 41000, "3XL": 47000, "4XL": 53000 }
};
// Dewasa - Lengan Panjang
const dewasaPanjang = {
    eceran: { "S": 52000, "M": 52000, "L": 52000, "XL": 52000, "2XL": 57000, "3XL": 63000, "4XL": 69000 },
    grosir:  { "S": 44000, "M": 44000, "L": 44000, "XL": 44000, "2XL": 49000, "3XL": 55000, "4XL": 61000 }
};
// Anak - Lengan Pendek
const anakPendek = {
    eceran: { "XS_Anak": 40000, "S_Anak": 32500, "M_Anak": 35000, "L_Anak": 35000, "XL_Anak": 35000, "2XL_Anak": 37000 },
    grosir:  { "XS_Anak": 34000, "S_Anak": 26000, "M_Anak": 26000, "L_Anak": 26000, "XL_Anak": 26000, "2XL_Anak": 30000 }
};
// Anak - Lengan Panjang
const anakPanjang = {
    eceran: { "XS_Anak": 48000, "S_Anak": 40500, "M_Anak": 43000, "L_Anak": 43000, "XL_Anak": 43000, "2XL_Anak": 45000 },
    grosir:  { "XS_Anak": 42000, "S_Anak": 34000, "M_Anak": 34000, "L_Anak": 34000, "XL_Anak": 34000, "2XL_Anak": 38000 }
};

// Fungsi untuk mendapatkan harga kaos berdasarkan parameter
function getHargaKaos(jenis, tipe, ukuran, lengan, totalQty) {
    let data;
    if (tipe === "dewasa") {
        data = (lengan === "pendek") ? dewasaPendek : dewasaPanjang;
    } else {
        data = (lengan === "pendek") ? anakPendek : anakPanjang;
    }
    let harga = (totalQty >= 12) ? data.grosir[ukuran] : data.eceran[ukuran];
    if (jenis === "24s") harga += 5000;
    return harga;
}

// Opsi ukuran yang tersedia
const sizeOptions = {
    dewasa: ["S", "M", "L", "XL", "2XL", "3XL", "4XL"],
    anak: ["XS_Anak", "S_Anak", "M_Anak", "L_Anak", "XL_Anak", "2XL_Anak"]
};
const lenganOptions = ["pendek", "panjang"];

// Harga sablon (tetap)
const HARGA_SABLON = { "Logo": 10000, "A5": 15000, "A4": 25000, "A3": 35000, "none": 0 };