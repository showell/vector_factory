let vector = {};
let matrix = {};

vector.dot_product = (v1, v2) => {
    const result = [];
    for (let i = 0; i < v1.length; ++i) {
        result.push(v1[i] * v2[i]);
    }
    return result;
}

vector.row_matrix = (v) => {
    return v.map((e) => [e]);
}

matrix.transpose = (rows) => {
    const result = rows[0].map(() => []);

    for (let r = 0; r < rows.length; ++r) {
        for (let c = 0; c < rows[0].length; ++c) {
            result[c].push(rows[r][c]);
        }
    }

    return result;
}

function test() {
    function display_matrix(m) {
        console.log("---");
        for (const row of m) {
            console.log(`${row}`);
        }
    }
    
    const v1 = [1, 2];
    const v2 = [10, 30];
    const m1 = [
        [1, 2],
        [3, 4],
    ];
    console.log(vector.dot_product(v1, v2));
    display_matrix(vector.row_matrix(v2));
    display_matrix(matrix.transpose(m1));
}
        
test();


