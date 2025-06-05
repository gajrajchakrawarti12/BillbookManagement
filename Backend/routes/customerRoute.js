import express from 'express';
import Customer from '../models/Customer.js';

const router = express.Router();

router.post('/', async (req, res) => {
    const customer = new Customer(req.body);
    await customer.save();
    res.status(201).json(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.find({companyId: req.params.id});
    res.status(200).json(customer);
}); 

router.get('/id/:id', async (req, res) => {
    const customer = await Customer.findById(req.params.id);
    res.status(200).json(customer);
}); 

router.put('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(customer);
});

router.delete('/:id', async (req, res) => {
    await Customer.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Customer deleted' });
});

export default router;