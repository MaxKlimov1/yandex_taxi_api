const fp = require('fastify-plugin');

module.exports = fp(async (fastify, options) => {
  fastify.decorate('fleetCreateRequest', async (endpoint, body, identToken) => {
      const response = await fetch(process.env.FLEET_API_URL + endpoint, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          "X-Park-ID": process.env.FLEET_PARK_ID,
          "X-Client-ID": process.env.FLEET_CLIENT_ID,
          "X-API-Key": process.env.FLEET_API_KEY,
          "X-Idempotency-Token": identToken,
        },
        body: JSON.stringify(body)
      });

      const result = await response.json();

      if(response.ok) {

        return  {
          status: 'ok',
          data: result
        }
      }
      else {
        return{
          status: 'error',
          statusMessage: result.message
        }
      }
});

   fastify.decorate('fleetBindingRequest', async (endpoint, driverId, carId) => {
      const response = await fetch(process.env.FLEET_API_URL + endpoint + `?park_id=${process.env.FLEET_PARK_ID}&car_id=${carId}&driver_profile_id=${driverId}`, {
        method: 'put',
        headers: {
          "X-Client-ID": process.env.FLEET_CLIENT_ID,
          "X-API-Key": process.env.FLEET_API_KEY,
        }
      });
      const result = await response.json();

      if(response.ok) {

        return {
          status: 'ok',
        }

      }
      else {
        return {
          status: 'error',
          statusMessage: result.message
        }
      }
  
  })
})
