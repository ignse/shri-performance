function quantile(arr, q) {
    const sorted = arr.sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;

    if (sorted[base + 1] !== undefined) {
        return Math.floor(sorted[base] + rest * (sorted[base + 1] - sorted[base]));
    } else {
        return Math.floor(sorted[base]);
    }
}

function prepareData(result) {
	return result.data.map(item => {
		item.date = item.timestamp.split('T')[0];

		return item;
	});
}

function addMetricByPeriod(data, page, name, dateFrom, dateTo) {
	const _dateFrom = +dateFrom.replace(new RegExp('-', 'g'), '');
	const _dateTo = +dateTo.replace(new RegExp('-', 'g'), '');

	let sampleData = data
		.filter(item => {
			const _date = +item.date.replace(new RegExp('-', 'g'), '');

			return item.page == page && item.name == name && _date >= _dateFrom && _date <= _dateTo;
		})
		.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}

function addMetricByDate(data, page, name, date) {
	let sampleData = data
					.filter(item => item.page == page && item.name == name && item.date == date)
					.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}

function addMetricByAdditional(data, page, name, additional_name, additional_value) {
	let sampleData = data
		.filter(item => item.page == page && item.name == name && item.additional[additional_name] == additional_value)
		.map(item => item.value);

	let result = {};

	result.hits = sampleData.length;
	result.p25 = quantile(sampleData, 0.25);
	result.p50 = quantile(sampleData, 0.5);
	result.p75 = quantile(sampleData, 0.75);
	result.p95 = quantile(sampleData, 0.95);

	return result;
}

//Метрики по дате
function calcMetricsByDate(data, page, date) {
	console.log(`All metrics for ${date}:`);

	let table = {};
	table.connect = addMetricByDate(data, page, 'connect', date);
	table.ttfb = addMetricByDate(data, page, 'ttfb', date);
	table.draw_tables = addMetricByDate(data, page, 'draw tables', date);
	table.load_data = addMetricByDate(data, page, 'load data', date);

	console.table(table);

	return [
		{...table.connect, action: 'connect'},
		{...table.ttfb, action: 'ttfb'},
		{...table.draw_tables, action: 'draw tables'},
		{...table.load_data, action: 'load data'}
	];
}

//Метрики за период
function calcMetricsByPeriod(data, page, dateFrom, dateTo) {
	console.log(`All metrics for period from ${dateFrom} to ${dateTo}`);

	let table = {};
	table.connect = addMetricByPeriod(data, page, 'connect', dateFrom, dateTo);
	table.ttfb = addMetricByPeriod(data, page, 'ttfb', dateFrom, dateTo);
	table.draw_tables = addMetricByPeriod(data, page, 'draw tables', dateFrom, dateTo);
	table.load_data = addMetricByPeriod(data, page, 'load data', dateFrom, dateTo);

	console.table(table);

	return [
		{...table.connect, action: 'connect'},
		{...table.ttfb, action: 'ttfb'},
		{...table.draw_tables, action: 'draw tables'},
		{...table.load_data, action: 'load data'}
	];
}

//Метрики текущего пользователя
function calcMetricsByBrowser(data, page, browser) {
	console.log(`All metrics for current user browser: ${browser}`);

	let table = {};
	table.connect = addMetricByAdditional(data, page, 'connect', 'browser', browser);
	table.ttfb = addMetricByAdditional(data, page, 'ttfb', 'browser', browser);
	table.draw_tables = addMetricByAdditional(data, page, 'draw tables', 'browser', browser);
	table.load_data = addMetricByAdditional(data, page, 'load data', 'browser', browser);

	console.table(table);

	return [
		{...table.connect, action: 'connect'},
		{...table.ttfb, action: 'ttfb'},
		{...table.draw_tables, action: 'draw tables'},
		{...table.load_data, action: 'load data'}
	];
}
//Сравнение метрик
function calcMetricsByPlatforms(data, page, name) {
	console.log(`All metrics for current user browser: ${browser}`);

	let table = {};
	table.touch = addMetricByAdditional(data, page, name, 'platform', 'touch');
	table.desktop = addMetricByAdditional(data, page, name, 'platform', 'desktop');

	console.table(table);

	return [
		{...table.touch, action: 'touch'},
		{...table.desktop, action: 'desktop'}
	];
}