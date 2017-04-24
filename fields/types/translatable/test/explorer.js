module.exports = {
	Field: require('../TranslatableField'),
	Filter: require('../TranslatableFilter'),
	section: 'Text',
	spec: {
		label: 'Name',
		path: 'name',
		paths: {
			first: 'name.first',
			last: 'name.last',
		},
		value: {
			first: 'Jed',
			last: 'Watson',
		},
	},
};
