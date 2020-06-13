'use strict';

var BaseDice = require('./base');

module.exports = {
    instances: new Map(),
    register(clazzname, clazz) {
        if (!(this.instances.has(clazzname) &&
            clazz instanceof BaseDice)) {
            this.instances.set(clazzname, clazz);
        }
    },
    create(clazzname) {
        if (!this.instances.has(clazzname)) {
            console.error("class error!");
            return null;
        }
        let instance = this.instances.get(clazzname);
        return instance;
    },
    check() {
        if (this.instances.size >0 ) {
            return true;
        } else {
            return false;
        }
    },
    clear() {
        this.instances.clear();
    },
}
