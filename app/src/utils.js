export const debounce = () => {
	let timeout = {}
	return (fn, delay) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			fn()
		}, delay)
	}
}