let expenses = [], currentPage = 1, itemsPerPage = 10, filteredExpenses = [];

function generateExpenseId(){
    let now = new Date();
    let yy = now.getFullYear().toString().slice(-2);
    let mm = String(now.getMonth()+1).padStart(2,'0');
    let dd = String(now.getDate()).padStart(2,'0');
    let rand = Math.floor(Math.random()*1000).toString().padStart(3,'0');
    return `EXP-${yy}${mm}${dd}-${rand}`;
}
function loadExpenses(){
    let stored = localStorage.getItem("samoja_expenses");
    expenses = stored ? JSON.parse(stored) : [];
    expenses.sort((a,b)=>b.id.localeCompare(a.id));
    applySearch();
}
function saveExpenses(){ localStorage.setItem("samoja_expenses", JSON.stringify(expenses)); }

function renderExpenses(data){
    let tbody = document.getElementById("expensesList");
    tbody.innerHTML = "";
    let start = (currentPage-1)*itemsPerPage, end = start+itemsPerPage;
    let pageData = data.slice(start, end);
    let totalAll = data.reduce((sum,e)=>sum+e.amount,0);
    pageData.forEach(exp=>{
        let row = tbody.insertRow();
        row.insertCell(0).innerText = exp.id;
        row.insertCell(1).innerText = exp.category;
        let desc = "";
        if(exp.category==="Kaos" && exp.items){
            desc = exp.items.map(it=>`${it.bahan} ${it.model} (${it.warna.map(w=>`${w.warna}:${w.qty}`).join(", ")})`).join("; ");
        } else if(exp.category==="DTF"){
            desc = exp.dtfDesc || "";
            if(exp.dtfMeter) desc += ` (${exp.dtfMeter} m, @${exp.dtfPricePerMeter})`;
        } else desc = exp.simpleDesc || "";
        row.insertCell(2).innerText = desc;
        row.insertCell(3).innerText = "Rp "+exp.amount.toLocaleString();
        row.insertCell(4).innerText = exp.date || "-";
        row.insertCell(5).innerText = exp.note || "-";
        let aksi = row.insertCell(6);
        aksi.style.textAlign="center";
        let editBtn = document.createElement("button");
        editBtn.innerHTML='<i class="fas fa-edit"></i>';
        editBtn.className="aksi-icon edit";
        editBtn.onclick=()=>editExpense(exp.id);
        aksi.appendChild(editBtn);
        let printBtn = document.createElement("button");
        printBtn.innerHTML='<i class="fas fa-print"></i>';
        printBtn.className="aksi-icon print";
        printBtn.onclick=()=>printStruk(exp);
        aksi.appendChild(printBtn);
        let delBtn = document.createElement("button");
        delBtn.innerHTML='<i class="fas fa-trash-alt"></i>';
        delBtn.className="aksi-icon delete";
        delBtn.onclick=()=>{ if(confirm("Hapus?")){ expenses=expenses.filter(x=>x.id!==exp.id); saveExpenses(); applySearch(); } };
        aksi.appendChild(delBtn);
    });
    document.getElementById("totalExpenses").innerText = "Total Pengeluaran: Rp "+totalAll.toLocaleString();
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
        btn.onclick=()=>{ currentPage=i; renderExpenses(filteredExpenses); };
        div.appendChild(btn);
    }
}
function printStruk(exp){
    let win = window.open('','_blank','width=400,height=500');
    let detail="";
    if(exp.category==="Kaos" && exp.items){
        detail+="<ul>";
        exp.items.forEach(it=>{
            detail+=`<li><strong>${it.bahan} ${it.model}</strong><ul>`;
            it.warna.forEach(w=>{ detail+=`<li>${w.warna}: ${w.qty} pcs</li>`; });
            detail+=`</ul></li>`;
        });
        detail+="</ul>";
    } else if(exp.category==="DTF"){
        detail+=`<p>${exp.dtfDesc}</p>`;
        if(exp.dtfMeter) detail+=`<p>Meter: ${exp.dtfMeter} m</p>`;
        if(exp.dtfPricePerMeter) detail+=`<p>Harga/m: Rp ${parseFloat(exp.dtfPricePerMeter).toLocaleString()}</p>`;
    } else detail+=`<p>${exp.simpleDesc}</p>`;
    win.document.write(`
        <html><head><title>Catatan ${exp.id}</title><style>body{font-family:monospace;margin:20px}.struk{border:1px solid #ccc;padding:15px}.garis{border-top:1px dashed #000;margin:10px 0}</style></head>
        <body><div class="struk"><div class="header"><h3>SAMOJA</h3><p>Catatan Pengeluaran</p></div><div class="garis"></div>
        <p><strong>ID:</strong> ${exp.id}</p><p><strong>Kategori:</strong> ${exp.category}</p>${detail}
        <p><strong>Total:</strong> Rp ${exp.amount.toLocaleString()}</p><p><strong>Tanggal:</strong> ${exp.date||"-"}</p>
        <p><strong>Catatan:</strong> ${exp.note||"-"}</p><div class="garis"></div><p>Terima kasih</p></div></body></html>
    `);
    win.document.close(); win.print();
}

function createKaosItemRow(bahanVal, modelVal, warnaArray){
    let div = document.createElement("div");
    div.className = "kaos-item";
    div.innerHTML = `
        <div class="row-dua">
            <select class="bahan">
                <option value="Cotton Combed 24s">Cotton Combed 24s</option>
                <option value="Cotton Combed 30s">Cotton Combed 30s</option>
            </select>
            <select class="model">
                <option value="Reguler">Reguler</option>
                <option value="Oversized">Oversized</option>
            </select>
        </div>
        <div class="warna-container"></div>
        <div style="display:flex; gap:10px; margin-top:8px;">
            <button type="button" class="add-color-btn btn-small btn-add">+ Tambah Warna</button>
            <button type="button" class="removeKaosItem btn-small btn-danger">✕ Hapus Baris Kaos</button>
        </div>
    `;
    div.querySelector(".bahan").value = bahanVal;
    div.querySelector(".model").value = modelVal;
    let warnaContainer = div.querySelector(".warna-container");
    function addWarnaRow(warna = "", qty = 1){
        let warnaRow = document.createElement("div");
        warnaRow.className = "color-row";
        warnaRow.innerHTML = `
            <input type="text" class="warna-input" placeholder="Warna" value="${warna}">
            <input type="number" class="qty-input" placeholder="Jumlah" min="1" value="${qty}">
            <button type="button" class="removeColorBtn btn-danger">✕</button>
        `;
        warnaRow.querySelector(".removeColorBtn").onclick = () => warnaRow.remove();
        warnaContainer.appendChild(warnaRow);
    }
    if(warnaArray && warnaArray.length){
        warnaArray.forEach(w => addWarnaRow(w.warna, w.qty));
    } else {
        addWarnaRow("", 1);
    }
    div.querySelector(".add-color-btn").onclick = () => addWarnaRow("", 1);
    div.querySelector(".removeKaosItem").onclick = () => {
        if(document.querySelectorAll(".kaos-item").length > 1){
            div.remove();
        } else {
            alert("Minimal satu baris item kaos");
        }
    };
    return div;
}

function addDefaultKaosRow(){
    let container = document.getElementById("kaosItemsContainer");
    let newRow = createKaosItemRow("Cotton Combed 24s", "Reguler", null);
    container.appendChild(newRow);
}

function toggleCategoryFields(){
    let cat = document.getElementById("expenseCategory").value;
    let kaosDiv = document.getElementById("kaosFields");
    let dtfDiv = document.getElementById("dtfFields");
    let simpleDiv = document.getElementById("simpleFields");
    kaosDiv.style.display = "none";
    dtfDiv.style.display = "none";
    simpleDiv.style.display = "none";
    if(cat === "Kaos"){
        kaosDiv.style.display = "block";
        if(document.querySelectorAll(".kaos-item").length === 0){
            addDefaultKaosRow();
        }
    } else if(cat === "DTF"){
        dtfDiv.style.display = "block";
        let meter = document.getElementById("dtfMeter");
        let price = document.getElementById("dtfPricePerMeter");
        let amount = document.getElementById("expenseAmount");
        let updateTotal = () => {
            let m = parseFloat(meter.value) || 0;
            let p = parseFloat(price.value) || 0;
            let total = m * p;
            if(total > 0) amount.value = total;
        };
        meter.removeEventListener("input", updateTotal);
        price.removeEventListener("input", updateTotal);
        meter.addEventListener("input", updateTotal);
        price.addEventListener("input", updateTotal);
    } else {
        simpleDiv.style.display = "block";
    }
}

function cancelForm(){
    document.getElementById("expenseForm").style.display = "none";
}

function showExpenseForm(){
    cancelForm();
    document.getElementById("expenseForm").style.display = "block";
    document.getElementById("formTitle").innerText = "Tambah Pengeluaran";
    document.getElementById("editId").value = "";
    document.getElementById("expenseId").value = generateExpenseId();
    document.getElementById("expenseCategory").value = "Kaos";
    let container = document.getElementById("kaosItemsContainer");
    container.innerHTML = "";
    addDefaultKaosRow();
    document.getElementById("dtfDesc").value = "";
    document.getElementById("dtfMeter").value = "";
    document.getElementById("dtfPricePerMeter").value = "";
    document.getElementById("simpleItem").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseDate").value = "";
    document.getElementById("expenseNote").value = "";
    toggleCategoryFields();
}

function editExpense(id){
    let exp = expenses.find(e => e.id === id);
    if(!exp) return;
    document.getElementById("formTitle").innerText = "Edit Pengeluaran";
    document.getElementById("editId").value = exp.id;
    document.getElementById("expenseId").value = exp.id;
    document.getElementById("expenseCategory").value = exp.category;
    toggleCategoryFields();
    if(exp.category === "Kaos" && exp.items){
        let container = document.getElementById("kaosItemsContainer");
        container.innerHTML = "";
        exp.items.forEach(it => {
            let row = createKaosItemRow(it.bahan, it.model, it.warna);
            container.appendChild(row);
        });
        if(exp.items.length === 0) addDefaultKaosRow();
    } else if(exp.category === "DTF"){
        document.getElementById("dtfDesc").value = exp.dtfDesc || "";
        document.getElementById("dtfMeter").value = exp.dtfMeter || "";
        document.getElementById("dtfPricePerMeter").value = exp.dtfPricePerMeter || "";
    } else {
        document.getElementById("simpleItem").value = exp.simpleDesc || "";
    }
    document.getElementById("expenseAmount").value = exp.amount;
    document.getElementById("expenseDate").value = exp.date || "";
    document.getElementById("expenseNote").value = exp.note || "";
    document.getElementById("expenseForm").style.display = "block";
}

function saveExpense(){
    let isEdit = document.getElementById("editId").value !== "";
    let id = document.getElementById("expenseId").value.trim() || generateExpenseId();
    let category = document.getElementById("expenseCategory").value;
    let amount = parseInt(document.getElementById("expenseAmount").value);
    let date = document.getElementById("expenseDate").value;
    let note = document.getElementById("expenseNote").value.trim();
    if(isNaN(amount) || amount <= 0){
        alert("Total harga harus diisi dengan benar");
        return;
    }
    let expenseData = { id, category, amount, date, note };
    if(category === "Kaos"){
        let items = [];
        let rows = document.querySelectorAll(".kaos-item");
        if(rows.length === 0){
            alert("Tambahkan minimal satu baris item kaos");
            return;
        }
        for(let row of rows){
            let bahan = row.querySelector(".bahan").value;
            let model = row.querySelector(".model").value;
            let warnaRows = row.querySelectorAll(".color-row");
            let warna = [];
            for(let wr of warnaRows){
                let warnaTeks = wr.querySelector(".warna-input").value.trim();
                let qty = parseInt(wr.querySelector(".qty-input").value);
                if(!warnaTeks || isNaN(qty) || qty <= 0){
                    alert("Setiap baris warna harus diisi dengan benar");
                    return;
                }
                warna.push({ warna: warnaTeks, qty: qty });
            }
            if(warna.length === 0){
                alert("Setiap baris kaos minimal satu warna");
                return;
            }
            items.push({ bahan, model, warna });
        }
        expenseData.items = items;
    } else if(category === "DTF"){
        let desc = document.getElementById("dtfDesc").value.trim();
        if(!desc){
            alert("Deskripsi DTF harus diisi");
            return;
        }
        expenseData.dtfDesc = desc;
        let meter = document.getElementById("dtfMeter").value;
        let price = document.getElementById("dtfPricePerMeter").value;
        if(meter) expenseData.dtfMeter = parseFloat(meter);
        if(price) expenseData.dtfPricePerMeter = parseFloat(price);
    } else {
        let desc = document.getElementById("simpleItem").value.trim();
        if(!desc){
            alert("Deskripsi harus diisi");
            return;
        }
        expenseData.simpleDesc = desc;
    }
    if(!isEdit && expenses.some(e => e.id === id)){
        alert("ID sudah ada! Gunakan ID lain.");
        return;
    }
    if(isEdit){
        let idx = expenses.findIndex(e => e.id === document.getElementById("editId").value);
        if(idx !== -1) expenses[idx] = expenseData;
        else return;
    } else {
        expenses.push(expenseData);
    }
    expenses.sort((a,b) => b.id.localeCompare(a.id));
    saveExpenses();
    applySearch();
    cancelForm();
}

function applySearch(){
    let kw = document.getElementById("searchInput").value.toLowerCase();
    filteredExpenses = expenses.filter(e => 
        e.id.toLowerCase().includes(kw) || 
        e.category.toLowerCase().includes(kw) ||
        (e.category === "Kaos" && e.items && e.items.some(it => it.bahan.toLowerCase().includes(kw))) ||
        (e.dtfDesc && e.dtfDesc.toLowerCase().includes(kw)) ||
        (e.simpleDesc && e.simpleDesc.toLowerCase().includes(kw))
    );
    currentPage = 1;
    renderExpenses(filteredExpenses);
}

function resetSearch(){
    document.getElementById("searchInput").value = "";
    applySearch();
}

document.addEventListener("DOMContentLoaded", () => {
    loadExpenses();
    document.getElementById("tambahBtn").addEventListener("click", showExpenseForm);
    document.getElementById("addKaosItemBtn").addEventListener("click", addDefaultKaosRow);
    document.getElementById("saveExpenseBtn").addEventListener("click", saveExpense);
    document.getElementById("cancelFormBtn").addEventListener("click", cancelForm);
    document.getElementById("searchBtn").addEventListener("click", applySearch);
    document.getElementById("resetBtn").addEventListener("click", resetSearch);
    document.getElementById("expenseCategory").addEventListener("change", toggleCategoryFields);
    toggleCategoryFields();
});