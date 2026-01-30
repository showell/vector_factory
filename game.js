let Matrix = globalThis.APP.matrix;
let GAME;

const winner = Matrix.from_vector([7, 0]);


function build_application() {
    const shelf = new Shelf();
    shelf.enable_drop();

    const box1 = new Box1();
    box1.enable_drop();

    const box2 = new Box2();
    box2.enable_drop();

    const box3 = new Box3();
    // not a drop target

    const trash = new Trash();
    trash.enable_drop();

    GAME = new Game(box1, box2, box3);

    style_body();
    style_shelf();
    style_machine();
    style_boxes();
    style_trash();

    create_challenge();
    populate_shelf(shelf);
    populate_machine(box1);
}

/*

The main point of this code is to demonstrate drag&drop, so most of the drag/drop
code is at the top of the file.  It is a bit difficult to extract this code out
into a module for a couple reasons.
*/

class Game {
    constructor(box1, box2, box3) {
        this.box1 = box1;
        this.box2 = box2;
        this.box3 = box3;

        this.matrix1 = undefined;
        this.matrix2 = undefined;
        this.matrix3 = undefined;

        this._dragged_physical_matrix = undefined;
    }

    set_dragged_physical_matrix(matrix) {
        this._dragged_physical_matrix = matrix;
    }

    is_dragged_from(loc) {
        return this._dragged_physical_matrix.get_location() == loc;
    }

    dragged_physical_matrix() {
        return this._dragged_physical_matrix;
    }

    dragged_matrix() {
        return this._dragged_physical_matrix.matrix;
    }

    do_matrix_multiply() {
        const box3 = this.box3;

        const A = this.matrix1;
        const B = this.matrix2;
        const C = this.matrix3;

        if (A && B && !C && !in_progress) {
            const C = Matrix.multiply(A, B);

            if (Matrix.eq(C, winner)) {
                congratulate();
            }

            const physical_matrix = new PhysicalMatrix(C, "from you!");
            box3.animate_machine_generation(physical_matrix);
        }
    }

    clear_matrix(loc) {
        switch (loc) {
            case "box1":
                this.matrix1 = undefined;
                break;

            case "box2":
                this.matrix2 = undefined;
                break;

            case "box3":
                this.matrix3 = undefined;
                break;
        }
    }

    set_matrix(loc, matrix) {
        switch (loc) {
            case "box1":
                this.matrix1 = matrix;
                break;

            case "box2":
                this.matrix2 = matrix;
                break;

            case "box3":
                this.matrix3 = matrix;
                break;
        }
    }
}

class PhysicalMatrix {
    constructor(matrix, title) {
        this.matrix = matrix;
        this.loc = undefined;

        const table = make_matrix_table(matrix);
        const div = document.createElement("div");
        div.title = title;
        div.append(table);
        style_matrix_div(div);

        this.div = div;
        this.allow_dragging_of_matrix();
    }

    set_location(new_loc) {
        if (new_loc === this.loc) {
            return;
        }

        GAME.clear_matrix(this.loc);
        GAME.set_matrix(new_loc, this.matrix);

        this.loc = new_loc;
    }

    get_location() {
        return this.loc;
    }

    handle_dragstart() {
        GAME.set_dragged_physical_matrix(this);
    }

    handle_dragend() {
        GAME.set_dragged_physical_matrix(undefined);
    }

    allow_dragging_of_matrix() {
        const self = this;
        const div = this.div;

        div.draggable = true;
        div.userSelect = undefined;

        div.addEventListener("dragstart", () => {
            self.handle_dragstart();
        });

        div.addEventListener("dragend", () => {
            self.handle_dragend();
        });
    }

    dom() {
        return this.div;
    }
}

class Trash {
    constructor() {
        this.div = document.querySelector("#trash");
    }

    accepts_drop() {
        // We let you drop ANY matrix.
        return true;
    }

    handle_drop() {
        const div = this.div;

        const physical_matrix = GAME.dragged_physical_matrix();
        GAME.clear_matrix(physical_matrix.get_location());
        const matrix_elem = physical_matrix.dom();

        div.append(matrix_elem);

        setTimeout(() => {
            matrix_elem.remove();
        }, 300);
    }

    enable_drop() {
        const self = this;
        const div = this.div;

        div.addEventListener("dragover", (e) => {
            if (self.accepts_drop()) {
                e.preventDefault();
            }
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

    append_physical_matrix(physical_matrix) {
        physical_matrix.set_location("shelf");
        const elem = physical_matrix.dom();
        this.div.append(elem);
    }

    accepts_drop() {
        // We don't accept drops from the same shelf yet,
        // as it would be a bit confusing to append the matrix
        // to the end of the shelf if the drop target is toward
        // the front. Just punting on it for now. We could eventually
        // allow users to re-arrange the shelf.
        return !GAME.is_dragged_from("shelf");
    }

    handle_drop() {
        this.append_physical_matrix(GAME.dragged_physical_matrix());
    }

    enable_drop() {
        const self = this;
        const div = this.div;

        div.addEventListener("dragover", (e) => {
            if (self.accepts_drop()) {
                e.preventDefault();
            }
        });

        div.addEventListener("drop", () => {
            self.handle_drop();
        });
    }
}

class Box1 {
    constructor() {
        this.div = document.querySelector("#machine_box1");
    }

    set_physical_matrix(physical_matrix) {
        const div = this.div;

        physical_matrix.set_location("box1");

        const elem = physical_matrix.dom();
        div.append(elem);
        GAME.do_matrix_multiply();
    }

    already_occupied() {
        return GAME.matrix1;
    }

    accepts_drop() {
        if (this.already_occupied()) {
            return false;
        }

        if (!GAME.matrix2 || GAME.is_dragged_from("box2")) {
            return true;
        }

        if (GAME.matrix3) {
            return false;
        }

        return Matrix.allow_multiply(GAME.dragged_matrix(), GAME.matrix2);
    }

    handle_drop() {
        this.set_physical_matrix(GAME.dragged_physical_matrix());
    }

    enable_drop() {
        const self = this;
        const div = this.div;

        div.addEventListener("dragover", (e) => {
            if (self.accepts_drop()) {
                e.preventDefault();
            }
        });

        div.addEventListener("drop", () => {
            self.handle_drop();
        });
    }
}

class Box2 {
    constructor() {
        this.div = document.querySelector("#machine_box2");
    }

    set_physical_matrix(physical_matrix) {
        const div = this.div;

        physical_matrix.set_location("box2");
        const elem = physical_matrix.dom();
        div.append(elem);
        GAME.do_matrix_multiply();
    }

    already_occupied() {
        return GAME.matrix2;
    }

    handle_dragover(e) {
        if (this.already_occupied()) {
            return;
        }

        if (GAME.matrix1 && !GAME.is_dragged_from("box1")) {
            if (GAME.matrix3 && GAME.is_dragged_from("shelf")) {
                return;
            }
            if (!Matrix.allow_multiply(GAME.matrix1, GAME.dragged_matrix())) {
                return;
            }
        }
        e.preventDefault();
    }

    handle_drop() {
        this.set_physical_matrix(GAME.dragged_physical_matrix());
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

class Box3 {
    constructor() {
        this.div = document.querySelector("#machine_box3");
    }

    set_physical_matrix(physical_matrix) {
        const div = this.div;

        physical_matrix.set_location("box3");
        const elem = physical_matrix.dom();
        GAME.matrix3 = physical_matrix.matrix;
        div.append(elem);
    }

    animate_machine_generation(physical_matrix) {
        const self = this;

        function start() {
            new Audio("ding.mp3").play();
            in_progress = true;
            style_machine_running();
        }

        function finish() {
            self.set_physical_matrix(physical_matrix);
            physical_matrix.set_location("box3");
            style_machine_idle();
            in_progress = false;
        }

        start();
        setTimeout(finish, 400);
    }
}

/*

END OF DRAG/DROP

-----------------------------------------------------------

*/

function box(n) {
    return document.querySelector(`#machine_box${n}`);
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

/*

---------------------

    MISC
*/

let in_progress = false;

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

function populate_shelf(shelf) {
    function add(matrix, title) {
        const physical_matrix = new PhysicalMatrix(matrix, title);
        shelf.append_physical_matrix(physical_matrix);
    }

    add([[0], [1]], "standard basis vector (y)");

    add(
        [
            [0, 1],
            [1, 0],
        ],
        "swap x and y",
    );

    add(
        [
            [1, 0],
            [0, 0],
        ],
        "just x",
    );

    add(
        [
            [0, 0],
            [0, 1],
        ],
        "just y",
    );

    add(
        [
            [-1, 0],
            [0, -1],
        ],
        "negator",
    );

    add(
        [
            [2, 0],
            [0, 1],
        ],
        "double x",
    );
}

function populate_machine(box1) {
    const q_matrix = [
        [0, 1],
        [1, 1],
    ];

    box1.set_physical_matrix(new PhysicalMatrix(q_matrix, "fibonacci"));
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
