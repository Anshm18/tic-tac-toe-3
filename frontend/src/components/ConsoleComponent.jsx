import '../css/Container.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const socket = io('http://localhost:3000'); // create only ONCE

export default function Console() {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Register yourself with username
    socket.emit("registerUsername", {
      username: localStorage.getItem("username")
    });

    // Receive active players
    socket.on("active_users", (allPlayers) => {
      const list = Object.entries(allPlayers)
        .filter(([id]) => id !== socket.id)   // remove yourself
        .map(([id, name]) => ({ id, name })); // convert to array

        
        setPlayers(list);
      });
      socket.on("join_room_invite", ({ room }) => {
       navigate(`/game?room=${room}`);
     });

    return () => {
      socket.off("active_users");
    };
  }, []);

  const joinPlayer = (opponentId) => {
    const room = `room_${socket.id}_${opponentId}`;

    socket.emit("invite_player", {
      room,
      opponentId,
    });

    navigate(`/game?room=${room}`); // You go immediately
  };

  return (
    <>
      <div className="d-flex flex-column justify-content-center align-items-center vh-100">
        <div className="p-4 shadow rounded">

          <h3 className='mb-4 text-center textColor'>Active Players</h3>

          <div className="modal-dialog modal-dialog-scrollable consoleJoin">
            <div className="modal-content text-center">
              <div className="modal-body">

                {players.length === 0 && (
                  <p className="text-muted">No active players</p>
                )}

                {players.map((player) => (
                  <tr key={player.id} className='d-flex justify-content-around m-1 rounded customModal'>
                    <td className='fs-4'>{player.name}</td>
                    <td><button className='btn btn-primary' onClick={()=>joinPlayer(player.id)}>Join</button></td>
                  </tr>
                ))}

              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
