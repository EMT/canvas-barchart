/**
 * Use the bar chart library to build a bar chart
 */

var chart = new BarChart({
	chartTitle: 'Primary Energy Use',
	yAxisLabel: 'kWh/m2.year',
	fontSize: 28,
	// chartLow: 0,
	// chartHigh: 400,
	division: 100,
	width: 1200,
	chartHeight: 400,
	barWidth: 140,
	barGutter: 40,
	barDivisionType: 'group',
	defaultBarColor: 'rgb(30,160,30)',
	ranges: [
		{
			low: 50,
			high: 150,
			label: 'Test Range',
			color: 'rgb(254,204,204)'
		}
	],
	targets: [
		{
			target: 230,
			label: 'My Target',
			color: 'rgb(0,180,180)'
		}
	],
	barColors: {
		'Space heating': 'rgb(65,168,198)',
		'Pumps, fans, etc.': 'rgb(24,86,62)',
		'Cooking': 'rgb(147,162,147)',
		'Gas (total from bills)': 'rgb(236,102,79)',
		'Solid fuel (total from bills)': 'rgb(246,167,7)',
		'Total primary energy': 'rgb(241,138,157)',
		'Water heating': 'rgb(82,41,57)',
		'Lighting': 'rgb(10,175,154)'
	},
	data: [
		{
			label: 'UK Average',
			value: [
				{value: 50, label: 'Gas (total from bills)'},
				{value: 80, label: 'Space heating'}
			]
		},
		{
			label: 'Negative stacked',
			value: [
				{value: -150, label: 'Gas (total from bills)'},
				{value: 80, label: 'Space heating'}
			]
		},
		{
			label: 'Label 1',
			value: [
				{value: 200, label: 'Gas (total from bills)'},
				{value: 120, label: 'Space heating'},
				{value: 65, label: 'Total primary energy'},
				{value: 30, label: 'Solid fuel (total from bills)'}
			]
		},
		{label: 'Your home now (model)', value: -80},
		{label: 'Carbon Coop 2050 target', value: 125, variance: 30}
	]
});

chart.draw('barchart-stacked');

