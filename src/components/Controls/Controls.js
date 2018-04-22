import React from 'react';
import './Controls.css'
import Aux from '../../hoc/Auxx/Auxx';

const controls = (props) => {

    let options = props.options.map((item, index) => {
        return <option
            value={item}
            key={index}>{item}</option>
    });


    return (
        <Aux>
            <div className={props.small}>
                <select className="select" onChange={props.handleSelect} defaultValue="">
                    <option value="" disabled>Select bus number</option>
                    {options}
                </select>
                <form name="form" target="_self" method="post">
                </form>
                <button type="button" value="showbuses" onClick={props.showBuses}>Show buses</button>
                <button type="button" value="refresh" onClick={props.refresh}>Refresh</button>
                <button type="button" value="showroute" onClick={props.showRoute}>Show route</button>
            </div>
        </Aux>
    )
};

export default controls;