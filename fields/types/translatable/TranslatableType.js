var _ = require('lodash');
var FieldType = require('../Type');
var fieldTypes = require('../../../lib/fieldTypes');
var util = require('util');
var utils = require('keystone-utils');

/**
 * Translatable FieldType Constructor
 * @extends Field
 * @api public
 */
function translatable (list, path, options) {
	this._fixedSize = 'full';
	this.subFieldType = 'Number'; // options.subFieldType || 'text';
	this.subFieldOptions = {}; // TODO subFieldOptions
	// TODO check if subFieldType is translatable. and warn of that nonsense
	this.defaultLocale = 'en'; // TODO default locale
	this.locales = ['en', 'de']; // TODO check if default is included
	// options.default = { de: '', en: '' }; // TODO ...
	this._properties = ['subFieldType', 'defaultLocale', 'subFieldOptions'];
	translatable.super_.call(this, list, path, options);
}
translatable.properName = 'Translatable';
util.inherits(translatable, FieldType);

/**
 * Registers the field on the List's Mongoose Schema.
 *
 * Adds no String properties for .first and .last name, and not a virtual
 * with get() and set() methods for .full
 *
 * @api public
 */
translatable.prototype.addToSchema = function (schema) {
	// var paths = this.paths = {
	// 	md: this.path + '.md',
	// 	html: this.path + '.html',
	// };

	schema.nested[this.path] = true;

	// schema.add({
	// 	de: { type: String }, // TODO types from subFieldType's addToSchema
	// 	en: { type: String },
	// }, this.path + '.');

	this.locales.forEach(function (locale) {
		this.getFieldType(locale).addToSchema(schema);
	}, this);

	this.bindUnderscoreMethods();
};

/**
 * Gets the string to use for sorting by this field
 */
translatable.prototype.getSortString = function (options) {
	if (options.invert) {
		return '-' + this.paths.en; // TODO get sort String from subtype -> we need an instance of the subtype
	}
	return this.paths.en;
};

/**
 * Add filters to a query
 */
translatable.prototype.addFilterToQuery = function (filter) {
	var query = {};
	// if (filter.mode === 'exactly' && !filter.value) {
	// 	query[this.paths.first] = query[this.paths.last] = filter.inverted ? { $nin: ['', null] } : { $in: ['', null] };
	// 	return query;
	// }
	// var value = utils.escapeRegExp(filter.value);
	// if (filter.mode === 'beginsWith') {
	// 	value = '^' + value;
	// } else if (filter.mode === 'endsWith') {
	// 	value = value + '$';
	// } else if (filter.mode === 'exactly') {
	// 	value = '^' + value + '$';
	// }
	// value = new RegExp(value, filter.caseSensitive ? '' : 'i');
	// if (filter.inverted) {
	// 	query[this.paths.first] = query[this.paths.last] = { $not: value };
	// } else {
	// 	var first = {}; first[this.paths.first] = value;
	// 	var last = {}; last[this.paths.last] = value;
	// 	query.$or = [first, last];
	// }

	// TODO implement filtering

	return query;
};

/**
 * Formats the field value
 */
translatable.prototype.format = function (item) {
	return item.get(this.paths.full); // TODO - find out what this does
};

/**
 * Get the value from a data object; may be simple or a pair of fields
 */
translatable.prototype.getInputFromData = function (data) {
	// this.getValueFromData throws an error if we pass name: null
	// if (data[this.path] === null) {
	// 	return null;
	// }
	// var first = this.getValueFromData(data, '_first');
	// if (first === undefined) first = this.getValueFromData(data, '.first');
	// var last = this.getValueFromData(data, '_last');
	// if (last === undefined) last = this.getValueFromData(data, '.last');
	// if (first !== undefined || last !== undefined) {
	// 	return {
	// 		first: first,
	// 		last: last,
	// 	};
	// }
	// return this.getValueFromData(data) || this.getValueFromData(data, '.full');

	return {
		de: 'Deutschland',
		en: 'England',
	};
};

/**
 * Validates that a value for this field has been provided in a data object
 */
translatable.prototype.validateInput = function (data, callback) {
	let inputFromData = this.getInputFromData(data);
	// gives {de: 'yxy', en: 'xyx'}
	console.log('translatable.prototype.validateInput', { data, inputFromData });

	var value = this.getInputFromData(data);
	var result = value === undefined
		|| value === null
		|| typeof value === 'string'
		|| (typeof value === 'object' && (
			typeof value.first === 'string'
			|| value.first === null
			|| typeof value.last === 'string'
			|| value.last === null)
		);
	utils.defer(callback, true/*result*/);
};

/**
 * Validates that input has been provided
 */
translatable.prototype.validateRequiredInput = function (item, data, callback) {
	console.log('translatable.prototype.validateRequiredInput', {item, data, callback});

	var value = this.getInputFromData(data);
	var result;
	if (value === null) {
		result = false;
	} else {
		result = (
			typeof value === 'string' && value.length
			|| typeof value === 'object' && (
				typeof value.first === 'string' && value.first.length
				|| typeof value.last === 'string' && value.last.length)
			|| (item.get(this.paths.full)
				|| item.get(this.paths.first)
				|| item.get(this.paths.last)) && (
					value === undefined
					|| (value.first === undefined
						&& value.last === undefined))
			) ? true : false;
	}
	utils.defer(callback, true/*result*/);
};

/**
 * Validates that a value for this field has been provided in a data object
 *
 * Deprecated
 */
translatable.prototype.inputIsValid = function (data, required, item) {
	console.log('translatable.prototype.inputIsValid', {data, required, item});
	return true;

	// Input is valid if none was provided, but the item has data
	if (!(this.path in data || this.paths.first in data || this.paths.last in data || this.paths.full in data) && item && item.get(this.paths.full)) return true;
	// Input is valid if the field is not required
	if (!required) return true;
	// Otherwise check for valid strings in the provided data,
	// which may be nested or use flattened paths.
	if (_.isObject(data[this.path])) {
		return (data[this.path].full || data[this.path].first || data[this.path].last) ? true : false;
	} else {
		return (data[this.paths.full] || data[this.paths.first] || data[this.paths.last]) ? true : false;
	}
};

/**
 * Detects whether the field has been modified
 *
 * @api public
 */
translatable.prototype.isModified = function (item) {
	return item.isModified(this.paths.first) || item.isModified(this.paths.last);
};

/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */
translatable.prototype.updateItem = function (item, data, callback) {
	var paths = this.paths;
	var value = this.getInputFromData(data);
	if (typeof value === 'string' || value === null) {
		item.set(paths.full, value);
	} else if (typeof value === 'object') {
		if (typeof value.first === 'string' || value.first === null) {
			item.set(paths.first, value.first);
		}
		if (typeof value.last === 'string' || value.last === null) {
			item.set(paths.last, value.last);
		}
	}
	process.nextTick(callback);
};

/* utilities specific to translatable field */
translatable.prototype.getFieldType = function (locale) {
	var path = this.path + '.' + locale;
	return new fieldTypes[this.subFieldType](this.list, path, this.subFieldOptions);
};


/* Export Field Type */
module.exports = translatable;
