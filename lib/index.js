'use strict';

var Jouvence = require('./jouvence/jouvence');

// module.exports = function(test) {
//     if (test === true) {
//         return {
//             jouvence: new Jouvence(true)
//         };
//     } else {
//         return {
//             jouvence: new Jouvence(false)
//         };
//     }
// }

module.exports = new Jouvence();
//module.exports.Jouvence = Jouvence;
