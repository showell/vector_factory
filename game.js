/*

The main point of this code is to demonstrate drag&drop, so most of the drag/drop
code is at the top of the file.  It is a bit difficult to extract this code out
into a module for a couple reasons.
*/

let dragged_elem;

function is_dragged_from(loc) {
    return dragged_elem.matrix_info.loc == loc;
}

function dragged_matrix() {
    return dragged_elem.matrix_info.matrix;
}

function allow_dragging_of_matrix(div) {
    div.draggable = true;

    function dragstart(e) {
        dragged_elem = e.target;
    }

    function dragend() {
        dragged_elem = undefined;
    }

    div.addEventListener("dragstart", dragstart);
    div.addEventListener("dragend", dragend);
}

function enable_drop_to_trash() {
    const trash = document.querySelector("#trash");

    function dragover(e) {
        e.preventDefault();
    }

    function drop() {
        animate_trashing(dragged_elem);
        do_matrix_multiply();
    }

    trash.addEventListener("dragover", dragover);
    trash.addEventListener("drop", drop);
}

function enable_drop_to_shelf() {
    const shelf = document.querySelector("#shelf");

    function dragover(e) {
        if (is_dragged_from("shelf")) {
            return;
        }
        e.preventDefault();
    }

    function drop() {
        shelf.append(dragged_elem);
        do_matrix_multiply();
        dragged_elem.matrix_info.loc = "shelf";
    }

    shelf.addEventListener("dragover", dragover);
    shelf.addEventListener("drop", drop);
}

function enable_drop_to_box1() {
    function dragover(e) {
        if (box_matrix(1) || is_dragged_from("box1")) {
            return;
        }
        if (box_matrix(2) && !is_dragged_from("box2")) {
            if (box_matrix(3) && is_dragged_from("shelf")) {
                return;
            }
            if (!matrix.allow_multiply(dragged_matrix(), box_matrix(2))) {
                return;
            }
        }
        e.preventDefault();
    }

    function drop() {
        append_to_box1(dragged_elem);
    }

    box(1).addEventListener("dragover", dragover);
    box(1).addEventListener("drop", drop);
}

function enable_drop_to_box2() {
    function dragover(e) {
        if (box_matrix(2) || is_dragged_from("box2")) {
            return;
        }
        if (box_matrix(1) && !is_dragged_from("box1")) {
            if (box_matrix(3) && is_dragged_from("shelf")) {
                return;
            }
            if (!matrix.allow_multiply(box_matrix(1), dragged_matrix())) {
                return;
            }
        }
        e.preventDefault();
    }

    function drop() {
        append_to_box2(dragged_elem);
    }

    box(2).addEventListener("dragover", dragover);
    box(2).addEventListener("drop", drop);
}

/*

END OF DRAG/DROP

-----------------------------------------------------------

*/

let matrix = globalThis.APP.matrix;
let in_progress = false;

const winner = matrix.from_vector([7, 0]);

function congratulate() {
    const p = document.createElement("p");
    p.innerText = "DAMN you are smart!";
    p.style.fontSize = "120%";
    p.style.color = "green";
    document.querySelector("#message_area").replaceChildren(p);
}

function populate_shelf() {
    const shelf = document.querySelector("#shelf");

    function add(matrix) {
        const elem = make_matrix_elem(matrix);
        shelf.append(elem);
        elem.matrix_info.loc = "shelf";
    }

    const swapper = [
        [0, 1],
        [1, 0],
    ];
    add(swapper);

    const q_inverse = [
        [-1, 1],
        [1, 0],
    ];
    add(q_inverse);

    const slicer = [
        [0, 0],
        [1, 0],
    ];
    add(slicer);

    add([
        [5, 27],
        [3, -1],
    ]);
}

function animate_trashing(elem) {
    const trash = document.querySelector("#trash");
    trash.append(elem);

    setTimeout(() => {
        elem.remove();
    }, 800);
}

function make_matrix_table(matrix) {
    const table = document.createElement("table");
    table.style.borderLeft = "1px solid black";
    table.style.borderRight = "1px solid black";
    table.style.background = "aliceblue";
    table.style.padding = "5px";
    table.style.textAlign = "right";

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
    div.style.display = "inline-block";
    div.className = "matrix";

    div.matrix_info = {
        matrix: matrix,
    };

    allow_dragging_of_matrix(div);

    return div;
}

function box_matrix(n) {
    const div = document.querySelector(`#machine_box${n} .matrix`);

    if (!div) {
        return undefined;
    }

    return div.matrix_info.matrix;
}

function box(n) {
    return document.querySelector(`#machine_box${n}`);
}

function append_to_box1(elem) {
    elem.matrix_info.loc = "box1";
    box(1).append(elem);
    do_matrix_multiply();
}

function append_to_box2(elem) {
    elem.matrix_info.loc = "box2";
    box(2).append(elem);
    do_matrix_multiply();
}

function do_matrix_multiply() {
    const A = box_matrix(1);
    const B = box_matrix(2);
    const C = box_matrix(3);

    if (A && B && !C && !in_progress) {
        const C = matrix.multiply(A, B);

        if (matrix.eq(C, winner)) {
            congratulate();
        }

        const elem = make_matrix_elem(C);
        animate_machine_generation(elem);
    }
}

function animate_machine_generation(elem) {
    const orig_color = box(1).style.background;

    function start() {
        in_progress = true;
        box(1).style.background = "cyan";
        box(2).style.background = "cyan";
    }

    function finish() {
        box(3).append(elem);
        elem.matrix_info.loc = "box3";
        box(1).style.background = orig_color;
        box(2).style.background = orig_color;
        in_progress = false;
    }

    start();
    setTimeout(finish, 700);
}

function populate_machine() {
    const q_matrix = [
        [0, 1],
        [1, 1],
    ];
    const m_01 = matrix.from_vector([0, 1]);

    append_to_box1(make_matrix_elem(q_matrix));
    append_to_box2(make_matrix_elem(m_01));
}

function style_shelf() {
    const elem = document.getElementById("shelf");
    elem.style.border = "1px solid blue";
    elem.style.height = "60px";
    elem.style.width = "600px";
    elem.style.display = "flex";
    elem.style.flexDirection = "row";
    elem.style.marginBottom = "30px";
    elem.style.marginLeft = "20px";
}

function style_trash() {
    const elem = document.getElementById("trash");
    elem.style.border = "1px solid red";
    elem.style.height = "60px";
    elem.style.width = "60px";
    elem.style.marginLeft = "70px";
}

function style_machine_box(box) {
    box.style.border = "1px solid green";
    box.style.height = "60px";
    box.style.minWidth = "60px";
    box.style.textAlign = "center";
    box.style.padding = "7px";
}

function style_boxes() {
    const wb = document.querySelector("#machine");
    wb.style.display = "flex";
    wb.style.flexDirection = "row";
    wb.style.marginBottom = "10px";

    {
        const elem = box(1);
        style_machine_box(elem);
        elem.style.marginLeft = "70px";
    }

    {
        const elem = box(2);
        style_machine_box(elem);
    }

    {
        const elem = box(3);
        style_machine_box(elem);
        elem.style.background = "lightgreen";
    }
}

function create_challenge() {
    const answer = make_matrix_table(winner);
    document.querySelector("#target_answer").append(answer);
}

style_shelf();
style_boxes();
style_trash();
populate_shelf();
populate_machine();
enable_drop_to_shelf();
enable_drop_to_box1();
enable_drop_to_box2();
enable_drop_to_trash();
enable_drop_to_box1();
create_challenge();
