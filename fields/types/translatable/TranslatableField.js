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

	valueChanged: function (which, event) {
		const { value = {}, path, onChange } = this.props;
		onChange({
			path,
			value: {
				...value,
				[which]: event.target.value,
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

	renderSubField () {
		const { subFieldType: type } = this.props;
		const { selectedLanguage = 'de' } = this.state;
		let subFieldType = type.toLowerCase();
		// const props = assign({}, field);
		// props.value = this.props.values[field.path];
		// props.values = this.props.values;
		// props.onChange = this.handleChange;
		// props.mode = 'edit';

		return (
			<div style={{color: 'red'}}>
				{'subFieldType: ' + subFieldType + ' lang=' + selectedLanguage}

				{React.createElement(Fields[subFieldType], {
					value: "value",
					values: this.props.values,
					onChange: (...args) => console.log('onChange', args),
					mode: this.props.mode,
				})}
			</div>
		);
	},

	renderField () {
		const { value = { de: 'Deutsch', en: 'English', fr: 'Français' }, paths, autoFocus } = this.props;
		const { selectedLanguage } = this.state;
		const localizedValue = value[selectedLanguage];

		console.log({ props: this.props });

		return (
			<Grid.Row small="one-half" gutter={10}>
				<Grid.Col>
					<Grid.Row>
						<a onClick={() => this.selectLanguage('de')}>
							Deutsch
						</a>
						<a onClick={() => this.selectLanguage('en')}>
							English
						</a>
						<a onClick={() => this.selectLanguage('fr')}>
							Français
						</a>
					</Grid.Row>
					<Grid.Row>
						{this.renderSubField()}
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
});
