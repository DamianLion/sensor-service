const express = require('express');
const router = express.Router();

/**
 * Get all sensor data assigned to my user
 */

const Sensors = require('../controller/Sensors');
router.get('/api/v1/sensors', Sensors.getAll);
router.post('/api/v1/sensors', Sensors.post);

const Devices = require('../controller/Devices');
router.get('/api/v1/devices', Devices.getAll);
router.post('/api/v1/devices', Devices.post);

/**
 * Get all sensor data assigned to my user
 */


module.exports = router;
