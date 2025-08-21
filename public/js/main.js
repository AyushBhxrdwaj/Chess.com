const socket = io();
const chess = new Chess();
const chessboard = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

const renderBoard = () => {
  const board = chess.board();
  chessboard.innerHTML = "";
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
        pieceElem.draggable = false; // No drag functionality for now
        squareElem.appendChild(pieceElem);
      }
      chessboard.appendChild(squareElem);
    });
  });
};

const handleMove = (source, target) => {
  // TODO: Add move logic later
};

const getPieceUnicode = (piece) => {
  const pieceUnicodeMap = {
    p: { w: "♙", b: "♟" }, // pawn: white outline, black solid
    r: { w: "♖", b: "♜" }, // rook: white outline, black solid
    n: { w: "♘", b: "♞" }, // knight: white outline, black solid
    b: { w: "♗", b: "♝" }, // bishop: white outline, black solid
    q: { w: "♕", b: "♛" }, // queen: white outline, black solid
    k: { w: "♔", b: "♚" }, // king: white outline, black solid
  };
  return pieceUnicodeMap[piece.type]?.[piece.color] || "";
};
renderBoard();
