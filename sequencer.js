function Sequencer(){
    this.pipes = {};
    this.activePipe = null;
}

Sequencer.prototype.exception = {
    WRONG_NAME : 'wrong state\'s name given',
    NAME_EXISTS : 'such state name already exists',
    NAME_DOES_NOT_EXIST : 'such state name doesn\'t exists'
};

Sequencer.prototype.pipe = function (name) {
    if ( typeof name !== 'string' || !name.length ) {
        throw new Error(this.exception.WRONG_NAME);
    }

    if ( this.pipes.hasOwnProperty(name) ) {
        throw new Error(this.exception.NAME_EXISTS);
    }

    this.pipes[name] = new Pipe(name, this.state.bind(this));

    return this.pipes[name];
};

Sequencer.prototype.state = function (name) {

    console.log('sequencer state change', name);

    if (!this.pipes.hasOwnProperty(name) ) {
        throw new Error(this.exception.NAME_DOES_NOT_EXIST);
    }

    this._lockAll();

    this.activePipe = this.pipes[name];

    this.activePipe.run();
};

Sequencer.prototype._lockAll = function () {
    for (var pipeName in this.pipes) {
        this.pipes[pipeName]._lockAllSteps()
    }
};