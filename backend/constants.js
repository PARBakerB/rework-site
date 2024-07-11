// used for variables that need to be referencing the same class instance across files 

import { ioManager } from './ioManager.js';

export default {
	fsManager: new ioManager()
};