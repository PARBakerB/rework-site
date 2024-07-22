import * as fs from 'node:fs';

class ioManager {
    constructor () {
        this._queueMap = new Map();
    }
    // public methods
    append (filename, writeData = '') {
        let fileIoData = { name: filename, data: writeData };
        let fileAction = ({name, data}) => () => new Promise(resolve => resolve(fs.promises.appendFile(name, data)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    write (filename, writeData = '') {
        let fileIoData = { name: filename, data: writeData };
        let fileAction = ({name, data}) => () => new Promise(resolve => resolve(fs.promises.writeFile(name, data)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    read (filename) {
        let fileIoData = { name: filename };
        let fileAction = ({name}) => () => new Promise(resolve => resolve(fs.promises.readFile(name)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    readStream (filename) {
        let fileIoData = { name: filename };
        let fileAction = ({name}) => () => new Promise(resolve => resolve(fs.createReadStream(name)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    readSync (filename) {
        let fileIoData = { name: filename };
        let fileAction = ({name}) => () => new Promise(resolve => resolve(fs.readFileSync(name)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    readdir (filename) {
        let fileIoData = { name: filename };
        let fileAction = ({name}) => () => new Promise(resolve => resolve(fs.promises.readdir(name)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    access (filename) {
        let fileIoData = { name: filename };
        let fileAction = ({name}) => () => new Promise(resolve => resolve(fs.promises.access(name)));
        return this.#enqueueFileIo(fileIoData, fileAction);
    }
    // private functions
    #enqueueFileIo (fileIoData, fileAction) {
        if (this._queueMap.get(fileIoData.name)) {
            return this._queueMap.get(fileIoData.name).enqueue(fileAction(fileIoData));
        } else {
            let ioQueue = new AutoQueue();
            this._queueMap.set(fileIoData.name, ioQueue);
            return ioQueue.enqueue(fileAction(fileIoData));
        }
    }
}

class Queue {
    constructor () { this._items = []; }
    enqueue (item) { this._items.push(item); }
    dequeue () { return this._items.shift(); }
    size () { return this._items.length; }
}

class AutoQueue extends Queue {
    constructor() {
        super();
        this._pendingPromise = false;
    }
    enqueue(action) {
        return new Promise((resolve, reject) => {
            super.enqueue({ action, resolve, reject });
            this.dequeue();
        });
    }
  
    async dequeue() {
        if (this._pendingPromise) return false;
        let item = super.dequeue();
        if (!item) return false;
        try {
            this._pendingPromise = true;
            let payload = await item.action(this);
            this._pendingPromise = false;
            item.resolve(payload);
        } catch (e) {
            this._pendingPromise = false;
            item.reject(e);
        } finally {
            this.dequeue();
        }
        return true;
    }
}

export { ioManager }