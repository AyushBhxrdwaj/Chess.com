# Realtime Chess (Multiplayer)

A lightweight realtime multiplayer chess application built with:
- **Node.js / Express** for the web server
- **Socket.IO** for realtime, bidirectional communication
- **chess.js** for authoritative chess rules, move validation, FEN handling, and game state
- **EJS** for server-side rendered views
- **Static frontend** (served from `public/`)

> This project assigns the first two connected sockets as White and Black. Additional connections become spectators who receive live board updates.

---

## ✨ Features

- Realtime move synchronization across all connected clients
- Automatic player role assignment (White / Black / Spectator)
- Server-side move validation using `chess.js`
- FEN string broadcasting for consistent board state
- Checkmate detection and event emission
- Basic invalid move feedback
- Simple architecture: a single server file (`app.js`)

---

## 🏗️ Project Structure

```
.
├── app.js                 # Main server (Express + Socket.IO + chess.js logic)
├── package.json
├── package-lock.json
├── public/                # Static assets (JS/CSS/images; add your client scripts & board UI here)
└── views/                 # EJS templates (e.g., index.ejs)
```

> Note: `node_modules/` is omitted from version control best practices (ensure it's in `.gitignore`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm (comes with Node)

### Installation

```bash
git clone https://github.com/AyushBhxrdwaj/Chess.com.git
cd Chess.com
npm install
```

### Running the Server

If `package.json` has a start script (e.g. `"start": "node app.js"`):

```bash
npm start
```

Otherwise:

```bash
node app.js
```

Server starts (by default) on:  
`http://localhost:3000`

---

## 🕹️ How It Works (Server Logic Overview)

Inside `app.js`:

1. Creates an Express server and attaches Socket.IO.
2. Serves static files from `public/` and sets EJS as the view engine.
3. On each socket connection:
   - Assigns first socket as White (`"W"`), second as Black (`"B"`), others as Spectators.
4. Listens for `move` events:
   - Verifies turn ownership based on socket ID.
   - Validates the move via `chess.js`.
   - Broadcasts:
     - `move` (original move object)
     - `boardstate` (current FEN)
     - `checkmate` (if game ends)
   - Emits `invalidMove` back to the mover if validation fails.
5. Cleans up player slots on disconnect.

---

## 💬 Socket Event Contract

| Event (Client -> Server) | Payload Example                       | Description                               |
|--------------------------|----------------------------------------|-------------------------------------------|
| `move`                   | `{ from: "e2", to: "e4", promotion:"q" }` | Attempt to make a move                    |

| Event (Server -> Client) | Payload                          | Description                              |
|--------------------------|-----------------------------------|------------------------------------------|
| `playerAssigned`         | `"W"` or `"B"`                    | Role assignment                          |
| `Spectator`              | *(no payload)*                   | Not playing, just observing              |
| `move`                   | Move object                      | Broadcast of a successful move           |
| `boardstate`             | FEN string                       | Synchronize full board state             |
| `invalidMove`            | Original move object             | Notifies a rejected move                 |
| `checkmate`              | Next turn color (side in check)  | Indicates game end                       |

---

## 🧪 Extending the Client

You will likely need (in `public/`):

- A board renderer (e.g., Chessboard.js, custom canvas, or HTML grid)
- Socket.IO client (`/socket.io/socket.io.js`)
- Code to:
  - Listen for `boardstate` and render position
  - Send `move` when a user drops a piece
  - Disable interaction if you’re a spectator or not the active color

Example (pseudo-client snippet):

```html
<script src="/socket.io/socket.io.js"></script>
<script>
  const socket = io();
  let myColor = null;

  socket.on('playerAssigned', (color) => { myColor = color; });
  socket.on('Spectator', () => { myColor = 'S'; });

  socket.on('boardstate', (fen) => renderBoardFromFEN(fen));
  socket.on('move', (move) => applyMove(move));
  socket.on('invalidMove', (move) => alert('Invalid move: ' + JSON.stringify(move)));
  socket.on('checkmate', (losingTurn) => alert('Checkmate!'));
  
  function sendMove(from, to, promotion='q') {
    socket.emit('move', { from, to, promotion });
  }
</script>
```

---

## 🔒 Future Improvements (Roadmap)

- [ ] Persist games or support multiple rooms
- [ ] Add resign / draw offer functionality
- [ ] Time controls (clocks)
- [ ] PGN export
- [ ] Spectator chat
- [ ] Undo / takeback with mutual consent
- [ ] Authentication & user profiles
- [ ] Replace simple FEN broadcast with full game history sync

---

## 🛡️ Resilience & Edge Cases

| Aspect             | Current Behavior | Potential Enhancement |
|--------------------|------------------|-----------------------|
| Multiple games     | Single global    | Namespace/room per game |
| Disconnections     | Frees color slot | Preserve state & allow reconnection |
| Race conditions    | Minimal risk     | Queue moves if scaling horizontally |
| Validation         | chess.js only    | Add server-side logging & auditing |
| Security           | No auth          | Token-based session binding |

---

## ⚙️ Configuration

Currently hard-coded to port `3000`. You can make it configurable:

```js
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Listening on ${PORT}`));
```

---

## 🧩 Dependencies (Core)

(See `package.json` for exact versions.)
- express
- socket.io
- chess.js
- ejs (view engine)

Dev dependencies (optional if you add tooling): nodemon, ESLint, etc.

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/my-idea`
3. Commit changes: `git commit -m "Add new feature"`
4. Push: `git push origin feature/my-idea`
5. Open a Pull Request

Suggested guidelines:
- Keep functions small and cohesive
- Add comments for non-trivial logic
- Avoid mutating global state without reason

---

## 🐞 Debugging Tips

- Enable verbose logging around move handling if issues arise
- Use `chess.history()` in `app.js` to inspect sequence during development
- If moves appear out-of-sync, ensure the client only renders from server events (not speculative local state)

---

## 📄 License

Add a license of your choice (MIT is common).  
Create a `LICENSE` file, then update this section.

---

## 🙌 Acknowledgements

- [chess.js](https://github.com/jhlywa/chess.js) for robust move logic
- [Socket.IO](https://socket.io/) for realtime websockets abstraction
- Chess community inspirations & open source examples

---

## 📬 Contact

Created by **@AyushBhxrdwaj**  
Feel free to open issues or suggestions!

---

Happy hacking and may your forks be with you ♟️
