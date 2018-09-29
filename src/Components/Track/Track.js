import React from 'react';
import './Track.css';

class Track extends React.Component{
  constructor(props){
    super(props);
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
  }
  addTrack(){
    const track = this.props.track;
    this.props.onAdd(track);
  }
  removeTrack(){
    const track = this.props.track;
    this.props.onRemove(track);
  }
  renderAction(){
    if(this.props.isRemoval){
      return '-';
    }else{
      return '+';
    }
  }
  render(){
    return(
      <div className="Track">
        <div className="Track-information">
          <h3>{this.props.track.name}</h3>
          <p>{this.props.track.artist} | {this.props.track.album}</p>
        </div>
        <a className="Track-action" onClick={this.props.isRemoval ? this.removeTrack : this.addTrack}>{this.renderAction()}</a>
      </div>
    );
  }
};

export default Track;
