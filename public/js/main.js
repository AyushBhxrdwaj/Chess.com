const socket = io();
const chess = new Chess();
const chessboard = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null; // { row, col }
let playerRole = null;

const showGameStatus = (message, type = "info") => {
  const existingStatus = document.querySelector(".game-status");
  if (existingStatus) {
    existingStatus.remove();
  }

  const statusDiv = document.createElement("div");
  statusDiv.className = `game-status ${type}`;
  statusDiv.innerHTML = `
    <div class="status-content">
      <h2>${message}</h2>
    </div>
  `;
  document.body.appendChild(statusDiv);

  if (type !== "checkmate" && type !== "stalemate") {
    setTimeout(() => {
      if (statusDiv.parentNode) {
        statusDiv.remove();
      }
    }, 5000);
  }
};

const checkGameStatus = () => {
  if (chess.isCheckmate()) {
    const winner = chess.turn() === "w" ? "Black" : "White";
    showGameStatus(`Checkmate! ${winner} wins!`, "checkmate");
    return true;
  } else if (chess.isStalemate()) {
    showGameStatus("Stalemate! The game is a draw.", "stalemate");
    return true;
  } else if (chess.isDraw()) {
    showGameStatus("Draw! The game is a draw.", "stalemate");
    return true;
  } else if (chess.isCheck()) {
    const player = chess.turn() === "w" ? "White" : "Black";
    showGameStatus(`Check! ${player} is in check.`, "check");
    return false;
  }
  return false;
};

const renderBoard = () => {
  const board = chess.board();
  chessboard.innerHTML = "";
  if (playerRole === "b") {
    chessboard.classList.add("flipped");
  } else {
    chessboard.classList.remove("flipped");
  }
  board.forEach((row, rowidx) => {
    row.forEach((col, colidx) => {
      const squareElem = document.createElement("div");
      squareElem.classList.add(
        "square",
        (rowidx + colidx) % 2 === 0 ? "light" : "dark"
      );
      squareElem.dataset.row = rowidx;
      squareElem.dataset.col = colidx;
      if (col) {
        const pieceElem = document.createElement("div");
        pieceElem.classList.add("piece", col.color === "w" ? "white" : "black");
        pieceElem.innerText = getPieceUnicode(col);
        const canDrag = playerRole ? playerRole === col.color : true; // allow until role known
        pieceElem.draggable = canDrag;
        if (canDrag) {
          pieceElem.addEventListener("dragstart", (e) => {
            draggedPiece = pieceElem;
            sourceSquare = { row: rowidx, col: colidx };
            e.dataTransfer.setData("text/plain", "");
          });
          pieceElem.addEventListener("dragend", () => {
            draggedPiece = null;
            sourceSquare = null;
          });
        }
        squareElem.appendChild(pieceElem);
      }
      squareElem.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      squareElem.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece && sourceSquare) {
          const targetSquare = {
            row: parseInt(squareElem.dataset.row, 10),
            col: parseInt(squareElem.dataset.col, 10),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });
      chessboard.appendChild(squareElem);
    });
  });
};

const handleMove = (source, target) => {
  const from = `${String.fromCharCode(97 + source.col)}${8 - source.row}`;
  const to = `${String.fromCharCode(97 + target.col)}${8 - target.row}`;
  const move = { from, to, promotion: "q" };
  const result = chess.move(move);
  if (result) {
    socket.emit("move", move);
    renderBoard();
    checkGameStatus(); // Check for checkmate, stalemate, etc.
  } else {
    renderBoard();
  }
};

const getPieceUnicode = (piece) => {
  const pieceUnicodeMap = {
    p: { w: "♙", b: "♟" },
    r: { w: "♖", b: "♜" },
    n: { w: "♘", b: "♞" },
    b: { w: "♗", b: "♝" },
    q: { w: "♕", b: "♛" },
    k: { w: "♔", b: "♚" },
  };
  return pieceUnicodeMap[piece.type]?.[piece.color] || "";
};

socket.on("playerAssigned", (role) => {
  playerRole = role.toLowerCase();
  renderBoard();
});
socket.on("Spectator", () => {
  playerRole = null;
  renderBoard();
});
socket.on("boardstate", (fen) => {
  chess.load(fen);
  renderBoard();
});
socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("checkmate", (loser) => {
  const winner = loser === "w" ? "Black" : "White";
  showGameStatus(`Checkmate! ${winner} wins!`, "checkmate");
});

renderBoard();
