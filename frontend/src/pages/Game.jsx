import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "../css/Game.css";
import { useLocation } from "react-router-dom";

const socket = io("http://localhost:3000"); // single socket instance

export default function Game() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [room, setRoom] = useState("");
  const [board, setBoard] = useState(Array(9).fill(""));
  const [turn, setTurn] = useState("O");
  const [winner, setWinner] = useState("");
  const [symbol, setSymbol] = useState("");

  const winningSet = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];

  useEffect(() => {
    const r = searchParams.get("room");
    if (r) setRoom(r);
    console.log(room);
  }, [searchParams]);

  useEffect(() => {
    if (!room) return;

    const username = localStorage.getItem("username") || "Player";

    // Join the room
    socket.emit("join", { name: username, room });

    // Handle game start
    socket.on("game_start", ({ message, board: serverBoard, turn: serverTurn, players }) => {
      console.log(message); // "Game started!"
      setBoard(serverBoard);
      setTurn(serverTurn);

      // Assign symbol for this player
      const me = players.find(p => p.id === socket.id);
      if (me) setSymbol(me.symbol);
    });

    // Listen for board updates after moves
    socket.on("board_update", (state) => {
      setBoard(state.board);
      setTurn(state.turn);

      // Assign symbol if not yet set
      if(!symbol){
        const me = state.players.find(p => p.id === socket.id);
        if(me) setSymbol(me.symbol);
      }

      checkWinner(state.board);
    });

    return () => {
      socket.off("game_start");
      socket.off("board_update");
    };
  }, [room, symbol]);

  const handleClick = (index) => {
    if (board[index] !== "" || winner || symbol !== turn) return;
    socket.emit("event", { index, room });
  };

  const checkWinner = (currentBoard) => {
    let x = [], o = [];
    currentBoard.forEach((v,i) => { if(v==="X") x.push(i); if(v==="O") o.push(i); });

    for(let set of winningSet){
      if(set.every(i => x.includes(i))) { setWinner("X"); return; }
      if(set.every(i => o.includes(i))) { setWinner("O"); return; }
    }
    if(currentBoard.every(cell => cell !== "")) setWinner("Draw");
  };

  const restartGame = () => {
    socket.emit("restart", room);
    setWinner("");
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h3 className="text-center mt-4 fw-bold">
        Player Turn: {winner ? "-" : turn} {symbol && `(You are ${symbol})`}
      </h3>

      <div className="p-4 shadow rounded customContainer text-center">
        <h2 className="mb-3">Tic Tac Toe</h2>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 80px)", gap:"10px", justifyContent:"center" }}>
          {board.map((v,i) => (
            <button
              key={i}
              onClick={() => handleClick(i)}
              style={{
                width:"80px",
                height:"80px",
                backgroundColor:"#526D82",
                color:"#DDE6ED",
                fontSize:"30px",
                display:"flex",
                justifyContent:"center",
                alignItems:"center",
                borderRadius:"10px",
                cursor: winner || v || symbol !== turn ? "not-allowed" : "pointer",
                border:"2px solid #9DB2BF"
              }}
            >
              {v}
            </button>
          ))}
        </div>

        {winner && (
          <button className="btn btn-info mt-4" onClick={restartGame}>
            🔄 Restart Game
          </button>
        )}
      </div>
    </div>
  );
}
