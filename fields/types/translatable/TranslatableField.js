import classnames from 'classnames';
import Field from '../Field';
import React, { PropTypes } from 'react';
import { Fields } from 'FieldTypes';
import {
	FormInput,
	Grid,
	SegmentedControl,
} from '../../../admin/client/App/elemental';

/* how to render any field?
if (el.type === 'field') {
	var field = this.props.list.fields[el.field];
	var props = this.getFieldProps(field);
	if (typeof Fields[field.type] !== 'function') {
		return React.createElement(InvalidFieldType, { type: field.type, path: field.path, key: field.path });
	}
	props.key = field.path;
	if (index === 0 && this.state.focusFirstField) {
		props.autoFocus = true;
	}
	return React.createElement(Fields[field.type], props);
}

getFieldProps (field) {
	const props = assign({}, field);

	props.value = this.state.values[field.path];
	props.values = this.state.values;
	props.onChange = this.handleChange;
	props.mode = 'edit';
	return props;
}

*/

module.exports = Field.create({
	displayTranslatable: 'TranslatableField',
	statics: {
		type: 'Translatable',
		getDefaultValue: () => ({
			de: 'Deutsch',
			en: 'English',
		}),
	},
	propTypes: {
		onChange: PropTypes.func.isRequired,
		path: PropTypes.string.isRequired,
		paths: PropTypes.object.isRequired,
		value: PropTypes.object.isRequired,
	},

	selectLanguage: function (languageKey) {
		this.setState({ selectedLanguage: languageKey });
	},

	getLanguageLabel: function (language) {
		const { languageLabels = {} } = this.props;
		return languageLabels[language] || language;
	},

	valueChanged: function ({ path, value }) {
		console.log('valueChanged', { path, value });

		const {
			value: rootValue = {},
			path: rootPath,
			defaultLanguage,
			onChange,
		} = this.props;

		const pathParts = path.split('.');
		const language = pathParts.length > 0 ? pathParts[pathParts.length - 1] : defaultLanguage;

		onChange({
			path: rootPath,
			value: {
				...rootValue,
				[language]: value,
			},
		});
	},
	renderValue () {
		return this.renderField(); // render the same as if with editing enabled
	},

	renderSubField (language) {
		const { subFieldTypeName, subFieldProps, defaultLanguage, value = {}, path } = this.props;
		const { selectedLanguage = defaultLanguage } = this.state;
		// const val = value[language];

		let subFieldType = subFieldTypeName.toLowerCase();

		/**
		 * {
					path: path + '.' + language,
					type: subFieldType,
					value: val,
					values: this.props.values,
					onChange: this.valueChanged,
					mode: this.props.mode,
					noedit: this.props.noedit,
				}
		 */

		const hiddenStyle = { // form inputs which have display:none don\'t get submitted in old browsers
			visibility: 'hidden',
			position: 'absolute',
		};

		const props = Object.assign(
			{},
			subFieldProps[language],
			{
				value: value[language],
				values: this.props.values,
				onChange: this.props.onChange, // this.valueChanged,
				mode: this.props.mode,
				noedit: this.props.noedit,
			});
		delete props.label;

		// if (subFieldType !== 'text') {
		// 	return 'psscht';
		// }

		return (
			<div
				style={language !== selectedLanguage ? hiddenStyle : {}}
				key={`subfield-lang-${language}`}
			>
				{React.createElement(Fields[subFieldType], props)}
			</div>
		);
	},

	renderField () {
		const {
			value = {},
			paths,
			autoFocus,
			languages,
			defaultLanguage,
		} = this.props;
		const { selectedLanguage = defaultLanguage } = this.state;

		console.log({ props: this.props });

		return (
			<div>
				<SegmentedControl
					equalWidthSegments
					onChange={(val) => this.selectLanguage(val)}
					color="default"
					inline
					options={languages.map(language => ({
						value: language,
						label: this.getLanguageLabel(language),
					}))}
					value={selectedLanguage}
				/>
				{languages.map(language => this.renderSubField(language))}
			</div>
		);
	},
});
