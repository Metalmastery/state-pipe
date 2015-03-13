function Flowhandler (doneCallback, errorCallback){
    this.state = null;

    this._attachFunction('_doneCallback', doneCallback);
    this._attachFunction('_errorCallback', errorCallback);

}

Flowhandler.prototype.next = function (data) {
    this._doneCallback(data);
};

Flowhandler.prototype.error = function (data) {
    this._errorCallback(data);
};

Flowhandler.prototype._doneCallback = function () {
    // stub
};

Flowhandler.prototype._errorCallback = function () {
    // stub
};

Flowhandler.prototype._attachFunction = function (name, fn) {
    if (typeof fn === 'function') {
        this[name] = fn ;
    }
};