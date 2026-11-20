
const students = ["amina", "kevin", "faith", "brad", "kelly", "brian", "mercy", "john", "lucy", "peter"];
const STATUSES = ["present", "absent", "late"];
const records = {};

const weekSel = document.getElementById("week");
const daySel = document.getElementById("day");
const search = document.getElementById("search");
const list = document.getElementById("list");
const toast = document.getElementById("toast");

for (let i = 1; i <= 14; i++) weekSel.add(new Option("Week " + i, i));

const key = () => weekSel.value + "-" + daySel.value;
const current = () => (records[key()] ||= {});

function render() {
    const q = search.value.trim().toLowerCase();
    const day = current();
    const visible = students.filter(s => s.includes(q));
    list.innerHTML = "";
    if (!visible.length) {
        list.innerHTML = '<li class="empty">No student found</li>';
    }
    visible.forEach(name => {
        const li = document.createElement("li");
        const label = document.createElement("span");
        label.className = "name";
        label.textContent = name;
        const group = document.createElement("div");
        group.className = "options";
        group.setAttribute("role", "group");
        group.setAttribute("aria-label", "Attendance for " + name);
        STATUSES.forEach(st => {
            const b = document.createElement("button");
            b.type = "button";
            b.className = "opt " + st;
            b.textContent = st[0].toUpperCase() + st.slice(1);
            b.setAttribute("aria-pressed", day[name] === st);
            b.onclick = () => {
                day[name] = day[name] === st ? undefined : st;
                render();
            };
            group.appendChild(b);
        });
        li.append(label, group);
        list.appendChild(li);
    });
    updateSummary();
}

function updateSummary() {
    const day = current();
    const c = { present: 0, absent: 0, late: 0 };
    students.forEach(s => day[s] && c[day[s]]++);
    document.getElementById("cP").textContent = c.present;
    document.getElementById("cA").textContent = c.absent;
    document.getElementById("cL").textContent = c.late;
    document.getElementById("cU").textContent = students.length - c.present - c.absent - c.late;
}

function flash(msg) {
    toast.textContent = msg;
    clearTimeout(flash.t);
    flash.t = setTimeout(() => (toast.textContent = ""), 2500);
}

document.getElementById("allPresent").onclick = () => {
    const day = current();
    students.forEach(s => (day[s] = "present"));
    render();
};

document.getElementById("save").onclick = () => {
    const day = current();
    const missing = students.filter(s => !day[s]).length;
    flash(missing
        ? missing + " student(s) still unmarked"
        : "Attendance saved for Week " + weekSel.value + ", " + daySel.value);
};

document.getElementById("exportCsv").onclick = () => {
    const day = current();
    const rows = [["Student", "Week", "Day", "Status"]];
    students.forEach(s => rows.push([s, weekSel.value, daySel.value, day[s] || "unmarked"]));
    const blob = new Blob([rows.map(r => r.join(",")).join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance-week" + weekSel.value + "-" + daySel.value + ".csv";
    a.click();
};

search.oninput = render;
weekSel.onchange = render;
daySel.onchange = render;
render();
