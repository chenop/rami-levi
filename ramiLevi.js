const axios = require('axios');
const Pushover = require('node-pushover');
require('dotenv').config(); // Read .env file

// Init Pushover
const push = new Pushover({
	token: process.env.APP_TOKEN,
	user: process.env.USER_API_KEY
});

async function fetchAvailableHours() {
	let result = await axios.post('https://api-prod.rami-levy.co.il/api/v1/orders/get-supply-date',
		{
			"city": "חיפה", "street": "הגליל", "street_number": "138"
		}
	);

	let shifts = result.data.data;
	if (!shifts || shifts.length === 0)
		return shifts;

	let availableShifts = shifts.filter(day => day.Active === '1');
	return availableShifts.map(shift => `${shift.Date} ${shift.FromHour}-${shift.ToHour}`);
}

module.exports.run = async function (event, context, callback) {
	try {
		let hours = await fetchAvailableHours();
		if (!hours) {
			console.log("hours are undefined");
			return;
		}

		if (hours.length === 0) {
			console.log("no hours available");
			return;
		}

		let formattedHours = hours.join('\n');
		console.log(formattedHours);

		// We got available hours!
		push.send("רמי לוי פנוי!", formattedHours);
	}
	catch (err) {
		console.error(err);
	}
};
