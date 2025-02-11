"use strict";

const lodash = require('lodash')
var GrowingPacker = require('./packer.growing.js');

module.exports = function (items, options) {
    options = options || {};
    let packer = new GrowingPacker();
    let inPlace = options.inPlace || false;
    let isRotatable = options.isRotatable || false;

    // Clone the items.
    let newItems = items.map(function (item) {
        return inPlace ? item : {width: item.width, height: item.height, rotated: false, item: item};
    });

    let fit = function (newItems) {
        newItems = newItems.sort(function (a, b) {
            // TODO: check that each actually HAS a width and a height.
            // Sort based on the size (area) of each block.
            return (b.width * b.height) - (a.width * a.height);
        });

        packer.fit(newItems);

        let w = newItems.reduce(function (curr, item) {
            return Math.max(curr, item.x + item.width);
        }, 0);
        let h = newItems.reduce(function (curr, item) {
            return Math.max(curr, item.y + item.height);
        }, 0);

        let ret = {
            width: w,
            height: h
        };

        if (!inPlace) {
            ret.items = newItems;
        }
        return ret
    }

    let rotatableFit = function (newItems, length) {
        if (length === 0) {
            return fit(newItems, options)
        } else if (length < 0) {
            return fit([], options)
        }

        let index = length - 1
        let r1 = rotatableFit(newItems, index)
        if (newItems[index].width !== newItems[index].height) {
            let rotatedItems = lodash.cloneDeep(newItems)
            let tmp = rotatedItems[index].height
            rotatedItems[index].height = rotatedItems[index].width
            rotatedItems[index].width = tmp
            rotatedItems[index].rotated = true
            let r2 = rotatableFit(rotatedItems, index)

            if (r1.width * r1.height > r2.width * r2.height) {
                return r2
            } else {
                return r1
            }
        } else {
            return r1
        }
    }

    if (!isRotatable) {
        return fit(newItems);
    } else {
        return rotatableFit(newItems, newItems.length);
    }
};
