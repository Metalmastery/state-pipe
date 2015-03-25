function Pipe(stateName, stateCallback){

    if (typeof stateName !== 'string') {
        throw new Error('');
    }

    if (typeof stateCallback === 'function') {
        this._stateCallback = stateCallback;
    }

    this.name = stateName;

    this.data = null;
    this.dataStates = [];

    this.steps = [];

    this.ready = false;


    // todo implement log
    this.dataLog = [];
}

Pipe.prototype._stateCallback = function () {

};

Pipe.prototype.exception = {
    WRONG_STEP : 'given base step doesn\'t exist in pipe structure',
    NOT_READY : 'the pipe isn\'t ready'
};

Pipe.prototype.state = function (fn, context) {
    var step = new PipeStep(fn, context, this._stateCallback, PipeStep.prototype.pipeStepTypes.STATE);

    this.steps.push(step);

    return this;
};

Pipe.prototype.process = function (fn, context) {
    var step = new PipeStep(fn, context, this._stateCallback, PipeStep.prototype.pipeStepTypes.PROCESS);

    this.steps.push(step);

    return this;
};

Pipe.prototype.error = function (fn, context) {
    var step = new PipeStep(fn, context, this._stateCallback, PipeStep.prototype.pipeStepTypes.ERROR_HANDLER);

    this.steps.push(step);

    return this;
};

Pipe.prototype.finish = function (state) {
    // todo implement finish step, which may change the sequencer's current state
    //this.state(function(){ });

    var step,
        closestErrorHandler,
        closestProcess,
        i;

    for (i = 0; i < this.steps.length; i++) {

        step = this.steps[i];

        closestProcess = this.closestProcess(step);
        closestErrorHandler = this.closestErrorHandler(step);

        //console.log(step, closestProcess, closestErrorHandler);

        step.linkToProcess(closestProcess);
        step.linkToErrorHandler(closestErrorHandler);
    }

    this.ready = true;

    return this;
};

Pipe.prototype.closestStep = function (base, type) {
    var index = this.steps.indexOf(base),
        currentStep,
        neededStep,
        i;

    if ( index < 0 ) {
        throw new Error(this.exception.WRONG_STEP);
    }

    if ( this.steps.length - index < 2 ) {
        //throw new Error('no more steps in pipe structure')
        console.log('no more steps in pipe structure');
    }

    i = index + 1;

    while ( !neededStep && (i < this.steps.length) ) {

        currentStep = this.steps[i];
        if (currentStep.type === type) {
            neededStep = currentStep;
        }
        i++;

    }

    return neededStep;
};

Pipe.prototype.closestProcess = function (base) {
    return this.closestStep(base, PipeStep.prototype.pipeStepTypes.PROCESS);
};

Pipe.prototype.closestErrorHandler = function (base) {
    return this.closestStep(base, PipeStep.prototype.pipeStepTypes.ERROR_HANDLER);
};

Pipe.prototype.run = function () {
    if (this.ready) {
        this.unlockAllSteps();
        // todo refactor this
        this.steps[0].fn(null, this.steps[0].handler);
    } else {
        throw new Error(this.exception.NOT_READY);
    }
};

Pipe.prototype.unlockAllSteps = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};

Pipe.prototype.lockAllSteps = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};