/**
 * Helpers made available via require('tupaijs') once package is
 * installed.
 */

var path = require('path')

var _version;
module.exports = {
    path: path.join(__dirname, 'bin' ,'tupaijs'),
    get version() {
        if(!_version) {
            _version = require(path.join(__dirname, 'package.json')).version;
        }
        return _version;
    }
};
