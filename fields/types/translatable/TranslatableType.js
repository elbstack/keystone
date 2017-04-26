var _ = require('lodash');
var async = require('async');
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
	if (!options.subFieldType) {
		throw new Error('you must specify a subFieldType (at path '
			+ path + ' in list ' + list.key + ')');
	} else if (options.subFieldType === fieldTypes.Translatable) {
		throw new Error('subFieldType is Translatable, this isn\'t allowed');
	}
	this.subFieldType = options.subFieldType;
	this.subFieldTypeName = this.subFieldType.properName;
	this.subFieldOptions = options.subFieldOptions || {}; // TODO subFieldOptions

	if (!options.defaultLanguage) {
		throw new Error('you must specify a defaultLanguage (at path '
			+ path + ' in list ' + list.key + ')');
	}
	this.defaultLanguage = options.defaultLanguage;

	if (!options.languages || !Array.isArray(options.languages)) {
		throw new Error('you must specify languages as an array of supported languages (at path '
			+ path + ' in list ' + list.key + ')');
	} else if (options.languages.indexOf(options.defaultLanguage) < 0) {
		throw new Error('defaultLanguage is not included in languages (at path '
			+ path + ' in list ' + list.key + ')');
	}
	this.languages = options.languages; // TODO add label to be displayed for language

	this._properties = ['subFieldTypeName', 'defaultLanguage', 'languages', 'subFieldOptions'];
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
	schema.nested[this.path] = true;

	this.languages.forEach(function (language) {
		this.getFieldType(language).addToSchema(schema);
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
	// TODO delegate to field for default language

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
	return 'translatable.prototype.format';
	// return item.get(this.paths.full); // TODO - find out what this does
};

/**
 * Get the value from a data object; may be simple or a pair of fields
 */
translatable.prototype.getInputFromData = function (data) {
	console.log('translatable.prototype.getInputFromData', { data });

	// translatable.prototype.getInputFromData { data: { title: 'TFEsev', 'text.en': 'eng', 'text.de': 'deu' } }

	// this.getValueFromData throws an error if we pass name: null
	if (data[this.path] === null) {
		return null;
	}

	var input = {};

	this.languages.forEach(language => {
		console.log('languages.forEach ', { data, language });
		var ldata = this.getValueFromData(data, '_' + language);
		if (ldata === undefined) ldata = this.getValueFromData(data, '.' + language);
		// TODO maybe use get value from data from (text) field? look what it does..
		if (ldata !== undefined) {
			input[language] = ldata;
		} else {
			console.log("undefined for lang", language);
		}
	});

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

	console.log('input: ', input);

	return input;
};

/**
 * Validates that a value for this field has been provided in a data object
 */
translatable.prototype.validateInput = function (data, callback) {
	let inputFromData = this.getInputFromData(data);
	console.log('translatable.prototype.validateInput', { data, inputFromData });

	async.every(Object.keys(inputFromData), function (language, callback) {
		console.log('every inputFromData', { inputFromData, language });
		this.getFieldType(language).validateInput(data, function (result) {
			callback(null, result);
		});
	}.bind(this), function (err, result) {
		console.log('async every callback', { err, result });
		callback(result);
	});
};

/**
 * Validates that input has been provided
 */
translatable.prototype.validateRequiredInput = function (item, data, callback) {
	console.log('translatable.prototype.validateRequiredInput', {item, data, callback});

	// TODO implement

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
	console.log('translatable.prototype.isModified', { item });
	return item.isModified(this.paths.first) || item.isModified(this.paths.last);
};

/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */
translatable.prototype.updateItem = function (item, data, callback) {
	console.log('translatable.prototype.updateItem', { item, data });

	let inputFromData = this.getInputFromData(data); // TODO catch empty cases ?

	async.every(Object.keys(inputFromData), function (language, callback) {
		console.log('every inputFromData 2', { inputFromData, language });
		this.getFieldType(language).updateItem(item, data, callback);
	}.bind(this), function (result) {
		console.log('async every callback 2', { result });
		callback(result);
	});
};

/* utilities specific to translatable field */
translatable.prototype.getFieldType = function (language) {
	var path = this.path + '.' + language;
	return new this.subFieldType(this.list, path, this.subFieldOptions);
};


/* Export Field Type */
module.exports = translatable;
