let matrix = globalThis.APP.matrix;

function make_matrix_elem(matrix) {
    const table = document.createElement("table");

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

function make_vector_elem(v) {
    return make_matrix_elem(matrix.from_vector(v));
}

function set_up_bench() {
    const wb = document.querySelector("#workbench");
    const in_vector = [0, 1];
    const matrix = [[0, 1], [1, 1]];

    {
        const in_vector_elem = make_vector_elem(in_vector);
        wb.querySelector("#in_vector").replaceChildren(in_vector_elem);
    }

    {
        const matrix_elem = make_matrix_elem(matrix);
        wb.querySelector("#matrix").replaceChildren(matrix_elem);
    }
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
        elem.style.marginRight = "10px";
    }
    
    {
        const elem = wb.querySelector("#in_vector");
        elem.style.marginRight = "40px";
    }
}

style_shelf();
style_workbench();
set_up_bench();
