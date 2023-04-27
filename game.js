let matrix = globalThis.APP.matrix;

let dragged_elem;

function enable_shelf() {
    const shelf = document.querySelector("#shelf");

    function dragover(e) {
        e.preventDefault();
    }

    function drop() {
        shelf.append(dragged_elem);
    }

    shelf.addEventListener("dragover", dragover);
    shelf.addEventListener("drop", drop);
}

function make_matrix_table(matrix) {
    const table = document.createElement("table");
    table.style.borderLeft = "1px solid black";
    table.style.borderRight = "1px solid black";
    table.style.background = "aliceblue";
    table.style.padding = "5px";

    function row(row_vector) {
        const tr = document.createElement("tr");

        function cell(n) {
            const td = document.createElement("td");
            td.innerText = n;
            return td;
        }

        for (const n of row_vector) {
            tr.appendChild(cell(n));
        }
        return tr;
    }

    table.appendChild(row(matrix[0]));
    table.appendChild(row(matrix[1]));

    return table;
}

function make_matrix_elem(matrix) {
    const div = document.createElement("div");
    const table = make_matrix_table(matrix);
    div.append(table);
    div.draggable = true;
    div.style.display = "inline-block";

    function dragstart(e) {
        dragged_elem = e.target;
    }

    function dragend() {
        dragged_elem = undefined;
    }

    div.addEventListener("dragstart", dragstart);
    div.addEventListener("dragend", dragend);
    return div;
}

function do_matrix_multiply(A, B) {
    const C = matrix.multiply(A, B);

    const elem = make_matrix_elem(C);
    document.querySelector("#machine_box3").append(elem);
}

function populate() {
    const q_matrix = [
        [0, 1],
        [1, 1],
    ];
    const m_01 = matrix.from_vector([0, 1]);

    document.querySelector("#machine_box1").append(make_matrix_elem(q_matrix));
    document.querySelector("#machine_box2").append(make_matrix_elem(m_01));
    do_matrix_multiply(q_matrix, m_01);
}

function style_shelf() {
    const elem = document.getElementById("shelf");
    elem.style.border = "1px solid blue";
    elem.style.height = "60px";
    elem.style.display = "flex";
    elem.style.flexDirection = "row";
    elem.style.marginBottom = "30px";
}

function style_machine_container(c) {
    c.style.border = "1px solid green";
    c.style.height = "60px";
    c.style.minWidth = "60px";
    c.style.textAlign = "center";
    c.style.padding = "7px";
}

function style_workbench() {
    const wb = document.querySelector("#workbench");
    wb.style.display = "flex";
    wb.style.flexDirection = "row";
    wb.style.marginBottom = "10px";

    {
        const elem = wb.querySelector("#machine_box1");
        style_machine_container(elem);
        elem.style.marginRight = "10px";
    }

    {
        const elem = wb.querySelector("#machine_box2");
        elem.style.marginRight = "40px";
        style_machine_container(elem);
    }

    {
        const elem = wb.querySelector("#machine_box3");
        style_machine_container(elem);
    }
}

style_shelf();
style_workbench();
populate();
enable_shelf();
