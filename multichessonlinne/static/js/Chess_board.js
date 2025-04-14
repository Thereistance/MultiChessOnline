
        class ChessGame {
            constructor() {
                this.boardLength = 8;
                this.pieces = [
                    ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
                    ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['', '', '', '', '', '', '', ''],
                    ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
                    ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
                ];
                this.currentPlayer = 'white';
                this.selectedPiece = null;
                this.possibleMoves = [];
                
                // Base URL for piece images (you'll need to provide these images)
                this.pieceImages = {
                    'p': '/static/images/black-pawn.png',
                    'k': '/static/images/black-king.png',
                    'q': '/static/images/black-queen.png',
                    'r': '/static/images/black-rook.png',
                    'b': '/static/images/black-bishop.png',
                    'n': '/static/images/black-knight.png',
                    'P': '/static/images/white-pawn.png',
                    'K': '/static/images/white-king.png',
                    'Q': '/static/images/white-queen.png',
                    'R': '/static/images/white-rook.png',
                    'B': '/static/images/white-bishop.png',
                    'N': '/static/images/white-knight.png'
                };
                
                this.initBoard();
                this.renderBoard();
                this.addEventListeners();
                this.updateCurrentPlayerDisplay();
            }
            
            initBoard() {
                // Add letters and numbers around the board
                const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                const numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];
                
                const topLetters = document.getElementById('top-letters');
                const bottomLetters = document.getElementById('bottom-letters');
                const leftNumbers = document.getElementById('left-numbers');
                const rightNumbers = document.getElementById('right-numbers');
                
                letters.forEach(letter => {
                    const topDiv = document.createElement('div');
                    topDiv.className = 'top-letter';
                    topDiv.textContent = letter;
                    topLetters.appendChild(topDiv);
                    
                    const bottomDiv = document.createElement('div');
                    bottomDiv.className = 'bottom-letter';
                    bottomDiv.textContent = letter;
                    bottomLetters.appendChild(bottomDiv);
                });
                
                numbers.forEach(number => {
                    const leftDiv = document.createElement('div');
                    leftDiv.className = 'left-number';
                    leftDiv.textContent = number;
                    leftNumbers.appendChild(leftDiv);
                    
                    const rightDiv = document.createElement('div');
                    rightDiv.className = 'right-number';
                    rightDiv.textContent = number;
                    rightNumbers.appendChild(rightDiv);
                });
                
                // Create chess squares
                const chessBoard = document.getElementById('chess-board');
                for (let row = 0; row < this.boardLength; row++) {
                    for (let col = 0; col < this.boardLength; col++) {
                        const square = document.createElement('div');
                        square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                        square.dataset.row = row;
                        square.dataset.col = col;
                        
                        // Add piece image container
                        const pieceImg = document.createElement('img');
                        pieceImg.className = 'piece';
                        pieceImg.style.display = 'none';
                        square.appendChild(pieceImg);
                        
                        chessBoard.appendChild(square);
                    }
                }
            }
            
            renderBoard() {
                const squares = document.querySelectorAll('.chess-square');
                
                squares.forEach(square => {
                    const row = parseInt(square.dataset.row);
                    const col = parseInt(square.dataset.col);
                    const piece = this.pieces[row][col];
                    const pieceImg = square.querySelector('.piece');
                    
                    // Clear previous classes
                    square.classList.remove('selected', 'possible-move', 'attackable-piece');
                    
                    // Set piece image or hide it
                    if (piece) {
                        pieceImg.src = this.pieceImages[piece];
                        pieceImg.style.display = 'block';
                        pieceImg.alt = piece;
                    } else {
                        pieceImg.style.display = 'none';
                    }
                    
                    // Highlight selected piece
                    if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                        square.classList.add('selected');
                    }
                    
                    // Highlight possible moves
                    const isPossibleMove = this.possibleMoves.some(move => move.row === row && move.col === col);
                    if (isPossibleMove) {
                        const isCapture = piece && !this.isSameColor(piece, this.currentPlayer);
                        if (isCapture) {
                            square.classList.add('attackable-piece');
                        } else {
                            square.classList.add('possible-move');
                        }
                    }
                });
            }
            
            addEventListeners() {
                const chessBoard = document.getElementById('chess-board');
                chessBoard.addEventListener('click', (event) => {
                    const square = event.target.closest('.chess-square');
                    if (!square) return;
                    
                    const row = parseInt(square.dataset.row);
                    const col = parseInt(square.dataset.col);
                    const piece = this.pieces[row][col];
                    
                    this.handleSquareClick(row, col, piece);
                });
            }
            
            handleSquareClick(row, col, piece) {
                // If a piece is already selected
                if (this.selectedPiece) {
                    // Check if the click is on a possible move
                    const isPossibleMove = this.possibleMoves.some(move => 
                        move.row === row && move.col === col
                    );
                    
                    if (isPossibleMove) {
                        // Move the piece
                        this.movePiece(this.selectedPiece.row, this.selectedPiece.col, row, col);
                        return;
                    }
                    
                    // Check if clicking on another piece of the same color
                    if (piece && this.isSameColor(piece, this.currentPlayer)) {
                        this.selectPiece(row, col, piece);
                        return;
                    }
                    
                    // Otherwise, deselect
                    this.deselectPiece();
                    return;
                }
                
                // If no piece is selected, select if it's the current player's piece
                if (piece && this.isSameColor(piece, this.currentPlayer)) {
                    this.selectPiece(row, col, piece);
                }
            }
            
            isSameColor(piece, color) {
                if (!piece) return false;
                if (color === 'white') {
                    return piece === piece.toUpperCase();
                } else {
                    return piece === piece.toLowerCase();
                }
            }
            
            selectPiece(row, col, piece) {
                this.selectedPiece = { row, col, piece };
                this.possibleMoves = this.getPossibleMoves(row, col, piece);
                this.renderBoard();
            }
            
            deselectPiece() {
                this.selectedPiece = null;
                this.possibleMoves = [];
                this.renderBoard();
            }
            
            movePiece(fromRow, fromCol, toRow, toCol) {
                // Move the piece
                this.pieces[toRow][toCol] = this.pieces[fromRow][fromCol];
                this.pieces[fromRow][fromCol] = '';
                
                // Switch player
                this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
                this.updateCurrentPlayerDisplay();
                
                // Deselect
                this.deselectPiece();
            }
            
            updateCurrentPlayerDisplay() {
                const playerDisplay = document.getElementById('current-player');
                playerDisplay.textContent = `Current player: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
                playerDisplay.style.color = this.currentPlayer === 'white' ? '#333' : '#888';
            }
            
            getPossibleMoves(row, col, piece) {
                // This is a simplified version - you would need to implement full chess rules here
                const moves = [];
                const lowerPiece = piece.toLowerCase();
                
                if (lowerPiece === 'p') {
                    // Pawn moves
                    const direction = piece === 'P' ? -1 : 1;
                    const startRow = piece === 'P' ? 6 : 1;
                    
                    // Forward move
                    if (this.isValidSquare(row + direction, col) && this.pieces[row + direction][col] === '') {
                        moves.push({ row: row + direction, col });
                        
                        // Double move from starting position
                        if (row === startRow && this.pieces[row + 2*direction][col] === '') {
                            moves.push({ row: row + 2*direction, col });
                        }
                    }
                    
                    // Captures
                    for (const colOffset of [-1, 1]) {
                        const newCol = col + colOffset;
                        if (this.isValidSquare(row + direction, newCol)) {
                            const targetPiece = this.pieces[row + direction][newCol];
                            if (targetPiece !== '' && !this.isSameColor(targetPiece, piece)) {
                                moves.push({ row: row + direction, col: newCol });
                            }
                        }
                    }
                }
                else if (lowerPiece === 'r') {
                    // Rook moves (horizontal and vertical)
                    this.addStraightMoves(row, col, moves);
                }
                else if (lowerPiece === 'n') {
                    // Knight moves (L-shape)
                    const knightMoves = [
                        {row: -2, col: -1}, {row: -2, col: 1},
                        {row: -1, col: -2}, {row: -1, col: 2},
                        {row: 1, col: -2}, {row: 1, col: 2},
                        {row: 2, col: -1}, {row: 2, col: 1}
                    ];
                    
                    knightMoves.forEach(move => {
                        const newRow = row + move.row;
                        const newCol = col + move.col;
                        
                        if (this.isValidSquare(newRow, newCol)) {
                            const targetPiece = this.pieces[newRow][newCol];
                            if (targetPiece === '' || !this.isSameColor(targetPiece, piece)) {
                                moves.push({ row: newRow, col: newCol });
                            }
                        }
                    });
                }
                else if (lowerPiece === 'b') {
                    // Bishop moves (diagonal)
                    this.addDiagonalMoves(row, col, moves);
                }
                else if (lowerPiece === 'q') {
                    // Queen moves (horizontal, vertical and diagonal)
                    this.addStraightMoves(row, col, moves);
                    this.addDiagonalMoves(row, col, moves);
                }
                else if (lowerPiece === 'k') {
                    // King moves (one square in any direction)
                    for (let r = -1; r <= 1; r++) {
                        for (let c = -1; c <= 1; c++) {
                            if (r === 0 && c === 0) continue;
                            
                            const newRow = row + r;
                            const newCol = col + c;
                            
                            if (this.isValidSquare(newRow, newCol)) {
                                const targetPiece = this.pieces[newRow][newCol];
                                if (targetPiece === '' || !this.isSameColor(targetPiece, piece)) {
                                    moves.push({ row: newRow, col: newCol });
                                }
                            }
                        }
                    }
                }
                
                return moves;
            }
            
            addStraightMoves(row, col, moves) {
                const piece = this.pieces[row][col];
                const directions = [
                    {row: -1, col: 0}, // up
                    {row: 1, col: 0},  // down
                    {row: 0, col: -1}, // left
                    {row: 0, col: 1}   // right
                ];
                
                directions.forEach(dir => {
                    for (let i = 1; i < this.boardLength; i++) {
                        const newRow = row + dir.row * i;
                        const newCol = col + dir.col * i;
                        
                        if (!this.isValidSquare(newRow, newCol)) break;
                        
                        const targetPiece = this.pieces[newRow][newCol];
                        
                        if (targetPiece === '') {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (!this.isSameColor(targetPiece, piece)) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                    }
                });
            }
            
            addDiagonalMoves(row, col, moves) {
                const piece = this.pieces[row][col];
                const directions = [
                    {row: -1, col: -1}, // up-left
                    {row: -1, col: 1},  // up-right
                    {row: 1, col: -1},  // down-left
                    {row: 1, col: 1}    // down-right
                ];
                
                directions.forEach(dir => {
                    for (let i = 1; i < this.boardLength; i++) {
                        const newRow = row + dir.row * i;
                        const newCol = col + dir.col * i;
                        
                        if (!this.isValidSquare(newRow, newCol)) break;
                        
                        const targetPiece = this.pieces[newRow][newCol];
                        
                        if (targetPiece === '') {
                            moves.push({ row: newRow, col: newCol });
                        } else {
                            if (!this.isSameColor(targetPiece, piece)) {
                                moves.push({ row: newRow, col: newCol });
                            }
                            break;
                        }
                    }
                });
            }
            
            isValidSquare(row, col) {
                return row >= 0 && row < this.boardLength && col >= 0 && col < this.boardLength;
            }
        }
        
        // Initialize the game when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new ChessGame();
        });
// const pieceImages = {
//     'p': 'static/images/black-pawn.png',
//     'k': 'static/images/black-king.png',
//     'q': 'static/images/black-queen.png',
//     'r': 'static/images/black-rook.png',
//     'b': 'static/images/black-bishop.png',
//     'n': 'static/images/black-knight.png',
//     'P': 'static/images/white-pawn.png',
//     'K': 'static/images/white-king.png',
//     'Q': 'static/images/white-queen.png',
//     'R': 'static/images/white-rook.png',
//     'B': 'static/images/white-bishop.png',
//     'N': 'static/images/white-knight.png'
// };

// class ChessGame {
//     constructor() {
//         this.board = [
//             ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
//             ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
//             ['', '', '', '', '', '', '', ''],
//             ['', '', '', '', '', '', '', ''],
//             ['', '', '', '', '', '', '', ''],
//             ['', '', '', '', '', '', '', ''],
//             ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
//             ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
//         ];
//         this.currentPlayer = 'white';
//         this.selectedPiece = null;
//         this.possibleMoves = [];
        
//         this.initBoard();
//         this.renderBoard();
//     }
    
//     initBoard() {
//         const boardElement = document.getElementById('board');
//         boardElement.innerHTML = '';
        
//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const square = document.createElement('div');
//                 square.className = `square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
//                 square.dataset.row = row;
//                 square.dataset.col = col;
                
//                 // Создаем элемент для изображения фигуры
//                 const pieceImg = document.createElement('img');
//                 pieceImg.className = 'piece-img';
//                 pieceImg.style.display = 'none';
//                 square.appendChild(pieceImg);
                
//                 square.addEventListener('click', () => this.handleSquareClick(row, col));
//                 boardElement.appendChild(square);
//             }
//         }
//     }
    
//     renderBoard() {
//         const squares = document.querySelectorAll('.square');
        
//         squares.forEach(square => {
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.board[row][col];
//             const pieceImg = square.querySelector('.piece-img');
            
//             // Очищаем предыдущие классы
//             square.classList.remove('selected', 'possible-move', 'capture-move');
            
//             // Устанавливаем изображение фигуры
//             if (piece) {
//                 pieceImg.src = pieceImages[piece];
//                 pieceImg.style.display = 'block';
//                 pieceImg.alt = piece;
//             } else {
//                 pieceImg.style.display = 'none';
//             }
            
//             // Подсвечиваем выбранную фигуру
//             if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//                 square.classList.add('selected');
//             }
            
//             // Подсвечиваем возможные ходы
//             const isPossibleMove = this.possibleMoves.some(move => move.row === row && move.col === col);
//             if (isPossibleMove) {
//                 if (piece && !this.isSameColor(piece, this.currentPlayer)) {
//                     square.classList.add('capture-move');
//                 } else {
//                     square.classList.add('possible-move');
//                 }
//             }
//         });
        
//         // Обновляем информацию о текущем игроке
//         document.getElementById('info').textContent = 
//             `Current player: ${this.currentPlayer.charAt(0).toUpperCase() + this.currentPlayer.slice(1)}`;
//     }
    
//     handleSquareClick(row, col) {
//         const piece = this.board[row][col];
        
//         // Если фигура уже выбрана
//         if (this.selectedPiece) {
//             // Проверяем, является ли клик допустимым ходом
//             const isValidMove = this.possibleMoves.some(
//                 move => move.row === row && move.col === col
//             );
            
//             if (isValidMove) {
//                 // Выполняем ход
//                 this.board[row][col] = this.selectedPiece.piece;
//                 this.board[this.selectedPiece.row][this.selectedPiece.col] = '';
                
//                 // Меняем игрока
//                 this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
//             }
            
//             // Сбрасываем выбор
//             this.selectedPiece = null;
//             this.possibleMoves = [];
//         } 
//         // Если фигура еще не выбрана и это фигура текущего игрока
//         else if (piece && this.isSameColor(piece, this.currentPlayer)) {
//             this.selectedPiece = { row, col, piece };
//             this.possibleMoves = this.getPossibleMoves(row, col, piece);
//         }
        
//         this.renderBoard();
//     }
    
//     isSameColor(piece, color) {
//         if (!piece) return false;
//         return (piece === piece.toUpperCase()) === (color === 'white');
//     }
    
//     getPossibleMoves(row, col, piece) {
//         // Реализация правил перемещения фигур (как в предыдущем примере)
//         // ...
//         return []; // Заглушка - реализуйте по аналогии с предыдущим кодом
//     }
// }

// // Инициализация игры при загрузке страницы
// document.addEventListener('DOMContentLoaded', () => {
//     new ChessGame();
// });