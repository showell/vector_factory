function build_application() {
    const trash = new Trash();
    trash.enable_drop();

    const shelf = new Shelf();
    shelf.enable_drop();

    style_body();
    style_shelf();
    style_machine();
    style_boxes();
    style_trash();

    enable_drop_to_box1();
    enable_drop_to_box2();

    create_challenge();
    populate_shelf();
    populate_machine();
}

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

class Trash {
    constructor() {
        this.div = document.querySelector("#trash");
    }

    handle_dragover(e) {
        e.preventDefault();
    }

    handle_drop() {
        animate_trashing(dragged_elem);
        do_matrix_multiply();
    }

    enable_drop() {
        const self = this;
        const div = this.div;

        div.addEventListener("dragover", (e) => {
            self.handle_dragover(e);
        });

        div.addEventListener("drop", () => {
            self.handle_drop();
        });
    }
}


class Shelf {
    constructor() {
        this.div = document.querySelector("#shelf");
    }

    handle_dragover(e) {
        if (is_dragged_from("shelf")) {
            return;
        }
        e.preventDefault();
    }

    handle_drop() {
        append_to_shelf(dragged_elem);
        do_matrix_multiply();
    }

    enable_drop() {
        const self = this;
        const div = this.div;

        div.addEventListener("dragover", (e) => {
            self.handle_dragover(e);
        });
        div.addEventListener("drop", () => {
            self.handle_drop();
        });
    }
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

function box(n) {
    return document.querySelector(`#machine_box${n}`);
}

function shelf() {
    return document.querySelector("#shelf");
}

function box_matrix(n) {
    const div = document.querySelector(`#machine_box${n} .matrix-div`);

    if (!div) {
        return undefined;
    }

    return div.matrix_info.matrix;
}

function append_to_shelf(elem) {
    elem.matrix_info.loc = "shelf";
    shelf().append(elem);
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

/*

    DOM WIDGETS

*/

function make_matrix_table(matrix) {
    const table = document.createElement("table");
    table.className = "matrix-table";

    style_matrix_table(table);

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

class PhysicalMatrix  {
    constructor(matrix, title) {
        const table = make_matrix_table(matrix);
        const div = document.createElement("div");
        div.className = "matrix-div";
        div.title = title;
        div.append(table);
        style_matrix_div(div);

        // TODO: Fix this ugliness once we have Game
        div.matrix_info = {
            matrix: matrix,
        };

        this.div = div;
        this.allow_dragging_of_matrix();
    }

    handle_dragstart(e) {
        dragged_elem = e.target;
    }

    handle_dragend() {
        dragged_elem = undefined;
    }

    allow_dragging_of_matrix() {
        const self = this;
        const div = this.div;

        console.log("allow dragging");
        div.draggable = true;
        div.userSelect = undefined;

        div.addEventListener("dragstart", (e) => {
            self.handle_dragstart(e);
        });

        div.addEventListener("dragend", () => {
            self.handle_dragend();
        });
    }

    dom() {
        return this.div;
    }
}

function make_matrix_elem(matrix, title) {
    const physical_matrix = new PhysicalMatrix(matrix, title);
    return physical_matrix.dom();
}

/*

----------------------

ANIMATIONS

*/

function animate_trashing(elem) {
    const trash = document.querySelector("#trash");
    trash.append(elem);

    setTimeout(() => {
        elem.remove();
    }, 800);
}

function animate_machine_generation(elem) {
    function start() {
        in_progress = true;
        style_machine_running();
    }

    function finish() {
        box(3).append(elem);
        elem.matrix_info.loc = "box3";
        style_machine_idle();
        in_progress = false;
    }

    start();
    setTimeout(finish, 700);
}

/*

---------------------

    MISC
*/

let matrix = globalThis.APP.matrix;
let in_progress = false;

const winner = matrix.from_vector([7, 0]);

function congratulate() {
    const p = document.createElement("p");
    p.innerText = "DAMN you are smart!";
    style_congratuations(p);

    document.querySelector("#message_area").replaceChildren(p);
}

function create_challenge() {
    const answer = make_matrix_table(winner);
    document.querySelector("#target_answer").append(answer);
}

function populate_shelf() {
    function add(matrix, title) {
        const elem = make_matrix_elem(matrix, title);
        append_to_shelf(elem);
    }

    add([[0], [1]], "standard basis vector (y)");

    add([
        [0, 1],
        [1, 0],
    ], "swap x and y");

    add([
        [1, 0],
        [0, 0],
    ], "just x");

    add([
        [0, 0],
        [0, 1],
    ], "just y");

    add([
        [-1, 0],
        [0, -1],
    ], "negator");

    add([
        [2, 0],
        [0, 1],
    ], "double x");
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

        const elem = make_matrix_elem(C, "from you!");
        animate_machine_generation(elem);
    }
}

function populate_machine() {
    const q_matrix = [
        [0, 1],
        [1, 1],
    ];

    append_to_box1(make_matrix_elem(q_matrix, "fibonacci"));
}

/*

    I try to make all JS styling go through the same helper:

*/

function setStyles(elem, styles) {
    const info = [];
    const label = elem.id
        ? `#${elem.id}`
        : elem.className
        ? `.${elem.className}`
        : elem.tagName;

    info.push(`\nSetting styles for ${label}\n`);

    for (const [f, v] of Object.entries(styles)) {
        info.push(`  ${f}: ${v};`);
        elem.style[f] = v;
    }

    // console.trace(info.join("\n"));
}

/*

STYLES

*/

function style_body() {
    setStyles(document.body, {
        marginLeft: "40px",
    });
}

function style_shelf() {
    const elem = document.getElementById("shelf");
    setStyles(elem, {
        border: "1px solid blue",
        height: "60px",
        width: "600px",
        display: "flex",
        flexDirection: "row",
        marginBottom: "30px",
        marginLeft: "30px",
    });
}

function style_trash() {
    const elem = document.getElementById("trash");
    setStyles(elem, {
        border: "1px solid red",
        height: "60px",
        width: "60px",
        marginLeft: "30px",
        background: "burlywood",
    });
}

function style_machine() {
    const wb = document.querySelector("#machine");
    setStyles(wb, {
        display: "flex",
        flexDirection: "row",
        marginBottom: "10px",
        marginLeft: "30px",
        borderBottom: "1px solid blue",
        width: "max-content",
    });
}

function style_machine_box(box) {
    setStyles(box, {
        border: "1px solid green",
        height: "60px",
        minWidth: "60px",
        textAlign: "center",
        padding: "7px",
        margin: "4px",
    });
}

function style_boxes() {
    style_machine_box(box(1));
    style_machine_box(box(2));
    style_machine_box(box(3));
    setStyles(box(3), { background: "lightgreen" });
}

function style_congratuations(p) {
    setStyles(p, {
        fontSize: "120%",
        color: "green",
    });
}

function style_machine_running() {
    setStyles(box(1), { background: "cyan" });
    setStyles(box(2), { background: "cyan" });
}

function style_machine_idle() {
    setStyles(box(1), { background: "none" });
    setStyles(box(2), { background: "none" });
}

function style_matrix_table(table) {
    setStyles(table, {
        borderLeft: "1px solid black",
        borderRight: "1px solid black",
        background: "aliceblue",
        padding: "5px",
        textAlign: "right",
    });
}

function style_matrix_div(div) {
    setStyles(div, {
        display: "inline-block",
        margin: "2px",
    });
}

build_application();
