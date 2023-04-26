function make_vector_elem(v) {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";

    function cell(n) {
        const span = document.createElement("span");
        span.innerText = n;
        return span;
    }

    div.appendChild(cell(v[0]));
    div.appendChild(cell(v[1]));

    return div;
}

function set_up_bench() {
    const in_vector = [0, 1];
    in_vector_elem = make_vector_elem(in_vector);

    const wb = document.querySelector("#workbench");

    wb.querySelector("#in_vector").replaceChildren(in_vector_elem);
}

function style_shelf() {
    const elem = document.getElementById("shelf");
    elem.style.border = "1px solid green";
    elem.style.marginBottom = "30px";
}

function style_workbench() {
    const wb = document.querySelector("#workbench");
    wb.style.display = "flex";
    wb.style.flexDirection = "row";
    wb.style.marginBottom = "10px";

    {
        const elem = wb.querySelector("#matrix");
        elem.style.marginRight = "20px";
    }
    
    {
        const elem = wb.querySelector("#in_vector");
        elem.style.marginRight = "40px";
    }
}

style_shelf();
style_workbench();
set_up_bench();
