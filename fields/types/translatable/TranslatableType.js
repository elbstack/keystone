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

	this.languageLabels = options.languageLabels || {};

	// init sub field
	this.subFields = {};
	this.languages.forEach(function (language) {
		var subPath = path + '.' + language;
		this.subFields[language] = new this.subFieldType(list, subPath, this.subFieldOptions);
	}, this);

	this._properties = [
		'subFieldTypeName',
		'defaultLanguage',
		'languages',
		'languageLabels',
		'subFieldOptions',
	];
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
		this.getSubField(language).addToSchema(schema);
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
 * Validates that a value for this field has been provided in a data object
 */
translatable.prototype.validateInput = function (data, callback) {
	console.log('translatable.prototype.validateInput', { data });

	async.every(this.languages, function (language, callback) {
		this.getSubField(language).validateInput(data, function (result) {
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
	console.log('translatable.prototype.validateRequiredInput', { item, data });

	async.every(this.languages, function (language, callback) {
		this.getSubField(language).validateRequiredInput(item, data, function (result) {
			callback(null, result);
		});
	}.bind(this), function (err, result) {
		console.log('async every callback', { err, result });
		callback(result);
	});
};

/**
 * Validates that a value for this field has been provided in a data object
 *
 * Deprecated
 */
translatable.prototype.inputIsValid = function (data, required, item) {
	console.log('translatable.prototype.inputIsValid', { data, required, item });

	// TODO check if this works
	return this.languages.every(function (language) {
		return this.getSubField(language).inputIsValid(data, required, item);
	}.bind(this));
};

/**
 * Detects whether the field has been modified
 *
 * @api public
 */
translatable.prototype.isModified = function (item) {
	// TODO check if this works
	console.log('translatable.prototype.isModified', { item });

	return this.languages.every(function (language) {
		return this.getSubField(language).isModified(item);
	}.bind(this));
};

/**
 * Updates the value for this field in the item from a data object
 *
 * @api public
 */
translatable.prototype.updateItem = function (item, data, callback) {
	console.log('translatable.prototype.updateItem', { item, data });

	async.every(this.languages, function (language, callback) {
		this.getSubField(language).updateItem(item, data, callback);
	}.bind(this), function (result) {
		callback(result);
	});
};

/**
 * Get client-side properties to pass to react field.
 */
translatable.prototype.getProperties = function () {
	const subFieldProps = {};

	this.languages.forEach(function (language) {
		subFieldProps[language] = this.getSubField(language).getOptions();
	}, this);

	return {
		subFieldProps,
	};
};

/* utilities specific to translatable field */
translatable.prototype.getSubField = function (language) {
	return this.subFields[language];
};


/* Export Field Type */
module.exports = translatable;
