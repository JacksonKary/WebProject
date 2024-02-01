const val1 = document.getElementById("Name");
const val2 = document.getElementById("Dropdown");
const val3 = document.getElementById("Spooky");

let cost = 10000;

// Cost:        if Name starts with j, 100 dollar discount
//              if Spooky is checked, 9000 dollar discount
//              if Dropdown is set to Voulge, 3000 travel charge (vacation voulge)
const updateCost = () => {
    cost = 10000;
    if (val1.value.startsWith("J") || val1.value.startsWith("j")) {
        cost -= 100;
    }
    if (val2.value === "Voulge") {
        cost += 3000; // travel costs
    }
    if (val3.checked) {
        cost -= 9000;
    }
    document.getElementById("cost").innerText = `$${parseInt(cost)}`;
}

val1.addEventListener("input", updateCost);
val2.addEventListener("change", updateCost);
val3.addEventListener("change", updateCost);
