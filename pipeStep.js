function PipeStep (fn, context, stateCallback, type){
    if (this.checkType(type)) {
        this.type = type;
    }

    this.context = this.checkContext(context);
    this.fn = null;
    this.handler = new Flowhandler(stateCallback);

    if (typeof fn === 'function') {
        this.fn = fn;
    }

    this.data = null;

    this.id = this.generateId();
}

PipeStep.prototype.pipeStepTypes = {
    PROCESS : 1,
    ERROR_HANDLER : 2,
    BEFORE : 3,
    AFTER : 4,
    STATE : 5
};

PipeStep.prototype.idBase = 0;

PipeStep.prototype.generateId = function () {
    return 'id' + this.constructor.prototype.idBase++;
};

PipeStep.prototype.checkContext = function (obj) {
    var context;
    if (typeof obj != 'object') {
        context = window;
    } else {
        context = obj;
    }
    return context;
};

PipeStep.prototype.checkType = function (type) {
    var typeFound = null,
        value;

    for (var i in this.pipeStepTypes) {
        if (this.pipeStepTypes.hasOwnProperty(i)) {
            value = this.pipeStepTypes[i];
            if (value === type) {
                typeFound = true;
            }
        }
    }

    if (!typeFound) {
        throw new Error('wrong PipeStep type was given');
    }

    return typeFound;
};

PipeStep.prototype.createHandler = function (nextCallback, errorCallback) {
    var stateCallback = function(){
        console.log(arguments);
    };

    this.handler = new Flowhandler(stateCallback)
};

PipeStep.prototype._linkTo = function (pipeStep, type) {

};

PipeStep.prototype.linkToProcess = function (pipeStep) {
    var self = this;
    if ( !pipeStep || this.type !== this.pipeStepTypes.PROCESS || pipeStep.type !== this.pipeStepTypes.PROCESS ) {
        return false;
    }

    this.handler.attachFunction('next', function(data){
        self.data = data;
        pipeStep.fn.apply(pipeStep.context, [data, pipeStep.handler]);
    });
};

PipeStep.prototype.linkToErrorHandler = function (pipeStep) {
    var self = this;
    if ( !pipeStep || this.type !== this.pipeStepTypes.PROCESS || pipeStep.type !== this.pipeStepTypes.ERROR_HANDLER ) {
        return false;
    }

    this.handler.attachFunction('error', function(data){
        self.error = data;
        pipeStep.fn.apply(pipeStep.context, [data, pipeStep.handler]);
    });
};

