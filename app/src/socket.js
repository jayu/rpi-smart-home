import * as socketActions from 'actions/socket-actions';
 
let socket = null;
 
export const socketMiddleware = (store) => {
  return next => action => {
    // if (socket && action.type === actions.ADD_MESSAGE) {
    //   socket.emit('message', action.message);
    // }
 
    return next(action);
  };
}
 
export default function (store) {
  socket = new WebSocket(`ws://${location.host}/`);
 
  // socket.on('start', data => {
  //   store.dispatch(actions.setUserId(data.userId));
  // });
 
  socket.onmessage = function(msg){
    msg = JSON.parse(msg.data);
    store.dispatch(socketActions.socketReceive(msg));
  };
}