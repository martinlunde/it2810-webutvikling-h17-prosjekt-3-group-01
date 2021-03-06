/**
 * Created by martinlunde on 27.09.2017.
 */
import React from 'react';
import PropTypes from 'prop-types';

//The NoteContent class renders the content on the right side of the note list.
export class NoteContent extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            title: this.props.data.title,
            content: this.props.data.content
        };

        this.handleChange = this.handleChange.bind(this);
    }

    //Function for handling typing in textarea, and updates the state.
    handleChange(event){
        this.setState({content: event.target.value});
        this.props.onChange(this.state.title, event.target.value);
    }

    //Function which tells the component that new props may arrive, and component has to rerender.
    componentWillReceiveProps(nextProps){
        this.setState({
            title: nextProps.data.title,
            content: nextProps.data.content
        });
    }

    render(){
        //Handles empty boxes, so that previous states not are stuck.
        let textValue;
        if(!this.state.content){
            textValue = '';
        } else {
            textValue = this.state.content;
        }

        return(
            <div className="NoteContentContainer">
                <h1>{ this.state.title }</h1>
                <textarea value={ textValue } onChange={this.handleChange} />
            </div>
        );
    }
}

NoteContent.PropTypes = {
    data: PropTypes.object,
    onChange: PropTypes.func,
    update: PropTypes.bool,
    id: PropTypes.number,
};