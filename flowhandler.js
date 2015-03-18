function Flowhandler (){
    this.state = null;
    this._locked = null;
}

Flowhandler.prototype._callbackNames = {
    next : '_nextCallback',
    error : '_errorCallback',
    state : '_stateCallback'
};

Flowhandler.prototype.next = function (data) {
    if (this._locked) return false;
    this._nextCallback(data);
    this.lock();
};

Flowhandler.prototype.error = function (data) {
    if (this._locked) return false;
    this._errorCallback(data);
    this.lock();
};

Flowhandler.prototype.state = function (data) {
   // todo implement state change
};

Flowhandler.prototype._nextCallback = function () {
    // stub
};

Flowhandler.prototype._errorCallback = function () {
    // stub
};

Flowhandler.prototype._stateCallback = function () {
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
    this._locked = true;
};

Flowhandler.prototype.unlock = function () {
    this._locked = false;
};