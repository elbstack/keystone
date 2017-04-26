import classnames from 'classnames';
import Field from '../Field';
import React, { PropTypes } from 'react';
import { Fields } from 'FieldTypes';
import {
	FormInput,
	Grid,
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
		const inputStyle = { width: '100%' };
		const { value = {} } = this.props;

		return (
			<Grid.Row small="one-half" gutter={10}>
				<Grid.Col>
					<FormInput noedit style={inputStyle}>
						{value.de}
					</FormInput>
				</Grid.Col>
				<Grid.Col>
					<FormInput noedit style={inputStyle}>
						{value.en}
					</FormInput>
				</Grid.Col>
			</Grid.Row>
		);
	},

	renderSubField (language) { // TODO render other inputs aswell because it gets send via form
		const { subFieldTypeName, defaultLanguage, value = {}, path } = this.props;
		const { selectedLanguage = defaultLanguage } = this.state;
		const val = value[language];

		let subFieldType = subFieldTypeName.toLowerCase();
		// const props = assign({}, field);
		// props.value = this.props.values[field.path];
		// props.values = this.props.values;
		// props.onChange = this.handleChange;
		// props.mode = 'edit';

		console.log('renderSubField', {
			path: path + '.' + language,
			value: val,
			type: subFieldType,
			values: this.props.values,
			onChange: this.valueChanged,
			mode: this.props.mode,
		});

		return (
			<div
				style={{ color: language === selectedLanguage ? 'red' : 'green' }}
				key={`subfield-lang-${language}`}
			>
				{'subFieldType: ' + subFieldType + ' lang=' + language}

				{React.createElement(Fields[subFieldType], {
					path: path + '.' + language,
					value: val,
					type: subFieldType,
					values: this.props.values,
					onChange: this.valueChanged,
					mode: this.props.mode,
				})}
			</div>
		);
	},

	renderField () {
		const { value = {}, paths, autoFocus, languages, defaultLanguage } = this.props;
		const { selectedLanguage = defaultLanguage } = this.state;

		console.log({ props: this.props });

		return (
			<Grid.Row small="one-half" gutter={10}>
				<Grid.Col>
					<Grid.Row>
						{languages.map(language => (
							<span key={`lang-${language}`}>
								<a onClick={() => this.selectLanguage(language)}>
									{language}
								</a>
								&nbsp;
							</span>
						))}
					</Grid.Row>
					<Grid.Row>
						{languages.map(language => this.renderSubField(language))}
						{/*
							<FormInput
							autoFocus={autoFocus}
							autoComplete="off"
							name="someName"
							placeholder={'Value for ' + selectedLanguage}
							value={localizedValue}
						/>
							onChange={this.changeFirst}
							name={this.getInputName(paths.en)}
						 */}
					</Grid.Row>
				</Grid.Col>
			</Grid.Row>
		);
	},

	// renderUI () {
	// 	var wrapperClassName = classnames(
	// 		'field-type-' + this.props.type,
	// 		this.props.className,
	// 		{ 'field-monospace': this.props.monospace }
	// 	);
	// 	return (
	// 		<FormField htmlFor={this.props.path} label={this.props.label} className={wrapperClassName} cropLabel>
	// 			<div className={'FormField__inner field-size-' + this.props.size}>
	// 				{this.shouldRenderField() ? this.renderField() : this.renderValue()}
	// 			</div>
	// 			{this.renderNote()}
	// 		</FormField>
	// 	);
	// },
});
