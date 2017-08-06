import * as webSocketActions from 'actions/web-socket-actions';
 
let socket = null;
 
export default function (store) {
  socket = new WebSocket(`ws://${location.host}/api`);
 
  console.log(socket);
  console.log(socket.readyState);
  socket.onopen = function(event) {
      socket.send('Hello Server!');
  };
  socket.onmessage = function(msg){
    console.log(msg);
    msg = JSON.parse(msg.data);
    console.log(store.dispatch);
    store.dispatch(webSocketActions.socketReceive(msg));
  };
}