// class ChessGame {
//     constructor() {
//         this.boardLength = 8;
//         this.pieces = [
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
//         this.lastMove = null;
//         this.castlingRights = {
//             white: { kingside: true, queenside: true },
//             black: { kingside: true, queenside: true }
//         };
//         this.gameOver = false;
//         this.pendingPromotion = null;
//         this.gameStatus = 'Ход белых';
//         this.statusType = 'normal';
        
//         this.pieceImages = {
//             'p': '/static/images/black-pawn.png',
//             'k': '/static/images/black-king.png',
//             'q': '/static/images/black-queen.png',
//             'r': '/static/images/black-rook.png',
//             'b': '/static/images/black-bishop.png',
//             'n': '/static/images/black-knight.png',
//             'P': '/static/images/white-pawn.png',
//             'K': '/static/images/white-king.png',
//             'Q': '/static/images/white-queen.png',
//             'R': '/static/images/white-rook.png',
//             'B': '/static/images/white-bishop.png',
//             'N': '/static/images/white-knight.png'
//         };
        
//         this.initBoard();
//         this.renderBoard();
//         this.addEventListeners();
//         this.updateGameStatus();
//     }
    
//     initBoard() {
//         const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
//         const numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
//         const topLetters = document.getElementById('top-letters');
//         const bottomLetters = document.getElementById('bottom-letters');
//         const leftNumbers = document.getElementById('left-numbers');
//         const rightNumbers = document.getElementById('right-numbers');
        
//         letters.forEach(letter => {
//             const topDiv = document.createElement('div');
//             topDiv.className = 'top-letter';
//             topDiv.textContent = letter;
//             topLetters.appendChild(topDiv);
            
//             const bottomDiv = document.createElement('div');
//             bottomDiv.className = 'bottom-letter';
//             bottomDiv.textContent = letter;
//             bottomLetters.appendChild(bottomDiv);
//         });
        
//         numbers.forEach(number => {
//             const leftDiv = document.createElement('div');
//             leftDiv.className = 'left-number';
//             leftDiv.textContent = number;
//             leftNumbers.appendChild(leftDiv);
            
//             const rightDiv = document.createElement('div');
//             rightDiv.className = 'right-number';
//             rightDiv.textContent = number;
//             rightNumbers.appendChild(rightDiv);
//         });
        
//         const chessBoard = document.getElementById('chess-board');
//         chessBoard.innerHTML = '';
        
//         for (let i = 0; i < this.boardLength * this.boardLength; i++) {
//             const row = Math.floor(i / this.boardLength);
//             const col = i % this.boardLength;
            
//             const square = document.createElement('div');
//             square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
//             square.dataset.row = row;
//             square.dataset.col = col;
            
//             const pieceImg = document.createElement('img');
//             pieceImg.className = 'piece';
//             pieceImg.style.display = 'none';
//             square.appendChild(pieceImg);
            
//             chessBoard.appendChild(square);
//         }
//     }
    
//     renderBoard() {
//         const squares = document.querySelectorAll('.chess-square');
        
//         squares.forEach(square => {
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
//             const pieceImg = square.querySelector('.piece');
            
//             square.classList.remove('selected', 'possible-move', 'attackable-piece');
            
//             if (piece) {
//                 pieceImg.src = this.pieceImages[piece];
//                 pieceImg.style.display = 'block';
//                 pieceImg.alt = piece;
//             } else {
//                 pieceImg.style.display = 'none';
//             }
            
//             if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//                 square.classList.add('selected');
//             }
            
//             const isPossibleMove = this.possibleMoves.some(move => move.row === row && move.col === col);
//             if (isPossibleMove) {
//                 const isCapture = piece && !this.isSameColor(piece, this.selectedPiece?.piece);
//                 if (isCapture) {
//                     square.classList.add('attackable-piece');
//                 } else {
//                     square.classList.add('possible-move');
//                 }
//             }
//         });
//     }
    
//     addEventListeners() {
//         const chessBoard = document.getElementById('chess-board');
//         chessBoard.addEventListener('click', (event) => {
//             const square = event.target.closest('.chess-square');
//             if (!square) return;
            
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
            
//             this.handleSquareClick(row, col, piece);
//         });
//     }
    
//     handleSquareClick(row, col, piece) {
//         if (this.gameOver || this.pendingPromotion) return;
        
//         if (this.selectedPiece && this.possibleMoves.some(move => move.row === row && move.col === col)) {
//             this.movePiece(row, col);
//             return;
//         }
        
//         if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//             this.deselectPiece();
//             return;
//         }
        
//         if (piece && this.isSameColor(piece, this.currentPlayer)) {
//             this.selectPiece(row, col, piece);
//         } else {
//             this.deselectPiece();
//         }
//     }
    
//     isSameColor(piece1, piece2) {
//         if (!piece1 || !piece2) return false;
//         return (piece1 === piece1.toUpperCase()) === (piece2 === piece2.toUpperCase());
//     }
    
//     selectPiece(row, col, piece) {
//         this.selectedPiece = { row, col, piece };
//         this.possibleMoves = this.getPossibleMoves(row, col, piece);
//         this.renderBoard();
//     }
    
//     deselectPiece() {
//         this.selectedPiece = null;
//         this.possibleMoves = [];
//         this.renderBoard();
//     }
    
//     movePiece(toRow, toCol) {
//         if (!this.selectedPiece) return;
        
//         const from = this.selectedPiece;
//         const to = { row: toRow, col: toCol };
        
//         if (!this.isMoveValid(from, to)) {
//             console.log("Недопустимый ход!");
//             return;
//         }
        
//         const moveResult = this.executeMove(from, to);
        
//         if (moveResult.isPromotion) {
//             this.pendingPromotion = {
//                 from: { row: from.row, col: from.col },
//                 to: { row: toRow, col: toCol },
//                 piece: from.piece
//             };
            
//             this.showPromotionDialog(moveResult.promotionPosition);
//             return;
//         }
        
//         this.finalizeMove(moveResult, from, to);
//     }
    
//     finalizeMove(moveResult, from, to) {
//         this.pieces = moveResult.newPieces;
//         this.castlingRights = moveResult.newCastlingRights;
//         this.lastMove = {
//             from: { row: from.row, col: from.col },
//             to: { row: to.row, col: to.col },
//             piece: moveResult.newPieces[to.row][to.col],
//             captured: moveResult.capturedPiece
//         };
        
//         if (moveResult.isCheckmate) {
//             this.gameStatus = `Мат! ${this.currentPlayer === 'white' ? 'Белые' : 'Чёрные'} победили!`;
//             this.statusType = 'checkmate';
//             this.gameOver = true;
//         } else if (moveResult.isStalemate) {
//             this.gameStatus = "Пат! Ничья!";
//             this.statusType = 'stalemate';
//             this.gameOver = true;
//         } else if (moveResult.isCheck) {
//             this.gameStatus = "Шах!";
//             this.statusType = 'check';
//             this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
//         } else {
//             this.gameStatus = `Ход ${this.currentPlayer === 'white' ? 'чёрных' : 'белых'}`;
//             this.statusType = 'normal';
//             this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
//         }
        
//         this.deselectPiece();
//         this.updateGameStatus();
//         this.renderBoard();
//     }
    
//     showPromotionDialog(position) {
//         const color = this.currentPlayer;
//         const dialog = document.createElement('div');
//         dialog.className = 'promotion-dialog-overlay';
        
//         const content = document.createElement('div');
//         content.className = 'promotion-dialog';
        
//         const title = document.createElement('div');
//         title.className = 'promotion-title';
//         title.textContent = 'Выберите фигуру:';
//         content.appendChild(title);
        
//         const options = document.createElement('div');
//         options.className = 'promotion-options';
        
//         const pieces = [
//             { symbol: color === 'white' ? 'Q' : 'q', name: 'Ферзь' },
//             { symbol: color === 'white' ? 'R' : 'r', name: 'Ладья' },
//             { symbol: color === 'white' ? 'B' : 'b', name: 'Слон' },
//             { symbol: color === 'white' ? 'N' : 'n', name: 'Конь' }
//         ];
        
//         pieces.forEach(p => {
//             const option = document.createElement('div');
//             option.className = 'promotion-option';
//             option.textContent = p.name;
//             option.addEventListener('click', () => this.handlePromotionChoice(p.symbol));
//             options.appendChild(option);
//         });
        
//         content.appendChild(options);
//         dialog.appendChild(content);
//         document.body.appendChild(dialog);
//     }
    
//     handlePromotionChoice(promotionPiece) {
//         if (!this.pendingPromotion) return;
        
//         const moveResult = this.executeMove(
//             this.pendingPromotion.from,
//             this.pendingPromotion.to,
//             promotionPiece
//         );
        
//         document.querySelector('.promotion-dialog-overlay')?.remove();
//         this.finalizeMove(moveResult, this.pendingPromotion.from, this.pendingPromotion.to);
//         this.pendingPromotion = null;
//     }
    
//     updateGameStatus() {
//         const playerDisplay = document.getElementById('current-player');
//         if (playerDisplay) {
//             playerDisplay.textContent = this.currentPlayer === 'white' ? 'Current player: White' : 'Current player: Black';
//         }
//     }
    
//     getPossibleMoves(row, col, piece) {
//         return this.filterLegalMoves(
//             row, 
//             col, 
//             piece, 
//             this.getMovesForPiece(row, col, piece)
//         );
//     }
    
//     getMovesForPiece(row, col, piece) {
//         let moves;
//         switch (piece.toLowerCase()) {
//             case 'p': 
//                 moves = this.getPawnMoves(row, col, piece);
//                 break;
//             case 'r': 
//                 moves = this.getRookMoves(row, col, piece);
//                 break;
//             case 'n': 
//                 moves = this.getKnightMoves(row, col, piece);
//                 break;
//             case 'b': 
//                 moves = this.getBishopMoves(row, col, piece);
//                 break;
//             case 'q': 
//                 moves = this.getQueenMoves(row, col, piece);
//                 break;
//             case 'k': 
//                 moves = this.getKingMoves(row, col, piece);
//                 break;
//             default: 
//                 moves = [];
//         }
//         return moves;
//     }
    
//     getPawnMoves(row, col, piece) {
//         const moves = [];
//         const direction = piece === 'P' ? -1 : 1;
//         const startRow = piece === 'P' ? 6 : 1;
//         const isWhite = piece === 'P';

//         if (this.pieces[row + direction]?.[col] === '') {
//             moves.push({ row: row + direction, col });
//             if (row === startRow && this.pieces[row + 2 * direction]?.[col] === '') {
//                 moves.push({ row: row + 2 * direction, col });
//             }
//         }
        
//         for (let dx of [-1, 1]) {
//             const targetCol = col + dx;
//             const targetRow = row + direction;
//             if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
//                 const targetPiece = this.pieces[targetRow][targetCol];
//                 if (targetPiece && !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: targetRow, col: targetCol });
//                 }
//                 else if (this.lastMove?.piece?.toLowerCase() === 'p' && 
//                         Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
//                         this.lastMove.to.row === row &&
//                         this.lastMove.to.col === targetCol) {
//                     moves.push({ row: targetRow, col: targetCol });
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getRookMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 0 }, { r: -1, c: 0 }, { r: 0, c: 1 }, { r: 0, c: -1 }
//         ];

//         for (let dir of directions) {
//             let r = row, c = col;
//             while (true) {
//                 r += dir.r;
//                 c += dir.c;
//                 if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
//                 const targetPiece = this.pieces[r][c];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: r, col: c });
//                     if (targetPiece !== '') break;
//                 } else {
//                     break;
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getKnightMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 2, c: 1 }, { r: 2, c: -1 },
//             { r: -2, c: 1 }, { r: -2, c: -1 },
//             { r: 1, c: 2 }, { r: 1, c: -2 },
//             { r: -1, c: 2 }, { r: -1, c: -2 },
//         ];

//         for (let dir of directions) {
//             const newRow = row + dir.r;
//             const newCol = col + dir.c;
//             if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//                 const targetPiece = this.pieces[newRow][newCol];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: newRow, col: newCol });
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getBishopMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 1 }, { r: 1, c: -1 }, { r: -1, c: 1 }, { r: -1, c: -1 }
//         ];

//         for (let dir of directions) {
//             let r = row, c = col;
//             while (true) {
//                 r += dir.r;
//                 c += dir.c;
//                 if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
//                 const targetPiece = this.pieces[r][c];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: r, col: c });
//                     if (targetPiece !== '') break;
//                 } else {
//                     break;
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getQueenMoves(row, col, piece) {
//         return [...this.getRookMoves(row, col, piece), ...this.getBishopMoves(row, col, piece)];
//     }
    
//     getKingMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 0 }, { r: -1, c: 0 },
//             { r: 0, c: 1 }, { r: 0, c: -1 },
//             { r: 1, c: 1 }, { r: 1, c: -1 },
//             { r: -1, c: 1 }, { r: -1, c: -1 }
//         ];

//         for (let dir of directions) {
//             const newRow = row + dir.r;
//             const newCol = col + dir.c;
//             if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//                 const targetPiece = this.pieces[newRow][newCol];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: newRow, col: newCol });
//                 }
//             }
//         }

//         // Рокировка
//         const isWhite = piece === 'K';
//         const color = isWhite ? 'white' : 'black';
//         const backRank = isWhite ? 7 : 0;
        
//         if (row === backRank && col === 4) {
//             // Короткая рокировка
//             if (this.castlingRights[color]?.kingside && 
//                 this.pieces[backRank][5] === '' && 
//                 this.pieces[backRank][6] === '' && 
//                 this.pieces[backRank][7]?.toLowerCase() === 'r') {
                
//                 const squaresToCheck = [[backRank, 4], [backRank, 5], [backRank, 6]];
//                 const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                
//                 if (isSafe) {
//                     moves.push({ 
//                         row: backRank, 
//                         col: 6, 
//                         isCastling: true,
//                         type: isWhite ? 'WHITE_KINGSIDE' : 'BLACK_KINGSIDE'
//                     });
//                 }
//             }
            
//             // Длинная рокировка
//             if (this.castlingRights[color]?.queenside && 
//                 this.pieces[backRank][3] === '' && 
//                 this.pieces[backRank][2] === '' && 
//                 this.pieces[backRank][1] === '' && 
//                 this.pieces[backRank][0]?.toLowerCase() === 'r') {
                
//                 const squaresToCheck = [[backRank, 4], [backRank, 3], [backRank, 2]];
//                 const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                
//                 if (isSafe) {
//                     moves.push({ 
//                         row: backRank, 
//                         col: 2, 
//                         isCastling: true,
//                         type: isWhite ? 'WHITE_QUEENSIDE' : 'BLACK_QUEENSIDE'
//                     });
//                 }
//             }
//         }

//         return moves;
//     }
    
//     filterLegalMoves(row, col, piece, moves) {
//         return moves.filter(move => {
//             const newPieces = this.copyBoard();
            
//             if (move.isCastling) {
//                 return true;
//             }
            
//             newPieces[move.row][move.col] = piece;
//             newPieces[row][col] = '';
            
//             return !this.isKingInCheck(newPieces, piece === piece.toUpperCase());
//         });
//     }
    
//     isSquareAttacked(row, col, byWhite) {
//         for (let r = 0; r < 8; r++) {
//             for (let c = 0; c < 8; c++) {
//                 const piece = this.pieces[r][c];
//                 if (piece === '') continue;
                
//                 const isWhitePiece = piece === piece.toUpperCase();
//                 if (isWhitePiece === byWhite) {
//                     const moves = this.getMovesForPiece(r, c, piece);
//                     if (moves.some(m => m.row === row && m.col === col)) {
//                         return true;
//                     }
//                 }
//             }
//         }
//         return false;
//     }
    
//     isKingInCheck(pieces, isWhiteTurn) {
//         const kingSymbol = isWhiteTurn ? 'K' : 'k';
//         let kingPos = null;

//         for (let r = 0; r < 8 && !kingPos; r++) {
//             for (let c = 0; c < 8; c++) {
//                 if (pieces[r][c] === kingSymbol) {
//                     kingPos = { row: r, col: c };
//                     break;
//                 }
//             }
//         }

//         if (!kingPos) return true;

//         return this.isSquareAttacked(kingPos.row, kingPos.col, !isWhiteTurn);
//     }
    
//     isMoveValid(from, to) {
//         const piece = this.pieces[from.row][from.col];
//         if (!piece) return false;

//         const moves = this.getPossibleMoves(from.row, from.col, piece);
//         const isValid = moves.some(m => m.row === to.row && m.col === to.col);
//         if (!isValid) return false;

//         const tempState = this.executeMove(from, to);
//         return !this.isKingInCheck(tempState.newPieces, piece === piece.toUpperCase());
//     }
    
//     executeMove(from, to, promotionChoice = null) {
//         const isWhite = this.currentPlayer === 'white';
//         const newPieces = this.copyBoard();
//         let piece = newPieces[from.row][from.col];
//         let capturedPiece = newPieces[to.row][to.col];
//         let newCastlingRights = this.updateCastlingRights(piece, from);
//         let isPromotion = false;

//         const result = {
//             newPieces,
//             newCastlingRights,
//             capturedPiece,
//             isCheck: false,
//             isCheckmate: false,
//             isStalemate: false,
//             isPromotion: false,
//             promotionPosition: null
//         };

//         if (piece.toLowerCase() === 'k' && Math.abs(from.col - to.col) === 2) {
//             const castlingType = isWhite 
//                 ? (to.col === 6 ? 'WHITE_KINGSIDE' : 'WHITE_QUEENSIDE')
//                 : (to.col === 6 ? 'BLACK_KINGSIDE' : 'BLACK_QUEENSIDE');
            
//             result.newPieces = this.performCastling(newPieces, castlingType);
//             result.capturedPiece = null;
//         } 
//         else {
//             result.newPieces[to.row][to.col] = piece;
//             result.newPieces[from.row][from.col] = '';

//             if (piece.toLowerCase() === 'p' && Math.abs(from.col - to.col) === 1 && !capturedPiece) {
//                 const direction = piece === 'P' ? -1 : 1;
//                 result.capturedPiece = result.newPieces[to.row - direction][to.col];
//                 result.newPieces[to.row - direction][to.col] = '';
//             }

//             if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
//                 result.isPromotion = true;
//                 result.promotionPosition = to;
                
//                 if (promotionChoice) {
//                     result.newPieces[to.row][to.col] = promotionChoice;
//                     result.isPromotion = false;
//                 } else {
//                     result.newPieces[to.row][to.col] = piece;
//                     result.newPieces[from.row][from.col] = '';
//                     return result;
//                 }
//             }
//         }

//         const opponentColor = isWhite ? 'black' : 'white';
//         result.isCheck = this.isKingInCheck(result.newPieces, !isWhite);

//         if (!result.isPromotion) {
//             if (result.isCheck) {
//                 result.isCheckmate = this.isCheckmate(result.newPieces, !isWhite);
//             } else {
//                 result.isStalemate = this.isStalemate(result.newPieces, !isWhite);
//             }
//         }

//         return result;
//     }
    
//     performCastling(pieces, castlingType) {
//         const newPieces = this.copyBoard(pieces);
//         const { kingTo, rookFrom, rookTo } = this.getCastlingInfo(castlingType);
        
//         newPieces[kingTo[0]][kingTo[1]] = newPieces[kingTo[0]][4];
//         newPieces[kingTo[0]][4] = '';
        
//         newPieces[rookTo[0]][rookTo[1]] = newPieces[rookFrom[0]][rookFrom[1]];
//         newPieces[rookFrom[0]][rookFrom[1]] = '';
        
//         return newPieces;
//     }
    
//     getCastlingInfo(type) {
//         const CASTLING = {
//             WHITE_KINGSIDE: { kingTo: [7, 6], rookFrom: [7, 7], rookTo: [7, 5] },
//             WHITE_QUEENSIDE: { kingTo: [7, 2], rookFrom: [7, 0], rookTo: [7, 3] },
//             BLACK_KINGSIDE: { kingTo: [0, 6], rookFrom: [0, 7], rookTo: [0, 5] },
//             BLACK_QUEENSIDE: { kingTo: [0, 2], rookFrom: [0, 0], rookTo: [0, 3] }
//         };
//         return CASTLING[type];
//     }
    
//     updateCastlingRights(piece, from) {
//         const newRights = {...this.castlingRights};
//         const currentPlayer = this.currentPlayer;
        
//         if (piece.toLowerCase() === 'k') {
//             newRights[currentPlayer] = { kingside: false, queenside: false };
//         } 
//         else if (piece.toLowerCase() === 'r') {
//             if (currentPlayer === 'white') {
//                 if (from.col === 0) newRights.white.queenside = false;
//                 if (from.col === 7) newRights.white.kingside = false;
//             } else {
//                 if (from.col === 0) newRights.black.queenside = false;
//                 if (from.col === 7) newRights.black.kingside = false;
//             }
//         }
        
//         return newRights;
//     }
    
//     isCheckmate(pieces, isWhiteTurn) {
//         if (!this.isKingInCheck(pieces, isWhiteTurn)) {
//             return false;
//         }

//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const piece = pieces[row][col];
//                 if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
//                     const moves = this.getMovesForPiece(row, col, piece);
//                     for (const move of moves) {
//                         const newPieces = this.copyBoard(pieces);
//                         newPieces[move.row][move.col] = piece;
//                         newPieces[row][col] = '';
                        
//                         if (!this.isKingInCheck(newPieces, isWhiteTurn)) {
//                             return false;
//                         }
//                     }
//                 }
//             }
//         }
        
//         return true;
//     }
    
//     isStalemate(pieces, isWhiteTurn) {
//         if (this.isKingInCheck(pieces, isWhiteTurn)) {
//             return false;
//         }

//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const piece = pieces[row][col];
//                 if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
//                     const moves = this.getMovesForPiece(row, col, piece);
//                     if (moves.length > 0) {
//                         return false;
//                     }
//                 }
//             }
//         }
        
//         return true;
//     }
    
//     copyBoard(board = this.pieces) {
//         return board.map(row => [...row]);
//     }
// }

// // Инициализация игры при загрузке страницы
// document.addEventListener('DOMContentLoaded', () => {
//     new ChessGame();
// });











// class ChessGame {
//     constructor(gameId) {
//         this.gameId = gameId;
//         this.socket = null;
//         this.playerColor = null;
//         this.initializeSocket();
//         this.boardLength = 8;
//         this.pieces = [
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
//         this.lastMove = null;
//         this.castlingRights = {
//             white: { kingside: true, queenside: true },
//             black: { kingside: true, queenside: true }
//         };
//         this.gameOver = false;
//         this.pendingPromotion = null;
//         this.gameStatus = 'Ход белых';
//         this.statusType = 'normal';
//         this.capturedPieces = {
//             white: [],
//             black: []
//         };
        
//         this.pieceImages = {
//             'p': '/static/images/black-pawn.png',
//             'k': '/static/images/black-king.png',
//             'q': '/static/images/black-queen.png',
//             'r': '/static/images/black-rook.png',
//             'b': '/static/images/black-bishop.png',
//             'n': '/static/images/black-knight.png',
//             'P': '/static/images/white-pawn.png',
//             'K': '/static/images/white-king.png',
//             'Q': '/static/images/white-queen.png',
//             'R': '/static/images/white-rook.png',
//             'B': '/static/images/white-bishop.png',
//             'N': '/static/images/white-knight.png'
//         };
        
//         this.initBoard();
//         this.renderBoard();
//         this.addEventListeners();
//         this.updateGameStatus();
//         this.updateCapturedPiecesDisplay();
//     }
//     initializeSocket() {
//         console.log('Hi')
//         const game_id = "{{game_id}}"
//         // let url = `ws://${window.location.host}/ws/room/${game_id}/`;
//         // const chatSocket = new WebSocket(url);
//         this.socket = new WebSocket(
//             `ws://${window.location.host}/ws/game/${game_id}/`
//         );

//         this.socket.onmessage = (e) => {
//             const data = JSON.parse(e.data);
//             switch(data.type) {
//                 case 'game_init':
//                     this.handleGameInit(data);
//                     break;
//                 case 'game_update':
//                     this.handleGameUpdate(data);
//                     break;
//             }
//         };

//         this.socket.onclose = (e) => {
//             console.log('WebSocket disconnected');
//         };
//     }
//     handleGameInit(data) {
//         console.log('Game init data:', data);
//         this.playerColor = data.player_color;
//         this.pieces = data.board;
//         this.currentPlayer = data.current_player;
//         this.renderBoard();
//         this.updateGameStatus();
//     }
//     handleGameUpdate(data) {
//         this.pieces = data.board;
//         this.currentPlayer = data.current_player;
//         this.lastMove = data.move;
//         this.renderBoard();
//         this.updateGameStatus();
//     }

//     sendMove(from, to, promotion = null) {
//         if (this.socket.readyState === WebSocket.OPEN) {
//             this.socket.send(JSON.stringify({
//                 type: "make_move",
//                 from: from,
//                 to: to,
//                 promotion: promotion
//             }));
//         }
//     }


//     initBoard() {
//         const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
//         const numbers = ['8', '7', '6', '5', '4', '3', '2', '1'];
        
//         const topLetters = document.getElementById('top-letters');
//         const bottomLetters = document.getElementById('bottom-letters');
//         const leftNumbers = document.getElementById('left-numbers');
//         const rightNumbers = document.getElementById('right-numbers');
        
//         letters.forEach(letter => {
//             const topDiv = document.createElement('div');
//             topDiv.className = 'top-letter';
//             topDiv.textContent = letter;
//             topLetters.appendChild(topDiv);
            
//             const bottomDiv = document.createElement('div');
//             bottomDiv.className = 'bottom-letter';
//             bottomDiv.textContent = letter;
//             bottomLetters.appendChild(bottomDiv);
//         });
        
//         numbers.forEach(number => {
//             const leftDiv = document.createElement('div');
//             leftDiv.className = 'left-number';
//             leftDiv.textContent = number;
//             leftNumbers.appendChild(leftDiv);
            
//             const rightDiv = document.createElement('div');
//             rightDiv.className = 'right-number';
//             rightDiv.textContent = number;
//             rightNumbers.appendChild(rightDiv);
//         });
        
//         const chessBoard = document.getElementById('chess-board');
//         chessBoard.innerHTML = '';
        
//         for (let i = 0; i < this.boardLength * this.boardLength; i++) {
//             const row = Math.floor(i / this.boardLength);
//             const col = i % this.boardLength;
            
//             const square = document.createElement('div');
//             square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
//             square.dataset.row = row;
//             square.dataset.col = col;
            
//             const pieceImg = document.createElement('img');
//             pieceImg.className = 'piece';
//             pieceImg.style.display = 'none';
//             square.appendChild(pieceImg);
            
//             chessBoard.appendChild(square);
//         }
//     }
    
//     renderBoard() {
//         const squares = document.querySelectorAll('.chess-square');
//         if (!chessBoard) {
//             console.error('Chess board element not found!');
//             return;
//         }
//         squares.forEach(square => {
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
//             const pieceImg = square.querySelector('.piece');
            
//             square.classList.remove('selected', 'possible-move', 'attackable-piece');
            
//             if (piece) {
//                 pieceImg.src = this.pieceImages[piece];
//                 pieceImg.style.display = 'block';
//                 pieceImg.alt = piece;
//             } else {
//                 pieceImg.style.display = 'none';
//             }
            
//             if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//                 square.classList.add('selected');
//             }
            
//             const isPossibleMove = this.possibleMoves.some(move => move.row === row && move.col === col);
//             if (isPossibleMove) {
//                 const isCapture = piece && !this.isSameColor(piece, this.selectedPiece?.piece);
//                 if (isCapture) {
//                     square.classList.add('attackable-piece');
//                 } else {
//                     square.classList.add('possible-move');
//                 }
//             }
//         });
//     }
    
//     addEventListeners() {
//         const chessBoard = document.getElementById('chess-board');
//         chessBoard.addEventListener('click', (event) => {
//             const square = event.target.closest('.chess-square');
//             if (!square) return;
            
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
            
//             this.handleSquareClick(row, col, piece);
//         });
//     }
    
//     handleSquareClick(row, col, piece) {
//         if (this.gameOver || this.pendingPromotion) return;
        
//         if (this.selectedPiece && this.possibleMoves.some(move => move.row === row && move.col === col)) {
//             this.movePiece(row, col);
//             return;
//         }
        
//         if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//             this.deselectPiece();
//             return;
//         }
        
//         // Измененная проверка
//         if (piece && (piece === piece.toUpperCase()) === (this.currentPlayer === 'white')) {
//             this.selectPiece(row, col, piece);
//         } else {
//             this.deselectPiece();
//         }
//     }
    
//     isSameColor(piece1, piece2) {
//         if (!piece1 || !piece2) return false;
//         const isWhite1 = piece1 === piece1.toUpperCase();
//         const isWhite2 = typeof piece2 === 'string' ? piece2 === piece2.toUpperCase() : piece2 === 'white';
//         return isWhite1 === isWhite2;
//     }
    
//     selectPiece(row, col, piece) {
//         this.selectedPiece = { row, col, piece };
//         this.possibleMoves = this.getPossibleMoves(row, col, piece);
//         this.renderBoard();
//     }
    
//     deselectPiece() {
//         this.selectedPiece = null;
//         this.possibleMoves = [];
//         this.renderBoard();
//     }
    
//     movePiece(toRow, toCol) {
//         if (!this.selectedPiece) return;

//         const from = this.selectedPiece;
//         const to = { row: toRow, col: toCol };
        
//         if (!this.isMoveValid(from, to)) {
//             console.log("Invalid move!");
//             return;
//         }

//         const moveResult = this.executeMove(from, to);
        
//         if (moveResult.isPromotion) {
//             this.showPromotionDialog(moveResult.promotionPosition, (promotionChoice) => {
//                 const fromPos = this.toChessNotation(from.row, from.col);
//                 const toPos = this.toChessNotation(toRow, toCol);
//                 this.sendMove(fromPos, toPos, promotionChoice);
//             });
//             return;
//         }

//         const fromPos = this.toChessNotation(from.row, from.col);
//         const toPos = this.toChessNotation(toRow, toCol);
//         this.sendMove(fromPos, toPos);
//     }
//     toChessNotation(row, col) {
//         const letter = String.fromCharCode(97 + col);
//         const number = 8 - row;
//         return `${letter}${number}`;
//     }
//     finalizeMove(moveResult, from, to) {
//         this.pieces = moveResult.newPieces;
//         this.castlingRights = moveResult.newCastlingRights;
//         this.lastMove = {
//             from: { row: from.row, col: from.col },
//             to: { row: to.row, col: to.col },
//             piece: moveResult.newPieces[to.row][to.col],
//             captured: moveResult.capturedPiece
//         };
        
//         // Добавляем съеденную фигуру в список
//         if (moveResult.capturedPiece) {
//             const color = this.currentPlayer === 'white' ? 'white' : 'black';
//             this.capturedPieces[color].push(moveResult.capturedPiece);
//             this.updateCapturedPiecesDisplay();
//         }
        
//         if (moveResult.isCheckmate) {
//             this.gameStatus = `Мат! ${this.currentPlayer === 'white' ? 'Белые' : 'Чёрные'} победили!`;
//             this.statusType = 'checkmate';
//             this.gameOver = true;
//         } else if (moveResult.isStalemate) {
//             this.gameStatus = "Пат! Ничья!";
//             this.statusType = 'stalemate';
//             this.gameOver = true;
//         } else if (moveResult.isCheck) {
//             this.gameStatus = `Шах! Ход ${this.currentPlayer === 'white' ? 'чёрных' : 'белых'}`;
//             this.statusType = 'check';
//             this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
//         } else {
//             this.gameStatus = `Ход ${this.currentPlayer === 'white' ? 'чёрных' : 'белых'}`;
//             this.statusType = 'normal';
//             this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
//         }
        
//         this.deselectPiece();
//         this.updateGameStatus();
//         this.renderBoard();
//     }
    
//     updateCapturedPiecesDisplay() {
//         const whiteCaptured = document.getElementById('white-captured');
//         const blackCaptured = document.getElementById('black-captured');
        
//         if (whiteCaptured) {
//             whiteCaptured.innerHTML = this.capturedPieces.white.map(p => 
//                 `<img src="${this.pieceImages[p.toLowerCase()]}" alt="${p}" class="captured-piece">`
//             ).join('');
//         }
        
//         if (blackCaptured) {
//             blackCaptured.innerHTML = this.capturedPieces.black.map(p => 
//                 `<img src="${this.pieceImages[p]}" alt="${p}" class="captured-piece">`
//             ).join('');
//         }
//     }
    
//     showPromotionDialog(position) {
//         const color = this.currentPlayer;
//         const dialog = document.createElement('div');
//         dialog.className = 'promotion-dialog-overlay';
        
//         const content = document.createElement('div');
//         content.className = 'promotion-dialog';
        
//         const title = document.createElement('div');
//         title.className = 'promotion-title';
//         title.textContent = 'Выберите фигуру:';
//         content.appendChild(title);
        
//         const options = document.createElement('div');
//         options.className = 'promotion-options';
        
      
//         const pieces = [
//             { symbol: color === 'white' ? 'Q' : 'q', name: 'Ферзь' },
//             { symbol: color === 'white' ? 'R' : 'r', name: 'Ладья' },
//             { symbol: color === 'white' ? 'B' : 'b', name: 'Слон' },
//             { symbol: color === 'white' ? 'N' : 'n', name: 'Конь' }
//         ];
        
//         pieces.forEach(p => {
//             const option = document.createElement('div');
//             option.className = 'promotion-option';
//             option.textContent = p.name;
//             option.addEventListener('click', () => this.handlePromotionChoice(p.symbol));
//             options.appendChild(option);
//         });
        
//         content.appendChild(options);
//         dialog.appendChild(content);
//         document.body.appendChild(dialog);
//     }
    
//     handlePromotionChoice(promotionPiece) {
//         if (!this.pendingPromotion) return;
        
//         const moveResult = this.executeMove(
//             this.pendingPromotion.from,
//             this.pendingPromotion.to,
//             promotionPiece
//         );
        
//         document.querySelector('.promotion-dialog-overlay')?.remove();
//         this.finalizeMove(moveResult, this.pendingPromotion.from, this.pendingPromotion.to);
//         this.pendingPromotion = null;
//     }
    
//     updateGameStatus() {
//         const statusElement = document.getElementById('game-status');
//         if (statusElement) {
//             statusElement.textContent = this.gameStatus;
//             statusElement.className = `status-${this.statusType}`;
//         }
        
//         const playerDisplay = document.getElementById('current-player');
//         if (playerDisplay) {
//             playerDisplay.textContent = this.currentPlayer === 'white' ? 'Текущий игрок: Белые' : 'Текущий игрок: Чёрные';
//             playerDisplay.className = `player-${this.currentPlayer}`;
//         }
//     }
    
//     getPossibleMoves(row, col, piece) {
//         return this.filterLegalMoves(
//             row, 
//             col, 
//             piece, 
//             this.getMovesForPiece(row, col, piece)
//         );
//     }
    
//     getMovesForPiece(row, col, piece) {
//         let moves;
//         switch (piece.toLowerCase()) {
//             case 'p': 
//                 moves = this.getPawnMoves(row, col, piece);
//                 break;
//             case 'r': 
//                 moves = this.getRookMoves(row, col, piece);
//                 break;
//             case 'n': 
//                 moves = this.getKnightMoves(row, col, piece);
//                 break;
//             case 'b': 
//                 moves = this.getBishopMoves(row, col, piece);
//                 break;
//             case 'q': 
//                 moves = this.getQueenMoves(row, col, piece);
//                 break;
//             case 'k': 
//                 moves = this.getKingMoves(row, col, piece);
//                 break;
//             default: 
//                 moves = [];
//         }
//         return moves;
//     }
    
//     getPawnMoves(row, col, piece) {
//         const moves = [];
//         const direction = piece === 'P' ? -1 : 1;
//         const startRow = piece === 'P' ? 6 : 1;
//         const isWhite = piece === 'P';

//         if (this.pieces[row + direction]?.[col] === '') {
//             moves.push({ row: row + direction, col });
//             if (row === startRow && this.pieces[row + 2 * direction]?.[col] === '') {
//                 moves.push({ row: row + 2 * direction, col });
//             }
//         }
        
//         for (let dx of [-1, 1]) {
//             const targetCol = col + dx;
//             const targetRow = row + direction;
//             if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
//                 const targetPiece = this.pieces[targetRow][targetCol];
//                 if (targetPiece && !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: targetRow, col: targetCol });
//                 }
//                 else if (this.lastMove?.piece?.toLowerCase() === 'p' && 
//                         Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
//                         this.lastMove.to.row === row &&
//                         this.lastMove.to.col === targetCol) {
//                     moves.push({ row: targetRow, col: targetCol });
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getRookMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 0 }, { r: -1, c: 0 }, { r: 0, c: 1 }, { r: 0, c: -1 }
//         ];

//         for (let dir of directions) {
//             let r = row, c = col;
//             while (true) {
//                 r += dir.r;
//                 c += dir.c;
//                 if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
//                 const targetPiece = this.pieces[r][c];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: r, col: c });
//                     if (targetPiece !== '') break;
//                 } else {
//                     break;
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getKnightMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 2, c: 1 }, { r: 2, c: -1 },
//             { r: -2, c: 1 }, { r: -2, c: -1 },
//             { r: 1, c: 2 }, { r: 1, c: -2 },
//             { r: -1, c: 2 }, { r: -1, c: -2 },
//         ];

//         for (let dir of directions) {
//             const newRow = row + dir.r;
//             const newCol = col + dir.c;
//             if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//                 const targetPiece = this.pieces[newRow][newCol];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: newRow, col: newCol });
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getBishopMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 1 }, { r: 1, c: -1 }, { r: -1, c: 1 }, { r: -1, c: -1 }
//         ];

//         for (let dir of directions) {
//             let r = row, c = col;
//             while (true) {
//                 r += dir.r;
//                 c += dir.c;
//                 if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
//                 const targetPiece = this.pieces[r][c];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: r, col: c });
//                     if (targetPiece !== '') break;
//                 } else {
//                     break;
//                 }
//             }
//         }
//         return moves;
//     }
    
//     getQueenMoves(row, col, piece) {
//         return [...this.getRookMoves(row, col, piece), ...this.getBishopMoves(row, col, piece)];
//     }
    
//     getKingMoves(row, col, piece) {
//         const moves = [];
//         const directions = [
//             { r: 1, c: 0 }, { r: -1, c: 0 },
//             { r: 0, c: 1 }, { r: 0, c: -1 },
//             { r: 1, c: 1 }, { r: 1, c: -1 },
//             { r: -1, c: 1 }, { r: -1, c: -1 }
//         ];

//         for (let dir of directions) {
//             const newRow = row + dir.r;
//             const newCol = col + dir.c;
//             if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
//                 const targetPiece = this.pieces[newRow][newCol];
//                 if (targetPiece === '' || !this.isSameColor(piece, targetPiece)) {
//                     moves.push({ row: newRow, col: newCol });
//                 }
//             }
//         }

//         // Рокировка
//         const isWhite = piece === 'K';
//         const color = isWhite ? 'white' : 'black';
//         const backRank = isWhite ? 7 : 0;
        
//         if (row === backRank && col === 4) {
//             // Короткая рокировка
//             if (this.castlingRights[color]?.kingside && 
//                 this.pieces[backRank][5] === '' && 
//                 this.pieces[backRank][6] === '' && 
//                 this.pieces[backRank][7]?.toLowerCase() === 'r') {
                
//                 const squaresToCheck = [[backRank, 4], [backRank, 5], [backRank, 6]];
//                 const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                
//                 if (isSafe) {
//                     moves.push({ 
//                         row: backRank, 
//                         col: 6, 
//                         isCastling: true,
//                         type: isWhite ? 'WHITE_KINGSIDE' : 'BLACK_KINGSIDE'
//                     });
//                 }
//             }
            
//             // Длинная рокировка
//             if (this.castlingRights[color]?.queenside && 
//                 this.pieces[backRank][3] === '' && 
//                 this.pieces[backRank][2] === '' && 
//                 this.pieces[backRank][1] === '' && 
//                 this.pieces[backRank][0]?.toLowerCase() === 'r') {
                
//                 const squaresToCheck = [[backRank, 4], [backRank, 3], [backRank, 2]];
//                 const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                
//                 if (isSafe) {
//                     moves.push({ 
//                         row: backRank, 
//                         col: 2, 
//                         isCastling: true,
//                         type: isWhite ? 'WHITE_QUEENSIDE' : 'BLACK_QUEENSIDE'
//                     });
//                 }
//             }
//         }

//         return moves;
//     }
    
//     filterLegalMoves(row, col, piece, moves) {
//         return moves.filter(move => {
//             const newPieces = this.copyBoard();
            
//             if (move.isCastling) {
//                 return true;
//             }
            
//             newPieces[move.row][move.col] = piece;
//             newPieces[row][col] = '';
            
//             return !this.isKingInCheck(newPieces, piece === piece.toUpperCase());
//         });
//     }
    
//     isSquareAttacked(row, col, byWhite) {
//         for (let r = 0; r < 8; r++) {
//             for (let c = 0; c < 8; c++) {
//                 const piece = this.pieces[r][c];
//                 if (piece === '') continue;
                
//                 const isWhitePiece = piece === piece.toUpperCase();
//                 if (isWhitePiece === byWhite) {
//                     const moves = this.getMovesForPiece(r, c, piece);
//                     if (moves.some(m => m.row === row && m.col === col)) {
//                         return true;
//                     }
//                 }
//             }
//         }
//         return false;
//     }
    
//     isKingInCheck(pieces, isWhiteTurn) {
//         const kingSymbol = isWhiteTurn ? 'K' : 'k';
//         let kingPos = null;

//         for (let r = 0; r < 8 && !kingPos; r++) {
//             for (let c = 0; c < 8; c++) {
//                 if (pieces[r][c] === kingSymbol) {
//                     kingPos = { row: r, col: c };
//                     break;
//                 }
//             }
//         }

//         if (!kingPos) return true;

//         return this.isSquareAttacked(kingPos.row, kingPos.col, !isWhiteTurn);
//     }
    
//     isMoveValid(from, to) {
//         const piece = this.pieces[from.row][from.col];
//         if (!piece) return false;

//         const moves = this.getPossibleMoves(from.row, from.col, piece);
//         const isValid = moves.some(m => m.row === to.row && m.col === to.col);
//         if (!isValid) return false;

//         const tempState = this.executeMove(from, to);
//         return !this.isKingInCheck(tempState.newPieces, piece === piece.toUpperCase());
//     }
    
//     executeMove(from, to, promotionChoice = null) {
//         const isWhite = this.currentPlayer === 'white';
//         const newPieces = this.copyBoard();
//         let piece = newPieces[from.row][from.col];
//         let capturedPiece = newPieces[to.row][to.col];
//         let newCastlingRights = this.updateCastlingRights(piece, from);
//         let isPromotion = false;

//         const result = {
//             newPieces,
//             newCastlingRights,
//             capturedPiece,
//             isCheck: false,
//             isCheckmate: false,
//             isStalemate: false,
//             isPromotion: false,
//             promotionPosition: null
//         };

//         if (piece.toLowerCase() === 'k' && Math.abs(from.col - to.col) === 2) {
//             const castlingType = isWhite 
//                 ? (to.col === 6 ? 'WHITE_KINGSIDE' : 'WHITE_QUEENSIDE')
//                 : (to.col === 6 ? 'BLACK_KINGSIDE' : 'BLACK_QUEENSIDE');
            
//             result.newPieces = this.performCastling(newPieces, castlingType);
//             result.capturedPiece = null;
//         } 
//         else {
//             result.newPieces[to.row][to.col] = piece;
//             result.newPieces[from.row][from.col] = '';

//             if (piece.toLowerCase() === 'p' && Math.abs(from.col - to.col) === 1 && !capturedPiece) {
//                 const direction = piece === 'P' ? -1 : 1;
//                 result.capturedPiece = result.newPieces[to.row - direction][to.col];
//                 result.newPieces[to.row - direction][to.col] = '';
//             }

//             if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
//                 result.isPromotion = true;
//                 result.promotionPosition = to;
                
//                 if (promotionChoice) {
//                     result.newPieces[to.row][to.col] = promotionChoice;
//                     result.isPromotion = false;
//                 } else {
//                     result.newPieces[to.row][to.col] = piece;
//                     result.newPieces[from.row][from.col] = '';
//                     return result;
//                 }
//             }
//         }

//         const opponentColor = isWhite ? 'black' : 'white';
//         result.isCheck = this.isKingInCheck(result.newPieces, !isWhite);

//         if (!result.isPromotion) {
//             if (result.isCheck) {
//                 result.isCheckmate = this.isCheckmate(result.newPieces, !isWhite);
//             } else {
//                 result.isStalemate = this.isStalemate(result.newPieces, !isWhite);
//             }
//         }

//         return result;
//     }
    
//     performCastling(pieces, castlingType) {
//         const newPieces = this.copyBoard(pieces);
//         const { kingTo, rookFrom, rookTo } = this.getCastlingInfo(castlingType);
        
//         newPieces[kingTo[0]][kingTo[1]] = newPieces[kingTo[0]][4];
//         newPieces[kingTo[0]][4] = '';
        
//         newPieces[rookTo[0]][rookTo[1]] = newPieces[rookFrom[0]][rookFrom[1]];
//         newPieces[rookFrom[0]][rookFrom[1]] = '';
        
//         return newPieces;
//     }
    
//     getCastlingInfo(type) {
//         const CASTLING = {
//             WHITE_KINGSIDE: { kingTo: [7, 6], rookFrom: [7, 7], rookTo: [7, 5] },
//             WHITE_QUEENSIDE: { kingTo: [7, 2], rookFrom: [7, 0], rookTo: [7, 3] },
//             BLACK_KINGSIDE: { kingTo: [0, 6], rookFrom: [0, 7], rookTo: [0, 5] },
//             BLACK_QUEENSIDE: { kingTo: [0, 2], rookFrom: [0, 0], rookTo: [0, 3] }
//         };
//         return CASTLING[type];
//     }
    
//     updateCastlingRights(piece, from) {
//         const newRights = {...this.castlingRights};
//         const currentPlayer = this.currentPlayer;
        
//         if (piece.toLowerCase() === 'k') {
//             newRights[currentPlayer] = { kingside: false, queenside: false };
//         } 
//         else if (piece.toLowerCase() === 'r') {
//             if (currentPlayer === 'white') {
//                 if (from.col === 0) newRights.white.queenside = false;
//                 if (from.col === 7) newRights.white.kingside = false;
//             } else {
//                 if (from.col === 0) newRights.black.queenside = false;
//                 if (from.col === 7) newRights.black.kingside = false;
//             }
//         }
        
//         return newRights;
//     }
    
//     isCheckmate(pieces, isWhiteTurn) {
//         if (!this.isKingInCheck(pieces, isWhiteTurn)) {
//             return false;
//         }

//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const piece = pieces[row][col];
//                 if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
//                     const moves = this.getMovesForPiece(row, col, piece);
//                     for (const move of moves) {
//                         const newPieces = this.copyBoard(pieces);
//                         newPieces[move.row][move.col] = piece;
//                         newPieces[row][col] = '';
                        
//                         if (!this.isKingInCheck(newPieces, isWhiteTurn)) {
//                             return false;
//                         }
//                     }
//                 }
//             }
//         }
        
//         return true;
//     }
    
//     isStalemate(pieces, isWhiteTurn) {
//         if (this.isKingInCheck(pieces, isWhiteTurn)) {
//             return false;
//         }

//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const piece = pieces[row][col];
//                 if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
//                     const moves = this.getMovesForPiece(row, col, piece);
//                     if (moves.length > 0) {
//                         return false;
//                     }
//                 }
//             }
//         }
        
//         return true;
//     }
    
//     copyBoard(board = this.pieces) {
//         return board.map(row => [...row]);
//     }
// }


// document.addEventListener('DOMContentLoaded', () => {
//     const gameId = document.getElementById('chess-game').dataset.gameId;
//     window.chessGame = new ChessGame(gameId);
// });
// document.addEventListener('DOMContentLoaded', () => {
//     new ChessGame();
// });




















// class ChessGame {
//     constructor(gameId) {
//         this.gameId = gameId;
//         this.socket = null;
//         this.playerColor = null;
//         this.initializeSocket();

//         // Initialize empty board
//         this.boardLength = 8;
//         this.pieces = Array(8).fill().map(() => Array(8).fill(''));
//         this.currentPlayer = 'white';
        
//         // Game state
//         this.selectedPiece = null;
//         this.possibleMoves = [];
//         this.lastMove = null;
//         this.gameOver = false;
//         this.pendingPromotion = null;
        
//         // UI elements
//         this.pieceImages = {
//             'p': '/static/images/black-pawn.png',
//             'r': '/static/images/black-rook.png',
//             'n': '/static/images/black-knight.png',
//             'b': '/static/images/black-bishop.png',
//             'q': '/static/images/black-queen.png',
//             'k': '/static/images/black-king.png',
//             'P': '/static/images/white-pawn.png',
//             'R': '/static/images/white-rook.png',
//             'N': '/static/images/white-knight.png',
//             'B': '/static/images/white-bishop.png',
//             'Q': '/static/images/white-queen.png',
//             'K': '/static/images/white-king.png'
//         };

//         this.initBoard();
//         this.renderBoard();
//         this.addEventListeners();
//         this.updateGameStatus('Подключаемся к игре...');
//     }

//     initializeSocket() {
//         console.log(`Connecting to WebSocket for game ${this.gameId}...`);
        
//         const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
//         this.socket = new WebSocket(`${protocol}${window.location.host}/ws/game/${this.gameId}/`);

//         this.socket.onopen = () => {
//             console.log('WebSocket connection established');
//             this.updateGameStatus('Ожидаем начала игры...');
//         };

//         this.socket.onerror = (error) => {
//             console.error('WebSocket error:', error);
//             this.updateGameStatus('Ошибка подключения', 'error');
//         };

//         this.socket.onclose = (event) => {
//             console.log('WebSocket disconnected:', event.reason);
//             this.updateGameStatus('Соединение прервано', 'error');
//         };

//         this.socket.onmessage = (event) => {
//             try {
//                 const data = JSON.parse(event.data);
//                 console.log('Received message:', data);
                
//                 switch(data.type) {
//                     case 'game_init':
//                         this.handleGameInit(data);
//                         break;
//                     case 'game_update':
//                         this.handleGameUpdate(data);
//                         break;
//                     default:
//                         console.warn('Unknown message type:', data.type);
//                 }
//             } catch (error) {
//                 console.error('Error parsing message:', error);
//             }
//         };
//     }

//     handleGameInit(data) {
//         if (!data.board || !data.player_color) {
//             console.error('Invalid game initialization data');
//             return;
//         }

//         this.playerColor = data.player_color;
//         this.pieces = data.board;
//         this.currentPlayer = data.current_player;
        
//         this.updateGameStatus(
//             this.isMyTurn() ? 'Ваш ход!' : 'Ожидаем хода соперника'
//         );
//         this.renderBoard();
//     }

//     handleGameUpdate(data) {
//         this.pieces = data.board;
//         this.currentPlayer = data.current_player;
//         this.lastMove = data.move;
        
//         this.updateGameStatus(
//             this.isMyTurn() ? 'Ваш ход!' : 'Ожидаем хода соперника'
//         );
//         this.renderBoard();
//     }

//     isMyTurn() {
//         return this.playerColor === this.currentPlayer;
//     }

//     initBoard() {
//         const chessBoard = document.getElementById('chess-board');
//         if (!chessBoard) {
//             console.error('Chess board element not found');
//             return;
//         }
        
//         chessBoard.innerHTML = '';
        
//         for (let row = 0; row < 8; row++) {
//             for (let col = 0; col < 8; col++) {
//                 const square = document.createElement('div');
//                 square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
//                 square.dataset.row = row;
//                 square.dataset.col = col;
                
//                 const pieceImg = document.createElement('img');
//                 pieceImg.className = 'piece';
//                 square.appendChild(pieceImg);
                
//                 chessBoard.appendChild(square);
//             }
//         }
//     }

//     renderBoard() {
//         const squares = document.querySelectorAll('.chess-square');
//         squares.forEach(square => {
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
//             const pieceImg = square.querySelector('.piece');
            
//             // Reset classes
//             square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            
//             // Update piece
//             if (piece) {
//                 pieceImg.src = this.pieceImages[piece];
//                 pieceImg.style.display = 'block';
//                 pieceImg.alt = piece;
//             } else {
//                 pieceImg.style.display = 'none';
//             }
            
//             // Highlight selected piece
//             if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//                 square.classList.add('selected');
//             }
            
//             // Highlight possible moves
//             if (this.possibleMoves.some(move => move.row === row && move.col === col)) {
//                 square.classList.add('possible-move');
//             }
//         });
//     }

//     addEventListeners() {
//         const chessBoard = document.getElementById('chess-board');
//         if (!chessBoard) return;

//         chessBoard.addEventListener('click', (event) => {
//             if (this.gameOver || !this.isMyTurn()) return;
            
//             const square = event.target.closest('.chess-square');
//             if (!square) return;
            
//             const row = parseInt(square.dataset.row);
//             const col = parseInt(square.dataset.col);
//             const piece = this.pieces[row][col];
            
//             this.handleSquareClick(row, col, piece);
//         });
//     }

//     handleSquareClick(row, col, piece) {
//         // If piece is selected and clicked on possible move
//         if (this.selectedPiece && this.possibleMoves.some(move => 
//             move.row === row && move.col === col)) {
//             this.movePiece(row, col);
//             return;
//         }
        
//         // If clicking on already selected piece
//         if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
//             this.deselectPiece();
//             return;
//         }
        
//         // If clicking on own piece
//         if (piece && this.isOwnPiece(piece)) {
//             this.selectPiece(row, col, piece);
//         }
//     }

//     isOwnPiece(piece) {
//         const isWhitePiece = piece === piece.toUpperCase();
//         return (isWhitePiece && this.playerColor === 'white') || 
//                (!isWhitePiece && this.playerColor === 'black');
//     }

//     selectPiece(row, col, piece) {
//         this.selectedPiece = { row, col, piece };
//         this.possibleMoves = this.getPossibleMoves(row, col, piece);
//         this.renderBoard();
//     }

//     deselectPiece() {
//         this.selectedPiece = null;
//         this.possibleMoves = [];
//         this.renderBoard();
//     }

//     movePiece(toRow, toCol) {
//         if (!this.selectedPiece) return;
        
//         const fromPos = this.toChessNotation(this.selectedPiece.row, this.selectedPiece.col);
//         const toPos = this.toChessNotation(toRow, toCol);
        
//         // Check for pawn promotion
//         const piece = this.selectedPiece.piece;
//         if (piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
//             this.showPromotionDialog(fromPos, toPos);
//             return;
//         }
        
//         this.sendMove(fromPos, toPos);
//     }

//     sendMove(from, to, promotion = null) {
//         if (this.socket.readyState === WebSocket.OPEN) {
//             this.socket.send(JSON.stringify({
//                 type: "make_move",
//                 from,
//                 to,
//                 promotion
//             }));
//         }
//     }

//     toChessNotation(row, col) {
//         const letter = String.fromCharCode(97 + col);
//         const number = 8 - row;
//         return `${letter}${number}`;
//     }

//     updateGameStatus(message, type = 'normal') {
//         const statusElement = document.getElementById('game-status');
//         if (statusElement) {
//             statusElement.textContent = message;
//             statusElement.className = `status-${type}`;
//         }
//     }

//     // ... (остальные методы для расчета ходов, шахов/матов и т.д.)
// }

// // Инициализация игры
// document.addEventListener('DOMContentLoaded', () => {
//     const chessContainer = document.getElementById('chess-game');
//     if (!chessContainer) {
//         console.error('Chess container not found');
//         return;
//     }
//     console.log(chessContainer)
//     const gameId = chessContainer.dataset.game_id;
//     if (!gameId) {
//         console.error('Game ID not specified');
//         return;
//     }

//     try {
//         window.chessGame = new ChessGame(gameId);
//     } catch (error) {
//         console.error('Failed to initialize chess game:', error);
//     }
// });