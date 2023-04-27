let matrix = globalThis.APP.matrix;

function make_matrix_elem(matrix) {
    const table = document.createElement("table");
    table.style.display = "inline-block";

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

function do_matrix_multiply(A, B) {
    const C = matrix.multiply(A, B);

    const elem = make_matrix_elem(C);
    document.querySelector("#out_vector").replaceChildren(elem);
}

function set_up_bench() {
    const wb = document.querySelector("#workbench");
    const in_vector = matrix.from_vector([0, 1]);
    const q_matrix = [
        [0, 1],
        [1, 1],
    ];

    do_matrix_multiply(q_matrix, in_vector);

    {
        const in_vector_elem = make_matrix_elem(in_vector);
        wb.querySelector("#in_vector").replaceChildren(in_vector_elem);
    }

    {
        const matrix_elem = make_matrix_elem(q_matrix);
        wb.querySelector("#matrix").replaceChildren(matrix_elem);
    }
}

function style_shelf() {
    const elem = document.getElementById("shelf");
    elem.style.border = "1px solid blue";
    elem.style.marginBottom = "30px";
}

function style_machine_container(c) {
    c.style.border = "1px solid green";
    c.style.height = "50px";
    c.style.minWidth = "30px";
    c.style.textAlign = "center";
    c.style.padding = "5px";
}

function style_workbench() {
    const wb = document.querySelector("#workbench");
    wb.style.display = "flex";
    wb.style.flexDirection = "row";
    wb.style.marginBottom = "10px";

    {
        const elem = wb.querySelector("#matrix");
        style_machine_container(elem);
        elem.style.marginRight = "10px";
    }

    {
        const elem = wb.querySelector("#in_vector");
        elem.style.marginRight = "40px";
        style_machine_container(elem);
    }
}

style_shelf();
style_workbench();
set_up_bench();
