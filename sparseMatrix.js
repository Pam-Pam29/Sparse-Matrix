const fs = require('fs');

// Class to handle SparseMatrix
class SparseMatrix {
    constructor(numRows = 0, numCols = 0) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.data = new Map(); // Store non-zero elements in Map for quick access
    }

    // Static method to load matrix from a file
    static fromFile(filePath) {
        const matrix = new SparseMatrix();
        const content = fs.readFileSync(filePath, 'utf-8').trim().split('\n');

        matrix.numRows = parseInt(content[0].split('=')[1].trim());
        matrix.numCols = parseInt(content[1].split('=')[1].trim());

        for (let i = 2; i < content.length; i++) {
            let line = content[i].trim();
            if (line.startsWith('(') && line.endsWith(')')) {
                let [row, col, value] = line.slice(1, -1).split(',').map(Number);
                matrix.setElement(row, col, value);
            } else {
                throw new Error(`Invalid format at line ${i + 1}`);
            }
        }
        return matrix;
    }

    // Get element from the matrix (returns 0 if not stored)
    getElement(row, col) {
        const key = `${row},${col}`;
        return this.data.get(key) || 0;
    }

    // Set element in the matrix
    setElement(row, col, value) {
        const key = `${row},${col}`;
        if (value !== 0) {
            this.data.set(key, value);
        } else {
            this.data.delete(key); // Remove if value is zero
        }
    }

    // Add two sparse matrices
    add(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrix dimensions do not match for addition');
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        
        // Merge non-zero values from both matrices
        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            const sum = value + other.getElement(row, col);
            result.setElement(row, col, sum);
        }

        for (let [key, value] of other.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, value);
            }
        }

        return result;
    }

    // Subtract two sparse matrices
    subtract(other) {
        if (this.numRows !== other.numRows || this.numCols !== other.numCols) {
            throw new Error('Matrix dimensions do not match for subtraction');
        }

        const result = new SparseMatrix(this.numRows, this.numCols);
        
        // Subtract non-zero values from both matrices
        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            const difference = value - other.getElement(row, col);
            result.setElement(row, col, difference);
        }

        for (let [key, value] of other.data) {
            const [row, col] = key.split(',').map(Number);
            if (!this.data.has(key)) {
                result.setElement(row, col, -value);
            }
        }

        return result;
    }

    // Multiply two sparse matrices
    multiply(other) {
        if (this.numCols !== other.numRows) {
            throw new Error('Matrix dimensions do not match for multiplication');
        }

        const result = new SparseMatrix(this.numRows, other.numCols);

        // Multiply non-zero values
        for (let [key, value] of this.data) {
            const [row, col] = key.split(',').map(Number);
            for (let k = 0; k < other.numCols; k++) {
                const product = value * other.getElement(col, k);
                const currentValue = result.getElement(row, k) + product;
                result.setElement(row, k, currentValue);
            }
        }

        return result;
    }

    // Display matrix in a readable format
    printMatrix() {
        for (let i = 0; i < this.numRows; i++) {
            let row = [];
            for (let j = 0; j < this.numCols; j++) {
                row.push(this.getElement(i, j));
            }
            console.log(row.join(' '));
        }
    }
}

// Main function for operations
function main() {
    const matrix1Path = '/dsa/sparse_matrix/sample_inputs/matrix1.txt';
    const matrix2Path = '/dsa/sparse_matrix/sample_inputs/matrix2.txt';

    // Load matrices from files
    const matrix1 = SparseMatrix.fromFile(matrix1Path);
    const matrix2 = SparseMatrix.fromFile(matrix2Path);

    // Choose operation from the user
    console.log("Choose operation:\n1. Add\n2. Subtract\n3. Multiply");
    const choice = parseInt(prompt("Enter your choice (1/2/3): "));

    let result;
    try {
        switch (choice) {
            case 1:
                result = matrix1.add(matrix2);
                console.log("Result of addition:");
                break;
            case 2:
                result = matrix1.subtract(matrix2);
                console.log("Result of subtraction:");
                break;
            case 3:
                result = matrix1.multiply(matrix2);
                console.log("Result of multiplication:");
                break;
            default:
                console.log("Invalid choice.");
                return;
        }
        result.printMatrix();
    } catch (error) {
        console.error(error.message);
    }
}

// Execute the program
main();
