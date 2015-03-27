var PipeStep = require('./pipeStep');

function Pipe(stateName, changeStateCallback){

    if (typeof stateName !== 'string') {
        throw new Error('');
    }

    if (typeof changeStateCallback === 'function') {
        this._stateCallback = changeStateCallback;
    }

    this.name = stateName;

    this.data = null;
    this.dataStates = [];

    this.steps = [];

    this.ready = false;


    // todo implement log
    this.dataLog = [];
}

Pipe.prototype.exception = {
    WRONG_STEP : 'given base step doesn\'t exist in pipe structure',
    NOT_READY : 'the pipe isn\'t ready',
    EMPTY : 'this pipe has no steps to run'
};

Pipe.prototype.state = function (fn, context) {

    var options = {
        fn : fn,
        context : context,
        stateCallback : this._stateCallback,
        type : PipeStep.prototype.pipeStepTypes.STATE
    };

    this._createStep(options);

    return this;
};

Pipe.prototype.process = function (fn, context) {

    var options = {
        fn : fn,
        context : context,
        stateCallback : this._stateCallback,
        type : PipeStep.prototype.pipeStepTypes.PROCESS
    };

    this._createStep(options);

    return this;
};

// alias
Pipe.prototype.do = Pipe.prototype.process;

Pipe.prototype.error = function (fn, context) {
    var options = {
        fn : fn,
        context : context,
        stateCallback : this._stateCallback,
        type : PipeStep.prototype.pipeStepTypes.ERROR_HANDLER
    };

    this._createStep(options);

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
        this._unlockAllSteps();
        // todo refactor this
        this._getFirstStep().run();
    } else {
        throw new Error(this.exception.NOT_READY);
    }
};

Pipe.prototype._log = function(options) {
    return this.steps.map(function (item) {
        return {
            type : item.type,
            data : item.data,
            status : item.status
        }
    });
};

Pipe.prototype._unlockAllSteps = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};

Pipe.prototype._lockAllSteps = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};

Pipe.prototype._createStep = function(options) {
    var step = new PipeStep(options);
    this.steps.push(step);
};

Pipe.prototype._stateCallback = function () {
    // stub
};

Pipe.prototype._getFirstStep = function() {
    if ( !this.steps.length ) {
        throw new Error(this.exception.EMPTY);
    }
    return this.steps[0];
};

module.exports = Pipe;