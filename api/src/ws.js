function WS(ws) {
    const _ws = ws;
    let _name = ''
    const module = {};
    module.get = () => _ws;
    module.sendJSON = (object) => {
        if (module.isOpen())
            _ws.send(JSON.stringify(object))
    }
    module.setName = name => {
        _name = name;
    }
    module.getName = () => _name
    module.isOpen = () => _ws.readyState === 1;
    module.isClosed = () => _ws.readyState === 3;
    return module;
}
const websocketClients = [];

function filterInactiveClients() {
    const inactive = [];
    websocketClients.forEach((client,i)=> {
        if (client.isClosed()) {
            inactive.push(i);
        }
    })
    inactive.forEach((i) => {
        websocketClients.splice(i,1);
    })
    websocketClients.forEach((client,i) => {
        client.sendJSON({type : "USER_ID", id : i})
    })
}
function sendToAll(msg) {
    websocketClients.forEach((client,i) => {
        client.sendJSON(msg)
    })
}
module.exports = {
    WS,
    filterInactiveClients,
    websocketClients,
    sendToAll
}