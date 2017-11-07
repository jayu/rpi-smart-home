import React from "react";
require("./CheckBox-style.scss")

export default React.createClass({

    componentWillMount() {
        const id = this.id = window.performance ? `checkbox${Date.now()}${window.performance.now()}` : `checkbox${Date.now()}${Math.random()}`;

    },
    render() {
        return(
            <div className="checkbox-container" title={this.props.title || ""}>
                <input type="checkbox" id={this.id} className="checkbox-btn" checked={this.props.checked} onChange={this.props.onChange}/>
                <label htmlFor={this.id} className="checkbox">
                    <span className="state"></span>
                    <span className="switch"></span>
                </label>
                {this.props.children ? <p className="label">{this.props.children}</p> : null}
            </div>
        )
    }
})
