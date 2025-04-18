class ChessGame {
    constructor(gameId) {
        this.gameId = gameId;
        this.socket = null;
        this.playerColor = null;
        this.initializeSocket();
        this.castlingRights = {
            white: { kingside: true, queenside: true },
            black: { kingside: true, queenside: true }
        };
        this.boardLength = 8;
        this.pieces = Array(8).fill().map(() => Array(8).fill(''));
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.possibleMoves = [];
        this.lastMove = null;
        this.gameOver = false;
        this.pendingPromotion = null;

        this.pieceImages = {
            'p': '/static/images/black-pawn.png',
            'r': '/static/images/black-rook.png',
            'n': '/static/images/black-knight.png',
            'b': '/static/images/black-bishop.png',
            'q': '/static/images/black-queen.png',
            'k': '/static/images/black-king.png',
            'P': '/static/images/white-pawn.png',
            'R': '/static/images/white-rook.png',
            'N': '/static/images/white-knight.png',
            'B': '/static/images/white-bishop.png',
            'Q': '/static/images/white-queen.png',
            'K': '/static/images/white-king.png'
        };

        this.initBoard();
        this.renderBoard();
        this.addEventListeners();
        this.updateGameStatus('Подключаемся к игре...');
    }

    initializeSocket() {
        console.log(`Connecting to WebSocket for game ${this.gameId}...`);
        
        const protocol = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
        this.socket = new WebSocket(`${protocol}${window.location.host}/ws/game/${this.gameId}/`);

        this.socket.onopen = () => {
            console.log('WebSocket connection established');
            this.updateGameStatus('Ожидаем начала игры...');
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.updateGameStatus('Ошибка подключения', 'error');
        };

        this.socket.onclose = (event) => {
            console.log('WebSocket disconnected:', event.reason);
            this.updateGameStatus('Соединение прервано', 'error');
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('Received message:', data);
                
                switch(data.type) {
                    case 'game_init':
                        this.handleGameInit(data);
                        break;
                    case 'game_update':
                        this.handleGameUpdate(data);
                        break;
                    default:
                        console.warn('Unknown message type:', data.type);
                }
            } catch (error) {
                console.error('Error parsing message:', error);
            }
        };
    }

    handleGameInit(data) {
        if (!data.board || !data.player_color) {
            console.error('Invalid game initialization data');
            return;
        }

        this.playerColor = data.player_color;
        this.pieces = data.board;
        this.currentPlayer = data.current_player;
        console.log(`Player color: ${this.playerColor}, Current player: ${this.currentPlayer}`); // Добавьте лог
        this.updateGameStatus(
            this.isMyTurn() ? 'Ваш ход!' : 'Ожидаем хода соперника'
        );
        this.renderBoard();
    }

    handleGameUpdate(data) {
        this.pieces = data.board;
        this.currentPlayer = data.current_player;
        this.lastMove = data.move;
        this.deselectPiece();
        this.updateGameStatus(
            this.isMyTurn() ? 'Ваш ход!' : 'Ожидаем хода соперника'
        );
        this.renderBoard();
    }
    isMyTurn() {
        return this.playerColor === this.currentPlayer;
    }

    initBoard() {
        const chessBoard = document.getElementById('chess-board');
        if (!chessBoard) {
            console.error('Chess board element not found');
            return;
        }
        
        chessBoard.innerHTML = '';
        
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                
                const pieceImg = document.createElement('img');
                pieceImg.className = 'piece';
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
            
            square.className = `chess-square ${(row + col) % 2 === 0 ? 'white' : 'black'}`;
            
            if (piece) {
                pieceImg.src = this.pieceImages[piece];
                pieceImg.style.display = 'block';
                pieceImg.alt = piece;
            } else {
                pieceImg.style.display = 'none';
            }
            
            if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
                square.classList.add('selected');
            }
            
            const move = this.possibleMoves.find(m => m.row === row && m.col === col);
            if (move) {
                square.classList.add('possible-move');
                if (this.pieces[row][col] && !this.isSameColor(this.selectedPiece.piece, this.pieces[row][col])) {
                    square.classList.add('attackable-piece');
                }
            }
        });
    }

    addEventListeners() {
        const chessBoard = document.getElementById('chess-board');
        if (!chessBoard) return;

        chessBoard.addEventListener('click', (event) => {
            if (this.gameOver || !this.isMyTurn()) return;
            
            const square = event.target.closest('.chess-square');
            if (!square) return;
            
            const row = parseInt(square.dataset.row);
            const col = parseInt(square.dataset.col);
            const piece = this.pieces[row][col];
            
            this.handleSquareClick(row, col, piece);
        });
    }

    handleSquareClick(row, col, piece) {
        if (!this.isMyTurn()) return;
        
        if (this.selectedPiece && this.possibleMoves.some(m => m.row === row && m.col === col)) {
            this.movePiece(row, col);
            return;
        }
        
        if (this.selectedPiece && this.selectedPiece.row === row && this.selectedPiece.col === col) {
            this.deselectPiece();
            return;
        }
        
        if (piece && this.isOwnPiece(piece)) {
            this.selectPiece(row, col, piece);
        } else {
            this.deselectPiece();
        }
    }

    isOwnPiece(piece) {
        if (!piece) return false;
        const isWhitePiece = piece === piece.toUpperCase();
        return (isWhitePiece && this.playerColor === 'white') || 
               (!isWhitePiece && this.playerColor === 'black');
    }

    isSameColor(piece1, piece2) {
        if (!piece1 || !piece2) return false;
        const isWhite1 = piece1 === piece1.toUpperCase();
        const isWhite2 = typeof piece2 === 'string' ? piece2 === piece2.toUpperCase() : piece2 === 'white';
        return isWhite1 === isWhite2;
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

    movePiece(toRow, toCol) {
        if (!this.selectedPiece) return;
        
        const fromPos = this.toChessNotation(this.selectedPiece.row, this.selectedPiece.col);
        const toPos = this.toChessNotation(toRow, toCol);
        
        if (this.selectedPiece.piece.toLowerCase() === 'p' && (toRow === 0 || toRow === 7)) {
            this.showPromotionDialog(fromPos, toPos);
            return;
        }
        
        this.sendMove(fromPos, toPos);
        this.deselectPiece();
    }

    sendMove(from, to, promotion = null) {
        if (this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: "make_move",
                from,
                to,
                promotion
            }));
        }
    }

    toChessNotation(row, col) {
        const letter = String.fromCharCode(97 + col);
        const number = 8 - row;
        return `${letter}${number}`;
    }

    updateGameStatus(message, type = 'normal') {
        const statusElement = document.getElementById('game-status');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `status-${type}`;
        }
    }

    getPossibleMoves(row, col, piece) {
        return this.filterLegalMoves(
            row, 
            col, 
            piece, 
            this.getMovesForPiece(row, col, piece)
        );
    }
    
    getMovesForPiece(row, col, piece) {
        let moves;
        switch (piece.toLowerCase()) {
            case 'p': moves = this.getPawnMoves(row, col, piece); break;
            case 'r': moves = this.getRookMoves(row, col, piece); break;
            case 'n': moves = this.getKnightMoves(row, col, piece); break;
            case 'b': moves = this.getBishopMoves(row, col, piece); break;
            case 'q': moves = this.getQueenMoves(row, col, piece); break;
            case 'k': moves = this.getKingMoves(row, col, piece); break;
            default: moves = [];
        }
        return moves;
    }

    getPawnMoves(row, col, piece, ignoreCheck = false) {
        const moves = [];
        const direction = piece === 'P' ? -1 : 1;
        const startRow = piece === 'P' ? 6 : 1;

        if (this.pieces[row + direction]?.[col] === '') {
            moves.push({ row: row + direction, col });
            if (row === startRow && this.pieces[row + 2 * direction]?.[col] === '') {
                moves.push({ row: row + 2 * direction, col });
            }
        }

        for (let dx of [-1, 1]) {
            const targetCol = col + dx;
            const targetRow = row + direction;
            if (targetCol >= 0 && targetCol < 8 && targetRow >= 0 && targetRow < 8) {
                const targetPiece = this.pieces[targetRow][targetCol];
                if (targetPiece && !this.isSameColor(piece, targetPiece)) {
                    moves.push({ 
                        row: targetRow, 
                        col: targetCol,
                        isCapture: true
                    });
                }
                else if (this.lastMove?.piece?.toLowerCase() === 'p' && 
                        Math.abs(this.lastMove.from.row - this.lastMove.to.row) === 2 &&
                        this.lastMove.to.row === row &&
                        this.lastMove.to.col === targetCol) {
                    moves.push({ 
                        row: targetRow, 
                        col: targetCol,
                        isCapture: true,
                        isEnPassant: true
                    });
                }
            }
        }
        return ignoreCheck ? moves : this.filterLegalMoves(row, col, piece, moves);
    }

    getRookMoves(row, col, piece, ignoreCheck = false) {
        const moves = [];
        const directions = [
            { r: 1, c: 0 }, { r: -1, c: 0 }, 
            { r: 0, c: 1 }, { r: 0, c: -1 }
        ];

        for (let dir of directions) {
            let r = row, c = col;
            while (true) {
                r += dir.r;
                c += dir.c;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
                const targetPiece = this.pieces[r][c];
                if (!targetPiece) {
                    moves.push({ row: r, col: c });
                } else {
                    if (!this.isSameColor(piece, targetPiece)) {
                        moves.push({ 
                            row: r, 
                            col: c,
                            isCapture: true
                        });
                    }
                    break;
                }
            }
        }
        return ignoreCheck ? moves : this.filterLegalMoves(row, col, piece, moves);
    }

    getKnightMoves(row, col, piece, ignoreCheck = false) {
        const moves = [];
        const directions = [
            { r: 2, c: 1 }, { r: 2, c: -1 },
            { r: -2, c: 1 }, { r: -2, c: -1 },
            { r: 1, c: 2 }, { r: 1, c: -2 },
            { r: -1, c: 2 }, { r: -1, c: -2 },
        ];

        for (let dir of directions) {
            const newRow = row + dir.r;
            const newCol = col + dir.c;
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.pieces[newRow][newCol];
                if (!targetPiece) {
                    moves.push({ row: newRow, col: newCol });
                } else if (!this.isSameColor(piece, targetPiece)) {
                    moves.push({ 
                        row: newRow, 
                        col: newCol,
                        isCapture: true
                    });
                }
            }
        }
        return ignoreCheck ? moves : this.filterLegalMoves(row, col, piece, moves);
    }

    getBishopMoves(row, col, piece, ignoreCheck = false) {
        const moves = [];
        const directions = [
            { r: 1, c: 1 }, { r: 1, c: -1 }, 
            { r: -1, c: 1 }, { r: -1, c: -1 }
        ];

        for (let dir of directions) {
            let r = row, c = col;
            while (true) {
                r += dir.r;
                c += dir.c;
                if (r < 0 || r >= 8 || c < 0 || c >= 8) break;
                
                const targetPiece = this.pieces[r][c];
                if (!targetPiece) {
                    moves.push({ row: r, col: c });
                } else {
                    if (!this.isSameColor(piece, targetPiece)) {
                        moves.push({ 
                            row: r, 
                            col: c,
                            isCapture: true
                        });
                    }
                    break;
                }
            }
        }
        return ignoreCheck ? moves : this.filterLegalMoves(row, col, piece, moves);
    }

    getQueenMoves(row, col, piece, ignoreCheck = false) {
        return [
            ...this.getRookMoves(row, col, piece, true),
            ...this.getBishopMoves(row, col, piece, true)
        ].filter(move => 
            ignoreCheck ? true : this.filterLegalMoves(row, col, piece, [move]).length > 0
        );
    }

    getKingMoves(row, col, piece, ignoreCheck = false) {
        const moves = [];
        const directions = [
            { r: 1, c: 0 }, { r: -1, c: 0 },
            { r: 0, c: 1 }, { r: 0, c: -1 },
            { r: 1, c: 1 }, { r: 1, c: -1 },
            { r: -1, c: 1 }, { r: -1, c: -1 }
        ];

        const isWhite = piece === 'K';
        
        for (let dir of directions) {
            const newRow = row + dir.r;
            const newCol = col + dir.c;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = this.pieces[newRow][newCol];
                
                if (!targetPiece || !this.isSameColor(piece, targetPiece)) {
                    const originalPiece = this.pieces[newRow][newCol];
                    this.pieces[newRow][newCol] = piece;
                    this.pieces[row][col] = '';
                    
                    const kingPos = { row: newRow, col: newCol };
                    let isAttacked = false;
                    
                    isAttacked = this.isSquareAttacked(kingPos.row, kingPos.col, !isWhite);
                    
                    if (!isAttacked) {
                        moves.push({ 
                            row: newRow, 
                            col: newCol,
                            isCapture: !!targetPiece
                        });
                    }
                    
                    this.pieces[newRow][newCol] = originalPiece;
                    this.pieces[row][col] = piece;
                }
            }
        }

        // Рокировка
        if (!ignoreCheck && !this.isKingInCheck(this.pieces, isWhite)) {
            const color = isWhite ? 'white' : 'black';
            const backRank = isWhite ? 7 : 0;
            
            if (row === backRank && col === 4) {
                if (this.castlingRights[color]?.kingside && 
                    this.pieces[backRank][5] === '' && 
                    this.pieces[backRank][6] === '' && 
                    this.pieces[backRank][7]?.toLowerCase() === 'r') {
                    
                    const squaresToCheck = [[backRank, 4], [backRank, 5], [backRank, 6]];
                    const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                    
                    if (isSafe) {
                        moves.push({ 
                            row: backRank, 
                            col: 6, 
                            isCastling: true,
                            type: isWhite ? 'WHITE_KINGSIDE' : 'BLACK_KINGSIDE'
                        });
                    }
                }
                
                if (this.castlingRights[color]?.queenside && 
                    this.pieces[backRank][3] === '' && 
                    this.pieces[backRank][2] === '' && 
                    this.pieces[backRank][1] === '' && 
                    this.pieces[backRank][0]?.toLowerCase() === 'r') {
                    
                    const squaresToCheck = [[backRank, 4], [backRank, 3], [backRank, 2]];
                    const isSafe = squaresToCheck.every(([r, c]) => !this.isSquareAttacked(r, c, !isWhite));
                    
                    if (isSafe) {
                        moves.push({ 
                            row: backRank, 
                            col: 2, 
                            isCastling: true,
                            type: isWhite ? 'WHITE_QUEENSIDE' : 'BLACK_QUEENSIDE'
                        });
                    }
                }
            }
        }

        return moves;
    }

    filterLegalMoves(row, col, piece, moves) {
        const isWhite = piece === piece.toUpperCase();
        const isInCheck = this.isKingInCheck(this.pieces, isWhite);
        
        if (!isInCheck) {
            return moves.filter(move => {
                const newPieces = this.copyBoard();
                newPieces[move.row][move.col] = piece;
                newPieces[row][col] = '';
                return !this.isKingInCheck(newPieces, isWhite);
            });
        }
        
        return moves.filter(move => {
            if (this.doesMoveBlockCheck(row, col, move, piece, isWhite)) {
                return true;
            }
            
            if (piece.toLowerCase() === 'k') {
                const newPieces = this.copyBoard();
                newPieces[move.row][move.col] = piece;
                newPieces[row][col] = '';
                return !this.isKingInCheck(newPieces, isWhite);
            }
            
            return false;
        });
    }

    doesMoveBlockCheck(fromRow, fromCol, move, piece, isWhite) {
        if (piece.toLowerCase() === 'k') return false;
        
        const kingPos = this.findKing(isWhite);
        if (!kingPos) return false;
        
        const newPieces = this.copyBoard();
        newPieces[move.row][move.col] = piece;
        newPieces[fromRow][fromCol] = '';
        
        return !this.isKingInCheck(newPieces, isWhite);
    }

    findKing(isWhite) {
        const kingSymbol = isWhite ? 'K' : 'k';
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if (this.pieces[r][c] === kingSymbol) {
                    return {row: r, col: c};
                }
            }   
        }
        return null;
    }

    isSquareAttacked(row, col, byWhite) {
        const pawnDir = byWhite ? -1 : 1;
        for (let dc of [-1, 1]) {
            const r = row + pawnDir;
            const c = col + dc;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.pieces[r][c];
                if (piece && piece.toLowerCase() === 'p' && (piece === piece.toUpperCase()) === byWhite) {
                    return true;
                }
            }
        }

        const knightMoves = [
            { r: 2, c: 1 }, { r: 2, c: -1 },
            { r: -2, c: 1 }, { r: -2, c: -1 },
            { r: 1, c: 2 }, { r: 1, c: -2 },
            { r: -1, c: 2 }, { r: -1, c: -2 }
        ];
        for (let move of knightMoves) {
            const r = row + move.r;
            const c = col + move.c;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.pieces[r][c];
                if (piece && piece.toLowerCase() === 'n' && (piece === piece.toUpperCase()) === byWhite) {
                    return true;
                }
            }
        }

        const straightDirections = [
            { r: 1, c: 0 }, { r: -1, c: 0 },
            { r: 0, c: 1 }, { r: 0, c: -1 }
        ];
        for (let dir of straightDirections) {
            let r = row + dir.r;
            let c = col + dir.c;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.pieces[r][c];
                if (piece) {
                    if ((piece.toLowerCase() === 'r' || piece.toLowerCase() === 'q') && 
                        (piece === piece.toUpperCase()) === byWhite) {
                        return true;
                    }
                    break;
                }
                r += dir.r;
                c += dir.c;
            }
        }

        const diagonalDirections = [
            { r: 1, c: 1 }, { r: 1, c: -1 },
            { r: -1, c: 1 }, { r: -1, c: -1 }
        ];
        for (let dir of diagonalDirections) {
            let r = row + dir.r;
            let c = col + dir.c;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.pieces[r][c];
                if (piece) {
                    if ((piece.toLowerCase() === 'b' || piece.toLowerCase() === 'q') && 
                        (piece === piece.toUpperCase()) === byWhite) {
                        return true;
                    }
                    break;
                }
                r += dir.r;
                c += dir.c;
            }
        }

        const kingDirections = [
            { r: 1, c: 0 }, { r: -1, c: 0 },
            { r: 0, c: 1 }, { r: 0, c: -1 },
            { r: 1, c: 1 }, { r: 1, c: -1 },
            { r: -1, c: 1 }, { r: -1, c: -1 }
        ];
        for (let dir of kingDirections) {
            const r = row + dir.r;
            const c = col + dir.c;
            if (r >= 0 && r < 8 && c >= 0 && c < 8) {
                const piece = this.pieces[r][c];
                if (piece && piece.toLowerCase() === 'k' && (piece === piece.toUpperCase()) === byWhite) {
                    return true;
                }
            }
        }

        return false;
    }

    isKingInCheck(pieces, isWhite) {
        const kingSymbol = isWhite ? 'K' : 'k';
        let kingPos = null;

        for (let r = 0; r < 8 && !kingPos; r++) {
            for (let c = 0; c < 8; c++) {
                if (pieces[r][c] === kingSymbol) {
                    kingPos = { row: r, col: c };
                    break;
                }
            }
        }

        if (!kingPos) return true;

        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const piece = pieces[r][c];
                if (!piece || (piece === piece.toUpperCase()) === isWhite) continue;

                const moves = this.getRawMovesForPiece(r, c, piece);
                if (moves.some(m => m.row === kingPos.row && m.col === kingPos.col)) {
                    return true;
                }
            }
        }

        return false;
    }

    getRawMovesForPiece(row, col, piece) {
        switch (piece.toLowerCase()) {
            case 'p': return this.getPawnMoves(row, col, piece, true);
            case 'r': return this.getRookMoves(row, col, piece, true);
            case 'n': return this.getKnightMoves(row, col, piece, true);
            case 'b': return this.getBishopMoves(row, col, piece, true);
            case 'q': return this.getQueenMoves(row, col, piece, true);
            case 'k': return this.getKingMoves(row, col, piece, true);
            default: return [];
        }
    }

    executeMove(from, to, promotionChoice = null) {
        const isWhite = this.currentPlayer === 'white';
        const newPieces = this.copyBoard();
        let piece = newPieces[from.row][from.col];
        let capturedPiece = newPieces[to.row][to.col];
        let newCastlingRights = this.updateCastlingRights(piece, from);
        let isPromotion = false;

        const result = {
            newPieces,
            newCastlingRights,
            capturedPiece,
            isCheck: false,
            isCheckmate: false,
            isStalemate: false,
            isPromotion: false,
            promotionPosition: null
        };

        if (piece.toLowerCase() === 'k' && Math.abs(from.col - to.col) === 2) {
            const castlingType = isWhite 
                ? (to.col === 6 ? 'WHITE_KINGSIDE' : 'WHITE_QUEENSIDE')
                : (to.col === 6 ? 'BLACK_KINGSIDE' : 'BLACK_QUEENSIDE');
            
            result.newPieces = this.performCastling(newPieces, castlingType);
            result.capturedPiece = null;
        } 
        else {
            result.newPieces[to.row][to.col] = piece;
            result.newPieces[from.row][from.col] = '';

            if (piece.toLowerCase() === 'p' && Math.abs(from.col - to.col) === 1 && !capturedPiece) {
                const direction = piece === 'P' ? -1 : 1;
                result.capturedPiece = result.newPieces[to.row - direction][to.col];
                result.newPieces[to.row - direction][to.col] = '';
            }

            if (piece.toLowerCase() === 'p' && (to.row === 0 || to.row === 7)) {
                result.isPromotion = true;
                result.promotionPosition = to;
                
                if (promotionChoice) {
                    result.newPieces[to.row][to.col] = promotionChoice;
                    result.isPromotion = false;
                } else {
                    result.newPieces[to.row][to.col] = piece;
                    result.newPieces[from.row][from.col] = '';
                    return result;
                }
            }
        }

        const opponentColor = isWhite ? 'black' : 'white';
        result.isCheck = this.isKingInCheck(result.newPieces, !isWhite);

        if (!result.isPromotion) {
            if (result.isCheck) {
                result.isCheckmate = this.isCheckmate(result.newPieces, !isWhite);
            } else {
                result.isStalemate = this.isStalemate(result.newPieces, !isWhite);
            }
        }

        return result;
    }
    
    performCastling(pieces, castlingType) {
        const newPieces = this.copyBoard(pieces);
        const { kingTo, rookFrom, rookTo } = this.getCastlingInfo(castlingType);
        
        newPieces[kingTo[0]][kingTo[1]] = newPieces[kingTo[0]][4];
        newPieces[kingTo[0]][4] = '';
        
        newPieces[rookTo[0]][rookTo[1]] = newPieces[rookFrom[0]][rookFrom[1]];
        newPieces[rookFrom[0]][rookFrom[1]] = '';
        
        return newPieces;
    }
    
    getCastlingInfo(type) {
        const CASTLING = {
            WHITE_KINGSIDE: { kingTo: [7, 6], rookFrom: [7, 7], rookTo: [7, 5] },
            WHITE_QUEENSIDE: { kingTo: [7, 2], rookFrom: [7, 0], rookTo: [7, 3] },
            BLACK_KINGSIDE: { kingTo: [0, 6], rookFrom: [0, 7], rookTo: [0, 5] },
            BLACK_QUEENSIDE: { kingTo: [0, 2], rookFrom: [0, 0], rookTo: [0, 3] }
        };
        return CASTLING[type];
    }
    
    updateCastlingRights(piece, from) {
        const newRights = {...this.castlingRights};
        const currentPlayer = this.currentPlayer;
        
        if (piece.toLowerCase() === 'k') {
            newRights[currentPlayer] = { kingside: false, queenside: false };
        } 
        else if (piece.toLowerCase() === 'r') {
            if (currentPlayer === 'white') {
                if (from.col === 0) newRights.white.queenside = false;
                if (from.col === 7) newRights.white.kingside = false;
            } else {
                if (from.col === 0) newRights.black.queenside = false;
                if (from.col === 7) newRights.black.kingside = false;
            }
        }
        
        return newRights;
    }
    
    isCheckmate(pieces, isWhiteTurn) {
        if (!this.isKingInCheck(pieces, isWhiteTurn)) {
            return false;
        }

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = pieces[row][col];
                if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
                    const moves = this.getMovesForPiece(row, col, piece);
                    for (const move of moves) {
                        const newPieces = this.copyBoard(pieces);
                        newPieces[move.row][move.col] = piece;
                        newPieces[row][col] = '';
                        
                        if (!this.isKingInCheck(newPieces, isWhiteTurn)) {
                            return false;
                        }
                    }
                }
            }
        }
        
        return true;
    }
    
    isStalemate(pieces, isWhiteTurn) {
        if (this.isKingInCheck(pieces, isWhiteTurn)) {
            return false;
        }

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const piece = pieces[row][col];
                if (piece !== '' && (piece === piece.toUpperCase()) === isWhiteTurn) {
                    const moves = this.getMovesForPiece(row, col, piece);
                    if (moves.length > 0) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }
    
    copyBoard(board = this.pieces) {
        return board.map(row => [...row]);
    }

}

document.addEventListener('DOMContentLoaded', () => {
    const chessContainer = document.getElementById('chess-game');
    if (!chessContainer) {
        console.error('Chess container not found');
        return;
    }
    const gameId = chessContainer.dataset.game_id;
    if (!gameId) {
        console.error('Game ID not specified');
        return;
    }

    try {
        window.chessGame = new ChessGame(gameId);
    } catch (error) {
        console.error('Failed to initialize chess game:', error);
    }
});