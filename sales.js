// ========== DATA HARGA ==========
const HARGA_SABLON = { "Logo": 10000, "A5": 15000, "A4": 25000, "A3": 35000, "none": 0 };
const dewasaPendek = {
    eceran: { "S": 44000, "M": 44000, "L": 44000, "XL": 44000, "2XL": 50000, "3XL": 54000, "4XL": 61000 },
    grosir:  { "S": 36000, "M": 36000, "L": 36000, "XL": 36000, "2XL": 41000, "3XL": 47000, "4XL": 53000 }
};
const dewasaPanjang = {
    eceran: { "S": 52000, "M": 52000, "L": 52000, "XL": 52000, "2XL": 57000, "3XL": 63000, "4XL": 69000 },
    grosir:  { "S": 44000, "M": 44000, "L": 44000, "XL": 44000, "2XL": 49000, "3XL": 55000, "4XL": 61000 }
};
const anakPendek = {
    eceran: { "XS_Anak": 40000, "S_Anak": 32500, "M_Anak": 35000, "L_Anak": 35000, "XL_Anak": 35000, "2XL_Anak": 37000 },
    grosir:  { "XS_Anak": 34000, "S_Anak": 26000, "M_Anak": 26000, "L_Anak": 26000, "XL_Anak": 26000, "2XL_Anak": 30000 }
};
const anakPanjang = {
    eceran: { "XS_Anak": 48000, "S_Anak": 40500, "M_Anak": 43000, "L_Anak": 43000, "XL_Anak": 43000, "2XL_Anak": 45000 },
    grosir:  { "XS_Anak": 42000, "S_Anak": 34000, "M_Anak": 34000, "L_Anak": 34000, "XL_Anak": 34000, "2XL_Anak": 38000 }
};
function getHargaKaos(jenis, tipe, ukuran, lengan, totalQty) {
    let efektif = (tipe === "anak") ? "30s" : jenis;
    let data;
    if (tipe === "dewasa") data = (lengan === "pendek") ? dewasaPendek : dewasaPanjang;
    else data = (lengan === "pendek") ? anakPendek : anakPanjang;
    let harga = (totalQty >= 12) ? data.grosir[ukuran] : data.eceran[ukuran];
    if (efektif === "24s") harga += 5000;
    return harga;
}
const sizeOptions = {
    dewasa: ["S","M","L","XL","2XL","3XL","4XL"],
    anak: ["XS_Anak","S_Anak","M_Anak","L_Anak","XL_Anak","2XL_Anak"]
};
const lenganOptions = ["pendek","panjang"];

function getProducts() {
    let stored = localStorage.getItem("samoja_products");
    if (stored) {
        try { let parsed = JSON.parse(stored); if (Array.isArray(parsed) && parsed.length) return parsed; } catch(e) {}
    }
    return [
        { id: 1, name: "Eren Yeager", price: 89000 },
        { id: 2, name: "RX-78-02 Gundam", price: 89000 },
        { id: 3, name: "Jiraiya", price: 89000 }
    ];
}

let sales = [], currentPage = 1, itemsPerPage = 10, filteredSales = [];

function loadSales() {
    let stored = localStorage.getItem("samoja_sales");
    sales = stored ? JSON.parse(stored) : [];
    sales.sort((a,b)=>b.id.localeCompare(a.id));
    applySearch();
}
function saveSales() { localStorage.setItem("samoja_sales", JSON.stringify(sales)); }
function renderSales(data) {
    let tbody = document.getElementById("ordersList");
    tbody.innerHTML = "";
    let start = (currentPage-1)*itemsPerPage, end = start+itemsPerPage;
    let pageData = data.slice(start, end);
    let totalAll = data.reduce((s,o)=>s+o.total,0);
    pageData.forEach(s => {
        let row = tbody.insertRow();
        row.insertCell(0).innerText = s.id;
        row.insertCell(1).innerText = s.customer;
        row.insertCell(2).innerText = s.type==="custom"? "[Custom] "+s.productName : s.productName;
        row.insertCell(3).innerText = s.qty;
        row.insertCell(4).innerText = "Rp "+s.total.toLocaleString();
        let statusCell = row.insertCell(5);
        statusCell.innerText = s.status;
        let aksi = row.insertCell(6);
        aksi.style.textAlign = "center";
        let editBtn = document.createElement("button");
        editBtn.innerHTML='<i class="fas fa-edit"></i>';
        editBtn.className="aksi-icon edit";
        editBtn.onclick=()=>editOrder(s.id);
        aksi.appendChild(editBtn);
        let printBtn = document.createElement("button");
        printBtn.innerHTML='<i class="fas fa-print"></i>';
        printBtn.className="aksi-icon print";
        printBtn.onclick=()=>printStruk(s);
        aksi.appendChild(printBtn);
        let delBtn = document.createElement("button");
        delBtn.innerHTML='<i class="fas fa-trash-alt"></i>';
        delBtn.className="aksi-icon delete";
        delBtn.onclick=()=>{ if(confirm("Hapus?")){ sales=sales.filter(x=>x.id!==s.id); saveSales(); applySearch(); } };
        aksi.appendChild(delBtn);
    });
    document.getElementById("totalRevenue").innerText = "Total Pendapatan: Rp "+totalAll.toLocaleString();
    renderPagination(data.length);
}
function renderPagination(total){
    let totalPages = Math.ceil(total/itemsPerPage);
    let div = document.getElementById("pagination");
    div.innerHTML="";
    if(totalPages<=1) return;
    for(let i=1;i<=totalPages;i++){
        let btn = document.createElement("button");
        btn.innerText=i;
        if(i===currentPage) btn.classList.add("active");
        btn.onclick=()=>{ currentPage=i; renderSales(filteredSales); };
        div.appendChild(btn);
    }
}
function printStruk(s) {
    let win = window.open('', '_blank', 'width=450,height=600');
    let itemRows = '';
    if (s.type === 'ready') {
        let hargaSatuan = s.total / s.qty;
        itemRows = `<tr><td style="padding:4px 0">${s.productName}</td><td style="padding:4px 8px;text-align:center">${s.qty}</td><td style="padding:4px 8px;text-align:right">${hargaSatuan.toLocaleString()}</td><td style="padding:4px 8px;text-align:right">${s.total.toLocaleString()}</td></tr>`;
    } else if (s.items) {
        let item = s.items[0];
        let detail = `${item.jenis === '24s' ? 'Cotton 24s' : 'Cotton 30s'} ${item.tipe === 'dewasa' ? 'Dewasa' : 'Anak'}`;
        if (item.warna) detail += `, ${item.warna}`;
        if (item.variasi && item.variasi.length) {
            let ukuranStr = item.variasi.map(v => `${v.ukuran.replace("_Anak"," Anak")} (${v.lengan === 'pendek' ? 'Pendek' : 'Panjang'}): ${v.qty}`).join(', ');
            detail += `, ${ukuranStr}`;
        }
        if (item.sablonDepan && item.sablonDepan !== 'none') detail += `, Sablon Depan:${item.sablonDepan}`;
        if (item.sablonBelakang && item.sablonBelakang !== 'none') detail += `, Sablon Belakang:${item.sablonBelakang}`;
        let hargaSatuan = item.total / item.qty;
        itemRows = `<tr><td style="padding:4px 0">Custom Design<br><small>${detail}</small></td><td style="padding:4px 8px;text-align:center">${item.qty}</td><td style="padding:4px 8px;text-align:right">${hargaSatuan.toLocaleString()}</td><td style="padding:4px 8px;text-align:right">${item.total.toLocaleString()}</tr></tr>`;
    }
    win.document.write(`
        <html><head><title>Struk ${s.id}</title><style>body{font-family:monospace;margin:20px}.struk{max-width:380px;margin:auto;border:1px solid #ccc;padding:15px}.header{text-align:center;margin-bottom:15px}.header h3{margin:0}.header p{margin:2px 0;font-size:12px}.garis{border-top:1px dashed #000;margin:8px 0}table{width:100%;border-collapse:collapse;font-size:12px}th,td{padding:5px 0}th{border-bottom:1px solid #000;text-align:left}.right{text-align:right}.center{text-align:center}.total{font-weight:bold;border-top:1px solid #000;margin-top:5px;padding-top:5px;text-align:right}.footer{text-align:center;margin-top:10px;font-size:11px}</style></head>
        <body><div class="struk"><div class="header"><h3>SAMOJA STORE</h3><p>Dusun Galumpit RT01/RW01</p><p>Desa Jatiroke, Kec. Jatinangor</p><p>Kab. Sumedang</p></div><div class="garis"></div><p><strong>No.Order:</strong> ${s.id}</p><p><strong>Customer:</strong> ${s.customer}</p><p><strong>Tgl:</strong> ${new Date().toLocaleString()}</p><div class="garis"></div>
        <table><thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Total</th></tr></thead><tbody>${itemRows}</tbody></table>
        <div class="total">Total: Rp ${s.total.toLocaleString()}</div><div class="garis"></div><div class="footer">TERIMA KASIH TELAH ORDER DI SAMOJA STORE</div></div></body></html>
    `);
    win.document.close();
    win.print();
}

// ========== FUNGSI UNTUK CUSTOM FORM ==========
function initCustomForm() {
    let container = document.getElementById("custVariasiContainer");
    container.innerHTML = "";
    let tipe = document.getElementById("custTipe").value;
    function addRow(ukuran = "", lengan = "pendek", qty = 1) {
        let row = document.createElement("div");
        row.className = "size-row";
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.marginBottom = "10px";
        let sizeSel = document.createElement("select");
        sizeOptions[tipe].forEach(opt => {
            let o = document.createElement("option");
            o.value = opt;
            o.innerText = (tipe === "dewasa") ? opt : opt.replace("_Anak"," Anak");
            sizeSel.appendChild(o);
        });
        if (ukuran) sizeSel.value = ukuran;
        let lenganSel = document.createElement("select");
        lenganOptions.forEach(l => {
            let o = document.createElement("option");
            o.value = l;
            o.innerText = l === "pendek" ? "Lengan Pendek" : "Lengan Panjang";
            lenganSel.appendChild(o);
        });
        lenganSel.value = lengan;
        let qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.value = qty;
        qtyInput.min = 1;
        qtyInput.style.width = "80px";
        let rmBtn = document.createElement("button");
        rmBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
        rmBtn.className = "btn-danger";
        rmBtn.onclick = () => { row.remove(); hitungCustomTotal(); };
        row.appendChild(sizeSel);
        row.appendChild(lenganSel);
        row.appendChild(qtyInput);
        row.appendChild(rmBtn);
        container.appendChild(row);
    }
    addRow();
    document.getElementById("tambahVariasiBtn").onclick = () => addRow();
    function hitungCustomTotal() {
        let jenis = document.getElementById("custJenis").value;
        let tipe = document.getElementById("custTipe").value;
        let sablonDepan = document.getElementById("custSablonDepan").value;
        let sablonBelakang = document.getElementById("custSablonBelakang").value;
        let rows = document.querySelectorAll("#custVariasiContainer .size-row");
        let totalQty = 0, totalHarga = 0;
        rows.forEach(row => {
            let ukuran = row.querySelector("select:first-child").value;
            let lengan = row.querySelector("select:nth-child(2)").value;
            let qty = parseInt(row.querySelector("input").value) || 0;
            if (qty <= 0) return;
            totalQty += qty;
            let hargaKaos = getHargaKaos(jenis, tipe, ukuran, lengan, totalQty);
            let biayaDepan = HARGA_SABLON[sablonDepan];
            let biayaBelakang = HARGA_SABLON[sablonBelakang];
            if ((sablonBelakang === "A3" || sablonBelakang === "A4") && sablonDepan === "Logo") biayaDepan = 0;
            totalHarga += (hargaKaos + biayaDepan + biayaBelakang) * qty;
        });
        document.getElementById("custGrosirInfo").innerHTML = totalQty >= 12 ? "⭐ Harga grosir (≥12 pcs)" : "Harga eceran (<12 pcs)";
        document.getElementById("custTotalPreview").innerHTML = `Total: Rp ${totalHarga.toLocaleString()} (${totalQty} pcs)`;
        return { total: totalHarga, qty: totalQty };
    }
    document.getElementById("custJenis").addEventListener("change", hitungCustomTotal);
    document.getElementById("custTipe").addEventListener("change", () => {
        let newTipe = document.getElementById("custTipe").value;
        let rows = document.querySelectorAll("#custVariasiContainer .size-row");
        rows.forEach(row => {
            let select = row.querySelector("select:first-child");
            let currentVal = select.value;
            select.innerHTML = "";
            sizeOptions[newTipe].forEach(opt => {
                let o = document.createElement("option");
                o.value = opt;
                o.innerText = (newTipe === "dewasa") ? opt : opt.replace("_Anak"," Anak");
                select.appendChild(o);
            });
            if (sizeOptions[newTipe].includes(currentVal)) select.value = currentVal;
            else select.value = sizeOptions[newTipe][0];
        });
        hitungCustomTotal();
    });
    document.getElementById("custSablonDepan").addEventListener("change", hitungCustomTotal);
    document.getElementById("custSablonBelakang").addEventListener("change", hitungCustomTotal);
    document.getElementById("custVariasiContainer").addEventListener("change", hitungCustomTotal);
    document.getElementById("custVariasiContainer").addEventListener("input", hitungCustomTotal);
    hitungCustomTotal();
}

// ========== HANDLER FORM ==========
function toggleOrderFields() {
    let type = document.getElementById("orderType").value;
    document.getElementById("readyFields").style.display = type === "ready" ? "block" : "none";
    let customDiv = document.getElementById("customFields");
    if (type === "custom") {
        customDiv.style.display = "block";
        if (customDiv.children.length === 0 || !document.getElementById("custVariasiContainer") || document.getElementById("custVariasiContainer").children.length === 0) {
            initCustomForm();
        }
    } else {
        customDiv.style.display = "none";
    }
}
function showOrderForm() {
    document.getElementById("orderForm").style.display = "block";
    document.getElementById("formTitle").innerText = "Tambah Penjualan";
    document.getElementById("editId").value = "";
    document.getElementById("orderId").value = "";
    document.getElementById("customerName").value = "";
    document.getElementById("orderType").value = "ready";
    toggleOrderFields();
    document.getElementById("orderStatus").value = "Diproses";
}
function cancelForm() {
    document.getElementById("orderForm").style.display = "none";
}
function saveOrder() {
    let isEdit = document.getElementById("editId").value !== "";
    let id = document.getElementById("orderId").value.trim();
    if (!id) { alert("ID wajib"); return; }
    let customer = document.getElementById("customerName").value.trim();
    if (!customer) { alert("Nama customer wajib"); return; }
    let type = document.getElementById("orderType").value;
    let status = document.getElementById("orderStatus").value;
    let total = 0, qty = 0, productName = "", items = null;
    if (type === "ready") {
        let productId = parseInt(document.getElementById("productSelect").value);
        let product = getProducts().find(p => p.id === productId);
        if (!product) return;
        let size = document.getElementById("sizeSelect").value;
        let qtyReady = parseInt(document.getElementById("qtyReady").value);
        total = product.price * qtyReady;
        qty = qtyReady;
        productName = `${product.name} (${size})`;
    } else {
        let jenis = document.getElementById("custJenis").value;
        let tipe = document.getElementById("custTipe").value;
        let warna = document.getElementById("custWarna").value.trim();
        let sablonDepan = document.getElementById("custSablonDepan").value;
        let sablonBelakang = document.getElementById("custSablonBelakang").value;
        let posisiDepan = document.getElementById("custPosisiDepan").value.trim();
        let posisiBelakang = document.getElementById("custPosisiBelakang").value.trim();
        let catatan = document.getElementById("custCatatan").value.trim();
        let variasi = [];
        let rows = document.querySelectorAll("#custVariasiContainer .size-row");
        for (let row of rows) {
            let ukuran = row.querySelector("select:first-child").value;
            let lengan = row.querySelector("select:nth-child(2)").value;
            let jml = parseInt(row.querySelector("input").value);
            if (jml > 0) variasi.push({ ukuran, lengan, qty: jml });
        }
        if (variasi.length === 0) { alert("Minimal satu ukuran"); return; }
        let itemQty = variasi.reduce((a,b)=>a+b.qty,0);
        let itemTotal = 0;
        for (let v of variasi) {
            let hargaKaos = getHargaKaos(jenis, tipe, v.ukuran, v.lengan, itemQty);
            let biayaDepan = HARGA_SABLON[sablonDepan];
            let biayaBelakang = HARGA_SABLON[sablonBelakang];
            if ((sablonBelakang === "A3" || sablonBelakang === "A4") && sablonDepan === "Logo") biayaDepan = 0;
            itemTotal += (hargaKaos + biayaDepan + biayaBelakang) * v.qty;
        }
        total = itemTotal;
        qty = itemQty;
        productName = "Custom Design";
        items = [{
            jenis: (tipe === "anak") ? "30s" : jenis,
            tipe, warna, sablonDepan, sablonBelakang,
            posisiDepan, posisiBelakang, catatan, variasi,
            total: itemTotal, qty: itemQty
        }];
    }
    if (!isEdit && sales.some(s => s.id === id)) { alert("ID sudah ada!"); return; }
    let newSale = { id, customer, type, productName, qty, total, status };
    if (type === "custom") newSale.items = items;
    if (isEdit) {
        let idx = sales.findIndex(s => s.id === document.getElementById("editId").value);
        if (idx !== -1) sales[idx] = newSale;
    } else {
        sales.push(newSale);
    }
    sales.sort((a,b) => b.id.localeCompare(a.id));
    saveSales();
    applySearch();
    cancelForm();
}
function editOrder(id) {
    let sale = sales.find(s => s.id === id);
    if (!sale) return;
    document.getElementById("formTitle").innerText = "Edit Penjualan";
    document.getElementById("editId").value = sale.id;
    document.getElementById("orderId").value = sale.id;
    document.getElementById("customerName").value = sale.customer;
    document.getElementById("orderType").value = sale.type;
    document.getElementById("orderStatus").value = sale.status;
    toggleOrderFields();
    if (sale.type === "ready") {
        let products = getProducts();
        let product = products.find(p => sale.productName.includes(p.name));
        if (product) document.getElementById("productSelect").value = product.id;
        let sizeMatch = sale.productName.match(/\(([^)]+)\)/);
        if (sizeMatch) document.getElementById("sizeSelect").value = sizeMatch[1];
        document.getElementById("qtyReady").value = sale.qty;
    } else if (sale.type === "custom" && sale.items && sale.items.length) {
        let item = sale.items[0];
        document.getElementById("custJenis").value = item.jenis;
        document.getElementById("custTipe").value = item.tipe;
        document.getElementById("custWarna").value = item.warna || "";
        document.getElementById("custSablonDepan").value = item.sablonDepan || "none";
        document.getElementById("custSablonBelakang").value = item.sablonBelakang || "none";
        document.getElementById("custPosisiDepan").value = item.posisiDepan || "";
        document.getElementById("custPosisiBelakang").value = item.posisiBelakang || "";
        document.getElementById("custCatatan").value = item.catatan || "";
        let container = document.getElementById("custVariasiContainer");
        container.innerHTML = "";
        item.variasi.forEach(v => {
            let tipe = item.tipe;
            let row = document.createElement("div");
            row.className = "size-row";
            row.style.display = "flex";
            row.style.gap = "10px";
            row.style.marginBottom = "10px";
            let sizeSel = document.createElement("select");
            sizeOptions[tipe].forEach(opt => {
                let o = document.createElement("option");
                o.value = opt;
                o.innerText = (tipe === "dewasa") ? opt : opt.replace("_Anak"," Anak");
                sizeSel.appendChild(o);
            });
            sizeSel.value = v.ukuran;
            let lenganSel = document.createElement("select");
            lenganOptions.forEach(l => {
                let o = document.createElement("option");
                o.value = l;
                o.innerText = l === "pendek" ? "Lengan Pendek" : "Lengan Panjang";
                lenganSel.appendChild(o);
            });
            lenganSel.value = v.lengan;
            let qtyInput = document.createElement("input");
            qtyInput.type = "number";
            qtyInput.value = v.qty;
            qtyInput.min = 1;
            qtyInput.style.width = "80px";
            let rmBtn = document.createElement("button");
            rmBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            rmBtn.className = "btn-danger";
            rmBtn.onclick = () => row.remove();
            row.appendChild(sizeSel);
            row.appendChild(lenganSel);
            row.appendChild(qtyInput);
            row.appendChild(rmBtn);
            container.appendChild(row);
        });
        if (item.variasi.length === 0) {
            let row = document.createElement("div");
            row.className = "size-row";
            row.innerHTML = `<select><option>S</option><option>M</option><option>L</option><option>XL</option></select><select><option>Lengan Pendek</option><option>Lengan Panjang</option></select><input type="number" value="1" min="1"><button class="btn-danger"><i class="fas fa-trash-alt"></i></button>`;
            container.appendChild(row);
        }
        document.getElementById("tambahVariasiBtn").onclick = () => {
            let tipe = document.getElementById("custTipe").value;
            let row = document.createElement("div");
            row.className = "size-row";
            row.style.display = "flex";
            row.style.gap = "10px";
            row.style.marginBottom = "10px";
            let sizeSel = document.createElement("select");
            sizeOptions[tipe].forEach(opt => {
                let o = document.createElement("option");
                o.value = opt;
                o.innerText = (tipe === "dewasa") ? opt : opt.replace("_Anak"," Anak");
                sizeSel.appendChild(o);
            });
            let lenganSel = document.createElement("select");
            lenganOptions.forEach(l => {
                let o = document.createElement("option");
                o.value = l;
                o.innerText = l === "pendek" ? "Lengan Pendek" : "Lengan Panjang";
                lenganSel.appendChild(o);
            });
            let qtyInput = document.createElement("input");
            qtyInput.type = "number";
            qtyInput.value = 1;
            qtyInput.min = 1;
            qtyInput.style.width = "80px";
            let rmBtn = document.createElement("button");
            rmBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            rmBtn.className = "btn-danger";
            rmBtn.onclick = () => row.remove();
            row.appendChild(sizeSel);
            row.appendChild(lenganSel);
            row.appendChild(qtyInput);
            row.appendChild(rmBtn);
            container.appendChild(row);
        };
        let hitung = () => {
            let totalQty = 0;
            document.querySelectorAll("#custVariasiContainer .size-row input").forEach(inp => totalQty += parseInt(inp.value) || 0);
            document.getElementById("custJenis").dispatchEvent(new Event('change'));
        };
        document.getElementById("custVariasiContainer").addEventListener("change", hitung);
        document.getElementById("custVariasiContainer").addEventListener("input", hitung);
        hitung();
    }
    document.getElementById("orderForm").style.display = "block";
}
function populateProductSelect() {
    let sel = document.getElementById("productSelect");
    if (!sel) return;
    sel.innerHTML = "";
    getProducts().forEach(p => {
        let opt = document.createElement("option");
        opt.value = p.id;
        opt.innerText = `${p.name} - Rp ${p.price.toLocaleString()}`;
        sel.appendChild(opt);
    });
}
function applySearch() {
    let keyword = document.getElementById("searchInput").value.toLowerCase();
    let status = document.getElementById("statusFilter").value;
    filteredSales = sales.filter(s => (s.id.toLowerCase().includes(keyword) || s.customer.toLowerCase().includes(keyword)) && (status === "" || s.status === status));
    currentPage = 1;
    renderSales(filteredSales);
}
function resetSearch() {
    document.getElementById("searchInput").value = "";
    document.getElementById("statusFilter").value = "";
    applySearch();
}

// ========== INITIALIZATION ==========
document.addEventListener("DOMContentLoaded", () => {
    loadSales();
    populateProductSelect();
    
    // Dipastikan tombol ditemukan dan event listener dipasang
    const tambahBtn = document.getElementById("tambahBtn");
    if (tambahBtn) {
        tambahBtn.onclick = showOrderForm;
    }

    document.getElementById("saveOrderBtn").addEventListener("click", saveOrder);
    document.getElementById("cancelFormBtn").addEventListener("click", cancelForm);
    document.getElementById("searchBtn").addEventListener("click", applySearch);
    document.getElementById("resetBtn").addEventListener("click", resetSearch);
    document.getElementById("orderType").addEventListener("change", toggleOrderFields);
});