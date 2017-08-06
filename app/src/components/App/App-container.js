import { connect } from 'react-redux'

import { debounce } from '../../utils'
import AppView from './App-view.jsx'
import store from '../../store'
import './App-style.scss'

const mapStateToProps = state => ({
	
})

const debounceSearch = debounce()

const mapDispatchToProps = (dispatch) => {
	const dispatches = {}
	return dispatches
}

export default connect(mapStateToProps, mapDispatchToProps)(AppView)
