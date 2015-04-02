function Flowhandler (){
    this._locked = false;

    this.attachFunction('switchTo', this._stateCallbackStub);
    this.attachFunction('next', this._nextCallbackStub);
    this.attachFunction('error', this._errorCallbackStub);

    //if ( typeof stateCallback === 'function' ) {
    //    this.attachFunction('switchTo', stateCallback);
    //}
}

Flowhandler.prototype._callbackNames = {
    next : '_nextCallback',
    error : '_errorCallback',
    switchTo : '_stateCallback'
};

Flowhandler.prototype.next = function (data) {
    console.log('next');
    if (this._locked) return false;
    this.lock();
    this._nextCallback(data);
};

Flowhandler.prototype.error = function (data) {
    console.log('error');
    if (this._locked) return false;
    this.lock();
    this._errorCallback(data);
};

Flowhandler.prototype.switchTo = function (data) {
   // todo implement to change

    if (this._locked) return false;
    this.lock();
    this._stateCallback(data);
};

Flowhandler.prototype._nextCallbackStub = function () {
    // stub
};

Flowhandler.prototype._errorCallbackStub = function () {
    // stub
    console.log('_errorCallbackStub');
};

Flowhandler.prototype._stateCallbackStub = function () {
    // stub
};

Flowhandler.prototype.attachFunction = function (name, fn) {
    if (this._locked) return false;

    if (typeof name === 'string' && typeof fn === 'function') {
        if (this._callbackNames[name]) {
            this[this._callbackNames[name]] = fn ;
        }
    }
};

Flowhandler.prototype.lock = function () {
    console.log('lock');
    this._locked = true;
};

Flowhandler.prototype.unlock = function () {
    console.log('unlock');
    this._locked = false;
};