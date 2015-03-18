function Pipe(name){
    this.name = name;

    this.data = null;
    this.dataStates = [];

    this.steps = [];

    this.ready = false;

    this.currentHandler = [];
}

Pipe.prototype.state = function (fn, context) {
    var step = new PipeStep(fn, context, PipeStep.prototype.pipeStepTypes.STATE);

    this.steps.push(step);

    return this;
};

Pipe.prototype.process = function (fn, context) {
    var step = new PipeStep(fn, context, PipeStep.prototype.pipeStepTypes.PROCESS);

    this.steps.push(step);

    return this;
};

Pipe.prototype.error = function (fn, context) {
    var step = new PipeStep(fn, context, PipeStep.prototype.pipeStepTypes.ERROR_HANDLER);

    this.steps.push(step);

    return this;
};

Pipe.prototype.finishOld = function () {

    var step,
        nextStep,
        callbacks;

    this.steps.push({handler : null, fn : function(){

    }});

    function wrap(step, nextStep){
        return {
            success : function(data){
                nextStep.fn(data, nextStep.handler)
            },
            error : function(){

                console.log(arguments);
            }
        }
    }


    for (var i = 0; i < this.steps.length - 1; i++) {
        step = this.steps[i];
        nextStep = this.steps[i + 1];
        callbacks = wrap(step, nextStep);
        step.handler = new Flowhandler(callbacks.success, callbacks.error);
    }

    this.ready = true;

    return this;
};

Pipe.prototype.finish = function (fn, context) {
    // todo implement finish state step
    //this.state(function(){ });

    var step,
        closestErrorHandler,
        closestProcess,
        i;

    for (i = 0; i < this.steps.length; i++) {
        step = this.steps[i];

        closestProcess = this.closestProcess(step);
        closestErrorHandler = this.closestErrorHandler(step);

        console.log(step, closestProcess, closestErrorHandler);

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
        throw new Error('given base step doesn\'t exist in pipe structure');
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
        this.unlockAll();
        // todo refactor this
        this.steps[0].fn(null, this.steps[0].handler);
    } else {
        throw new Error('the pipe isn\'t ready');
    }
};

Pipe.prototype.unlockAll = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};

Pipe.prototype.lockAll = function () {
    for (var i = 0; i < this.steps.length; i++) {
        // todo refactor this
        this.steps[i].handler.unlock();
    }
};






var t = new Pipe('test');

function cb1(data, chain) {
    console.log(arguments);
    var newData = 'test1';
    chain.next(newData);
}

function cb2(data, chain) {
    console.log(arguments);
    var newData = data + 'test2';
    setTimeout(function(){
        chain.next(newData);

    }, 500);
    //chain.next(newData);
}


function cb3(data, chain) {
    console.log(arguments);
    var newData = data + 'test2';
    //chain.next(newData);
    chain.error(newData);
}

function handler(e){
    console.log('error', e);
}

//t.process(cb1).process(cb2).process(cb2).finish();
t.process(cb1).process(cb2).process(cb2).error(handler).process(cb3).finish();