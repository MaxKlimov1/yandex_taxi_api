const daysJs = require('dayjs');

module.exports = async function routes(fastify, option) {

    fastify.post('/api/driver/binding-car', async (req, res) => {

        const { body_number, brand, color, licence_plate_number, model, registration_certificate, vin, year } = req.body.car;

        const newCarData = {
            park_profile: {
                callsign: licence_plate_number,
                is_park_property: false,
                status: "working",
                categories: [
                    "econom",
                    "comfort",
                    "comfort_plus",
                    "business",
                    "express"
                ],
            },
            vehicle_licenses: {
                licence_plate_number,
                registration_certificate
            },
            vehicle_specifications: {
                brand,
                color,
                model,
                transmission: "unknown",
                vin,
                year: 1 * year
            }
        };

        if (vin.length < 17) newCarData.vehicle_specifications.vin = "00000000000000000";

        const { contact_info, driver_license, full_name, tranid, formid } = req.body;

        const newDriverData = {
            account: {
                balance_limit: "0",
                work_rule_id: "decd6889c6e440eba1777c5d3cd1653b",
                block_orders_on_balance_below_limit: false
            },
            person: {
                full_name: {
                    first_name: full_name.first_name,
                    last_name: full_name.last_name
                },
                contact_info: {
                    phone: '+' + contact_info.phone.match(/\d+/g).join(''),
                },
                driver_license: {
                    country: driver_license.country,
                    expiry_date: driver_license.expiry_date.split('.').reverse().join('-'),
                    issue_date: driver_license.issue_date.split('.').reverse().join('-'),
                    number: driver_license.number
                }
            },
            profile: {
                hire_date: daysJs().format('YYYY-MM-DD'),
                feedback: "создание водителя"
            },
            order_provider: {
                platform: true,
                partner: false
            }
        }

        const email = contact_info?.email;
        email && (newDriverData.person.contact_info.email = email.toLowerCase());

        const middleName = full_name?.middle_name;
        middleName && (newDriverData.person.full_name.middle_name = middleName);

        const birthDate = driver_license?.birth_date;
        birthDate && (newDriverData.person.driver_license.birth_date = birthDate.split('.').reverse().join('-'));

        const fleetNewCarResponse = await fastify.fleetCreateRequest('/v2/parks/vehicles/car', newCarData, tranid);

        const fleetNewDriverResponse = await fastify.fleetCreateRequest('/v2/parks/contractors/driver-profile', newDriverData, tranid);

        
        if(fleetNewDriverResponse.status != 'ok') {
            res.status(400);
            return {
                ...fleetNewDriverResponse,
                errorMessage: 'An error occurred while creating the driver'
            }
        }
        if(fleetNewCarResponse.status != 'ok'){
            res.status(400);
            return {
                ...fleetNewCarResponse,
                errorMessage: 'An error occurred when creating a car'
            }
        }
        else{

            const fleetBindingCarResponse = await fastify.fleetBindingRequest('/v1/parks/driver-profiles/car-bindings', fleetNewDriverResponse.data.contractor_profile_id, fleetNewCarResponse.data.vehicle_id);

            if(fleetBindingCarResponse.status == 'ok') {
                return {
                    status: 'complited',
                    vehicle_id: fleetNewCarResponse.data.vehicle_id,
                    contractor_profile_id: fleetNewDriverResponse.data.contractor_profile_id
                }
            }
            else {
                res.status(400);
                return {
                    ...fleetBindingCarResponse,
                    errorMessage: 'An error occurred when linking the car to the driver'
                }
            }
        }

    });

};