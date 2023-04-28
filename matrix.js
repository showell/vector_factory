function dot_product(v1, v2) {
    let result = 0;
    for (let i = 0; i < v1.length; ++i) {
        result += v1[i] * v2[i];
    }
    return result;
}

{
    let matrix = {};

    matrix.from_vector = (v) => {
        return v.map((e) => [e]);
    };

    matrix.transpose = (rows) => {
        const result = rows[0].map(() => []);

        for (let r = 0; r < rows.length; ++r) {
            for (let c = 0; c < rows[0].length; ++c) {
                result[c].push(rows[r][c]);
            }
        }

        return result;
    };

    matrix.allow_multiply = (A_rows, B_rows) => {
        return A_rows[0].length == B_rows.length;
    };

    matrix.multiply = (A_rows, B_rows) => {
        const B_cols = matrix.transpose(B_rows);

        function C_col(col) {
            return A_rows.map((row) => dot_product(row, col));
        }

        const C_cols = B_cols.map(C_col);
        const C_rows = matrix.transpose(C_cols);
        return C_rows;
    };

    const test = () => {
        function display_matrix(m) {
            console.log("---");
            for (const row of m) {
                console.log(`${row}`);
            }
        }

        const v = [10, 30];
        const m1 = [
            [1, 2],
            [3, 4],
        ];
        const m2 = [
            [100, 20],
            [5, 1000],
        ];
        display_matrix(matrix.from_vector(v));
        display_matrix(m1);
        display_matrix(m2);
        display_matrix(matrix.multiply(m1, m2));
    };

    if (globalThis.window) {
        globalThis.APP.matrix = matrix;
    } else {
        test();
    }
}
