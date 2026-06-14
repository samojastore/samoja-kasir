// ========== HARGA ==========
const ECERAN = { "24s": 49000, "30s": 44000 };
const GROSIR = { "24s": 41000, "30s": 36000 };
const TAMBAH_LENGAN = { "pendek": 0, "panjang": 8000 };
const TAMBAH_UKURAN = { "2XL": 5000, "3XL": 11000, "4XL": 17000 };
const HARGA_SABLON = { "Logo": 10000, "A5": 15000, "A4": 25000, "A3": 35000, "none": 0 };

// Harga kaos per ukuran (berdasarkan tabel)
const harga30s = {
    pendek: {
        "XS": 40000, "S": 32500, "M": 35000, "L": 35000, "XL": 35000, "2XL": 37000,
        "S_Anak": 32500, "M_Anak": 35000, "L_Anak": 35000, "XL_Anak": 35000
    },
    panjang: {
        "XS": 48000, "S": 35000, "M": 40000, "L": 40000, "XL": 40000, "2XL": 42000,
        "S_Anak": 35000, "M_Anak": 40000, "L_Anak": 40000, "XL_Anak": 40000
    }
};
function getHargaKaos(jenis, lengan, ukuran) {
    let harga30 = (lengan === "pendek" ? harga30s.pendek[ukuran] : harga30s.panjang[ukuran]);
    if (!harga30) harga30 = (lengan === "pendek" ? 35000 : 40000);
    if (jenis === "30s") return harga30;
    else return Math.max(0, harga30 - 5000);
}

const sizeOptions = {
    dewasa: ["XS", "S", "M", "L", "XL", "2XL"],
    anak: ["S_Anak", "M_Anak", "L_Anak", "XL_Anak"]
};
const lenganOptions = ["pendek", "panjang"];

function getProducts() {
    let stored = localStorage.getItem("samoja_products");
    if (stored && stored !== "undefined") {
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
        aksi.style.textAlign="center";
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
        itemRows += `
            <tr>
                <td style="padding:4px 0">${s.productName}</td>
                <td style="padding:4px 8px; text-align:center">${s.qty}</td>
                <td style="padding:4px 8px; text-align:right">${hargaSatuan.toLocaleString()}</td>
                <td style="padding:4px 8px; text-align:right">${s.total.toLocaleString()}</td>
            </tr>
        `;
    } else {
        (s.items || []).forEach(item => {
            let detail = `${item.jenis === '24s' ? 'Cotton 24s' : 'Cotton 30s'} ${item.tipeUkuran === 'dewasa' ? 'Dewasa' : 'Anak'}`;
            if (item.warna) detail += `, ${item.warna}`;
            if (item.variasi && item.variasi.length) {
                let ukuranStr = item.variasi.map(v => `${v.ukuran} (${v.lengan === 'pendek' ? 'Pendek' : 'Panjang'}): ${v.qty}`).join(', ');
                detail += `, ${ukuranStr}`;
            }
            if (item.sablonDepan && item.sablonDepan !== 'none') detail += `, Sablon Depan:${item.sablonDepan}`;
            if (item.sablonBelakang && item.sablonBelakang !== 'none') detail += `, Sablon Belakang:${item.sablonBelakang}`;
            if (item.posisiDepan) detail += `, Posisi Depan:${item.posisiDepan}`;
            if (item.posisiBelakang) detail += `, Posisi Belakang:${item.posisiBelakang}`;
            let hargaSatuan = item.total / item.qty;
            itemRows += `
                <tr>
                    <td style="padding:4px 0">
                        Custom Design<br>
                        <small>${detail}</small>
                    </td>
                    <td style="padding:4px 8px; text-align:center">${item.qty}</td>
                    <td style="padding:4px 8px; text-align:right">${hargaSatuan.toLocaleString()}</td>
                    <td style="padding:4px 8px; text-align:right">${item.total.toLocaleString()}</td>
                </tr>
            `;
        });
    }
    win.document.write(`
        <html>
        <head>
            <title>Struk ${s.id}</title>
            <style>
                body { font-family: monospace; margin: 20px; }
                .struk { max-width: 380px; margin: auto; border: 1px solid #ccc; padding: 15px; }
                .header { text-align: center; margin-bottom: 15px; }
                .header h3 { margin: 0; }
                .header p { margin: 2px 0; font-size: 12px; }
                .garis { border-top: 1px dashed #000; margin: 8px 0; }
                table { width: 100%; border-collapse: collapse; font-size: 12px; }
                th, td { padding: 5px 0; }
                th { border-bottom: 1px solid #000; text-align: left; }
                .right { text-align: right; }
                .center { text-align: center; }
                .total { font-weight: bold; border-top: 1px solid #000; margin-top: 5px; padding-top: 5px; text-align: right; }
                .footer { text-align: center; margin-top: 10px; font-size: 11px; }
            </style>
        </head>
        <body>
            <div class="struk">
                <div class="header">
                    <h3>SAMOJA STORE</h3>
                    <p>Dusun Galumpit RT01/RW01</p>
                    <p>Desa Jatiroke, Kec. Jatinangor</p>
                    <p>Kab. Sumedang</p>
                </div>
                <div class="garis"></div>
                <p><strong>No.Order:</strong> ${s.id}</p>
                <p><strong>Customer:</strong> ${s.customer}</p>
                <p><strong>Tgl:</strong> ${new Date().toLocaleString()}</p>
                <div class="garis"></div>
                <table>
                    <thead><tr><th>Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Harga</th><th style="text-align:right">Total</th></tr></thead>
                    <tbody>${itemRows}</tbody>
                </table>
                <div class="total">Total: Rp ${s.total.toLocaleString()}</div>
                <div class="garis"></div>
                <div class="footer">TERIMA KASIH TELAH ORDER DI SAMOJA STORE</div>
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.print();
}

// ========== FUNGSI UNTUK CUSTOM ITEM DINAMIS (dengan lengan per baris) ==========
function createCustomItemRow(itemData = null) {
    let div = document.createElement("div");
    div.className = "custom-item";
    div.style.background = "#252525";
    div.style.padding = "15px";
    div.style.borderRadius = "20px";
    div.style.marginBottom = "15px";
    
    div.innerHTML = `
        <div class="row-dua" style="display:flex; gap:10px; margin-bottom:10px">
            <select class="itemJenis" style="flex:1">
                <option value="24s">Cotton Combed 24s</option>
                <option value="30s">Cotton Combed 30s</option>
            </select>
            <select class="itemTipeUkuran" style="flex:1">
                <option value="dewasa">Dewasa</option>
                <option value="anak">Anak</option>
            </select>
        </div>
        <input type="text" class="itemWarna" placeholder="Warna Kaos (opsional)" style="width:100%; margin-bottom:10px">
        
        <label>Variasi Ukuran & Lengan:</label>
        <div class="itemVariasiContainer" style="margin-top:5px"></div>
        <button type="button" class="addVariasiBtn btn-add" style="margin:8px 0">+ Tambah Ukuran</button>
        <div class="itemGrosirInfo" style="font-size:12px; color:#ffaa66; margin:5px 0"></div>
        <div class="row-dua" style="display:flex; gap:10px; margin-bottom:10px">
            <select class="itemSablonDepan" style="flex:1">
                <option value="none">Tidak ada sablon depan</option>
                <option value="Logo">Logo (Rp 10.000)</option>
                <option value="A5">A5 (Rp 15.000)</option>
                <option value="A4">A4 (Rp 25.000)</option>
                <option value="A3">A3 (Rp 35.000)</option>
            </select>
            <select class="itemSablonBelakang" style="flex:1">
                <option value="none">Tidak ada sablon belakang</option>
                <option value="A5">A5 (Rp 15.000)</option>
                <option value="A4">A4 (Rp 25.000)</option>
                <option value="A3">A3 (Rp 35.000)</option>
            </select>
        </div>
        <input type="text" class="itemPosisiDepan" placeholder="Posisi sablon depan" style="width:100%; margin-bottom:10px">
        <input type="text" class="itemPosisiBelakang" placeholder="Posisi sablon belakang" style="width:100%; margin-bottom:10px">
        <textarea class="itemCatatan" rows="1" placeholder="Catatan tambahan" style="width:100%; margin-bottom:10px"></textarea>
        <div class="itemTotalPreview" style="background:#1e1e1e; padding:8px; border-radius:20px; text-align:center; margin-top:8px">Total: Rp 0 (0 pcs)</div>
        <div style="display:flex; gap:10px; margin-top:10px">
            <button type="button" class="removeItemBtn btn-danger">✕ Hapus Item Custom Ini</button>
        </div>
    `;
    
    let variasiContainer = div.querySelector(".itemVariasiContainer");
    let tipeSelect = div.querySelector(".itemTipeUkuran");
    
    function addVariasiRow(ukuran = "S", lengan = "pendek", qty = 1) {
        let row = document.createElement("div");
        row.className = "size-row";
        row.style.display = "flex";
        row.style.gap = "10px";
        row.style.alignItems = "center";
        row.style.marginBottom = "10px";
        // select ukuran
        let sizeSelect = document.createElement("select");
        sizeSelect.className = "varSize";
        let currentTipe = tipeSelect.value;
        let options = sizeOptions[currentTipe];
        options.forEach(opt => {
            let option = document.createElement("option");
            option.value = opt;
            let display = (currentTipe === "dewasa") ? opt : opt.replace("_Anak", " Anak");
            option.innerText = display;
            sizeSelect.appendChild(option);
        });
        sizeSelect.value = ukuran;
        // select lengan
        let lenganSelect = document.createElement("select");
        lenganSelect.className = "varLengan";
        lenganOptions.forEach(l => {
            let opt = document.createElement("option");
            opt.value = l;
            opt.innerText = l === "pendek" ? "Lengan Pendek" : "Lengan Panjang";
            lenganSelect.appendChild(opt);
        });
        lenganSelect.value = lengan;
        // input qty
        let qtyInput = document.createElement("input");
        qtyInput.type = "number";
        qtyInput.className = "varQty";
        qtyInput.value = qty;
        qtyInput.min = 1;
        qtyInput.style.width = "100px";
        // remove button
        let removeBtn = document.createElement("button");
        removeBtn.type = "button";
        removeBtn.className = "removeVariasiBtn btn-danger";
        removeBtn.style.width = "36px";
        removeBtn.style.height = "36px";
        removeBtn.style.padding = "0";
        removeBtn.innerText = "✕";
        removeBtn.onclick = () => row.remove();
        row.appendChild(sizeSelect);
        row.appendChild(lenganSelect);
        row.appendChild(qtyInput);
        row.appendChild(removeBtn);
        variasiContainer.appendChild(row);
    }
    
    function refreshVariasiRows() {
        let currentTipe = tipeSelect.value;
        let rows = variasiContainer.querySelectorAll(".size-row");
        let selections = [];
        rows.forEach(row => {
            let size = row.querySelector(".varSize").value;
            let lengan = row.querySelector(".varLengan").value;
            let qty = row.querySelector(".varQty").value;
            selections.push({ size, lengan, qty });
        });
        variasiContainer.innerHTML = "";
        selections.forEach(sel => addVariasiRow(sel.size, sel.lengan, sel.qty));
        if (selections.length === 0) addVariasiRow("S", "pendek", 1);
        calculateItemTotal();
    }
    
    tipeSelect.addEventListener("change", refreshVariasiRows);
    
    if (itemData && itemData.variasi && itemData.variasi.length) {
        itemData.variasi.forEach(v => addVariasiRow(v.ukuran, v.lengan, v.qty));
    } else {
        addVariasiRow("S", "pendek", 1);
    }
    div.querySelector(".addVariasiBtn").onclick = () => addVariasiRow("S", "pendek", 1);
    
    function calculateItemTotal() {
        let jenis = div.querySelector(".itemJenis").value;
        let tipe = tipeSelect.value;
        let sablonDepan = div.querySelector(".itemSablonDepan").value;
        let sablonBelakang = div.querySelector(".itemSablonBelakang").value;
        let rows = div.querySelectorAll(".size-row");
        let totalQty = 0;
        let totalHarga = 0;
        rows.forEach(row => {
            let ukuran = row.querySelector(".varSize").value;
            let lengan = row.querySelector(".varLengan").value;
            let qty = parseInt(row.querySelector(".varQty").value) || 0;
            if (qty <= 0) return;
            totalQty += qty;
            let hargaKaos = getHargaKaos(jenis, lengan, ukuran);
            let biayaDepan = HARGA_SABLON[sablonDepan] || 0;
            let biayaBelakang = HARGA_SABLON[sablonBelakang] || 0;
            if ((sablonBelakang === "A3" || sablonBelakang === "A4") && sablonDepan === "Logo") biayaDepan = 0;
            let hargaPerPcs = hargaKaos + biayaDepan + biayaBelakang;
            totalHarga += hargaPerPcs * qty;
        });
        div.querySelector(".itemGrosirInfo").innerHTML = totalQty >= 12 ? "⭐ Harga grosir (≥12 pcs)" : "Harga eceran (<12 pcs)";
        div.querySelector(".itemTotalPreview").innerHTML = `Total: Rp ${totalHarga.toLocaleString()} (${totalQty} pcs)`;
        return { total: totalHarga, qty: totalQty };
    }
    
    let fields = [".itemJenis", ".itemSablonDepan", ".itemSablonBelakang"];
    fields.forEach(sel => div.querySelector(sel).addEventListener("change", calculateItemTotal));
    variasiContainer.addEventListener("change", calculateItemTotal);
    variasiContainer.addEventListener("input", calculateItemTotal);
    
    if (itemData) {
        div.querySelector(".itemJenis").value = itemData.jenis || "24s";
        div.querySelector(".itemTipeUkuran").value = itemData.tipeUkuran || "dewasa";
        div.querySelector(".itemWarna").value = itemData.warna || "";
        div.querySelector(".itemSablonDepan").value = itemData.sablonDepan || "none";
        div.querySelector(".itemSablonBelakang").value = itemData.sablonBelakang || "none";
        div.querySelector(".itemPosisiDepan").value = itemData.posisiDepan || "";
        div.querySelector(".itemPosisiBelakang").value = itemData.posisiBelakang || "";
        div.querySelector(".itemCatatan").value = itemData.catatan || "";
        if (itemData.variasi && itemData.variasi.length) {
            variasiContainer.innerHTML = "";
            itemData.variasi.forEach(v => addVariasiRow(v.ukuran, v.lengan, v.qty));
        }
        refreshVariasiRows();
    }
    calculateItemTotal();
    return div;
}

function addCustomItemToForm(itemData = null) {
    let container = document.getElementById("customItemsContainer");
    let newItem = createCustomItemRow(itemData);
    container.appendChild(newItem);
    newItem.querySelector(".removeItemBtn").onclick = () => newItem.remove();
}

function toggleOrderFields() {
    let type = document.getElementById("orderType").value;
    document.getElementById("readyFields").style.display = type === "ready" ? "block" : "none";
    document.getElementById("customFields").style.display = type === "custom" ? "block" : "none";
}
function calculateCustomTotal() {
    let items = document.querySelectorAll("#customItemsContainer .custom-item");
    let totalAll = 0;
    let totalQtyAll = 0;
    items.forEach(item => {
        let totalEl = item.querySelector(".itemTotalPreview");
        let match = totalEl.innerText.match(/Rp ([\d,]+)/);
        if (match) {
            let total = parseInt(match[1].replace(/,/g, ''));
            totalAll += total;
            let qtyMatch = totalEl.innerText.match(/\((\d+) pcs\)/);
            if (qtyMatch) totalQtyAll += parseInt(qtyMatch[1]);
        }
    });
    document.getElementById("customTotalPreview").innerHTML = `Total: Rp ${totalAll.toLocaleString()} (${totalQtyAll} pcs)`;
    return { total: totalAll, qty: totalQtyAll };
}
function showOrderForm(){
    document.getElementById("orderForm").style.display="block";
    document.getElementById("formTitle").innerText="Tambah Penjualan";
    document.getElementById("editId").value="";
    document.getElementById("orderId").value="";
    document.getElementById("customerName").value="";
    document.getElementById("orderType").value="ready";
    toggleOrderFields();
    let container = document.getElementById("customItemsContainer");
    container.innerHTML = "";
    addCustomItemToForm();
    document.getElementById("orderStatus").value="Diproses";
}
function saveOrder(){
    let isEdit = document.getElementById("editId").value!=="";
    let id = document.getElementById("orderId").value.trim();
    if(!id){ alert("ID wajib"); return; }
    let customer = document.getElementById("customerName").value.trim();
    if(!customer){ alert("Nama customer wajib"); return; }
    let type = document.getElementById("orderType").value;
    let status = document.getElementById("orderStatus").value;
    let total=0, qty=0, productName="", items=null;
    if(type==="ready"){
        let productId = parseInt(document.getElementById("productSelect").value);
        let products = getProducts();
        let product = products.find(p=>p.id===productId);
        if(!product) return;
        let size = document.getElementById("sizeSelect").value;
        let qtyReady = parseInt(document.getElementById("qtyReady").value);
        total = product.price * qtyReady;
        qty = qtyReady;
        productName = `${product.name} (${size})`;
    } else {
        items = [];
        let itemDivs = document.querySelectorAll("#customItemsContainer .custom-item");
        if(itemDivs.length === 0){ alert("Tambahkan minimal satu item custom"); return; }
        let totalAll = 0;
        let totalQtyAll = 0;
        for(let div of itemDivs){
            let jenis = div.querySelector(".itemJenis").value;
            let tipeUkuran = div.querySelector(".itemTipeUkuran").value;
            let warna = div.querySelector(".itemWarna").value.trim();
            let sablonDepan = div.querySelector(".itemSablonDepan").value;
            let sablonBelakang = div.querySelector(".itemSablonBelakang").value;
            let posisiDepan = div.querySelector(".itemPosisiDepan").value.trim();
            let posisiBelakang = div.querySelector(".itemPosisiBelakang").value.trim();
            let catatan = div.querySelector(".itemCatatan").value.trim();
            let variasi = [];
            let variasiRows = div.querySelectorAll(".size-row");
            for(let row of variasiRows){
                let ukuran = row.querySelector(".varSize").value;
                let lengan = row.querySelector(".varLengan").value;
                let jml = parseInt(row.querySelector(".varQty").value);
                if(jml>0) variasi.push({ ukuran, lengan, qty: jml });
            }
            if(variasi.length === 0){ alert("Setiap item minimal satu ukuran"); return; }
            let itemQty = variasi.reduce((a,b)=>a+b.qty,0);
            let itemTotal = 0;
            for(let v of variasi){
                let hargaKaos = getHargaKaos(jenis, v.lengan, v.ukuran);
                let biayaDepan = HARGA_SABLON[sablonDepan];
                let biayaBelakang = HARGA_SABLON[sablonBelakang];
                if((sablonBelakang==="A3"||sablonBelakang==="A4") && sablonDepan==="Logo") biayaDepan=0;
                let hargaPerPcs = hargaKaos + biayaDepan + biayaBelakang;
                itemTotal += hargaPerPcs * v.qty;
            }
            totalAll += itemTotal;
            totalQtyAll += itemQty;
            items.push({
                jenis, tipeUkuran, warna, sablonDepan, sablonBelakang,
                posisiDepan, posisiBelakang, catatan, variasi,
                total: itemTotal, qty: itemQty
            });
        }
        total = totalAll;
        qty = totalQtyAll;
        productName = "Custom Design";
    }
    if(!isEdit && sales.some(s=>s.id===id)){ alert("ID sudah ada!"); return; }
    let newSale = { id, customer, type, productName, qty, total, status };
    if(type==="custom") newSale.items = items;
    if(isEdit){
        let idx = sales.findIndex(s=>s.id===document.getElementById("editId").value);
        if(idx!==-1) sales[idx]=newSale;
    } else {
        sales.push(newSale);
    }
    sales.sort((a,b)=>b.id.localeCompare(a.id));
    saveSales();
    applySearch();
    cancelForm();
}
function cancelForm(){
    document.getElementById("orderForm").style.display="none";
}
function editOrder(id){
    let sale = sales.find(s=>s.id===id);
    if(!sale) return;
    document.getElementById("formTitle").innerText="Edit Penjualan";
    document.getElementById("editId").value=sale.id;
    document.getElementById("orderId").value=sale.id;
    document.getElementById("customerName").value=sale.customer;
    document.getElementById("orderType").value=sale.type;
    document.getElementById("orderStatus").value=sale.status;
    toggleOrderFields();
    if(sale.type==="ready"){
        let products = getProducts();
        let product = products.find(p=>sale.productName.includes(p.name));
        if(product) document.getElementById("productSelect").value=product.id;
        let sizeMatch = sale.productName.match(/\(([^)]+)\)/);
        if(sizeMatch) document.getElementById("sizeSelect").value=sizeMatch[1];
        document.getElementById("qtyReady").value=sale.qty;
    } else if(sale.type==="custom" && sale.items){
        let container = document.getElementById("customItemsContainer");
        container.innerHTML = "";
        sale.items.forEach(item => {
            let itemData = {
                jenis: item.jenis,
                tipeUkuran: item.tipeUkuran,
                warna: item.warna,
                sablonDepan: item.sablonDepan,
                sablonBelakang: item.sablonBelakang,
                posisiDepan: item.posisiDepan,
                posisiBelakang: item.posisiBelakang,
                catatan: item.catatan,
                variasi: item.variasi
            };
            addCustomItemToForm(itemData);
        });
        if(sale.items.length === 0) addCustomItemToForm();
    }
    document.getElementById("orderForm").style.display="block";
}
function populateProductSelect(){
    let sel = document.getElementById("productSelect");
    sel.innerHTML="";
    getProducts().forEach(p=>{
        let opt = document.createElement("option");
        opt.value=p.id;
        opt.innerText=`${p.name} - Rp ${p.price.toLocaleString()}`;
        sel.appendChild(opt);
    });
}
function applySearch(){
    let keyword = document.getElementById("searchInput").value.toLowerCase();
    let status = document.getElementById("statusFilter").value;
    filteredSales = sales.filter(s=> (s.id.toLowerCase().includes(keyword)||s.customer.toLowerCase().includes(keyword)) && (status===""||s.status===status) );
    currentPage=1;
    renderSales(filteredSales);
}
function resetSearch(){
    document.getElementById("searchInput").value="";
    document.getElementById("statusFilter").value="";
    applySearch();
}
document.addEventListener("DOMContentLoaded",()=>{
    loadSales();
    populateProductSelect();
    document.getElementById("tambahBtn").addEventListener("click",showOrderForm);
    document.getElementById("saveOrderBtn").addEventListener("click",saveOrder);
    document.getElementById("cancelFormBtn").addEventListener("click",cancelForm);
    document.getElementById("searchBtn").addEventListener("click",applySearch);
    document.getElementById("resetBtn").addEventListener("click",resetSearch);
    document.getElementById("orderType").addEventListener("change",toggleOrderFields);
    let addItemBtn = document.getElementById("addCustomItemBtn");
    if(addItemBtn) addItemBtn.addEventListener("click", () => addCustomItemToForm());
});