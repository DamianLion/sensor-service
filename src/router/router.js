const express = require('express');
const router = express.Router();

/**
 * Get all devices
 */
const Devices = require('../controller/Devices');
router.get('/api/v1/devices', Devices.getAll);
router.get('/api/v1/devices/:id', Devices.getOne);
router.delete('/api/v1/devices/:id', Devices.deleteOne);
router.put('/api/v1/devices/:id', Devices.updateOne);
router.post('/api/v1/devices', Devices.post);

/**
 * Get all sensors
 */
const Sensors = require('../controller/Sensors');
router.get('/api/v1/sensors', Sensors.getAll);
router.get('/api/v1/sensors/:id', Sensors.getOne);
router.delete('/api/v1/sensors/:id', Sensors.deleteOne);
router.put('/api/v1/sensors/:id', Sensors.updateOne);
router.post('/api/v1/sensors', Sensors.post);

/**
 * data of sensors
 */
const Data = require('../controller/Data');
router.get('/api/v1/data', Data.getAll);
router.get('/api/v1/data/:id', Data.getOne);
router.delete('/api/v1/data/:id', Data.deleteOne);
router.post('/api/v1/data', Data.post);


module.exports = router;
