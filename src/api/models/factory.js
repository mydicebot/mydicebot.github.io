'use strict';

import {BaseDice} from './base'

export const Factory = {
    instances: new Map(),
    register(clazzname, clazz) {
        if (!(Factory.instances.has(clazzname) &&
            clazz instanceof BaseDice)) {
            Factory.instances.set(clazzname, clazz);
        }
    },
    create(clazzname) {
        if (!Factory.instances.has(clazzname)) {
            console.error("class error!");
            return null;
        }
        let instance = this.instances.get(clazzname);
        return instance;
    }
}
