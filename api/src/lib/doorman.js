const http = require('http')

module.exports = {
	open : () => {
		return new Promise((resolve, reject) => {
			http.get("http://192.168.1.2/socket1On", (res) => {
				resolve(true)
			})
		})
	}
}