import React from 'react';
import ItemsTableCell from '../../components/ItemsTableCell';
import ItemsTableValue from '../../components/ItemsTableValue';

var TranslatableColumn = React.createClass({
	displayName: 'TranslatableColumn',
	propTypes: {
		col: React.PropTypes.object,
		data: React.PropTypes.object,
		linkTo: React.PropTypes.string,
	},
	renderValue () {
		return 'TranslatableColumn';
		// var value = this.props.data.fields[this.props.col.path];
		// if (!value || (!value.first && !value.last)) return '(no name)';
		// return value.first + ' ' + value.last;
	},
	render () {
		console.log('TranslatableColumn', { props: this.props });

		return (
			<ItemsTableCell>
				<ItemsTableValue to={this.props.linkTo} padded interior field={this.props.col.type}>
					{this.renderValue()}
				</ItemsTableValue>
			</ItemsTableCell>
		);
	},
});

module.exports = TranslatableColumn;
