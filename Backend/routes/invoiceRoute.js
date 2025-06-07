import express from 'express';
import Invoice from '../models/invoice.js';

const router = express.Router();

// Create a new invoice
router.post('/', async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    console.log(invoice);

    const resu = await invoice.save();
    console.log(resu);

    res.status(201).json(invoice);
  } catch (error) {
    console.log(error);

    res.status(400).json({ message: error.message });
  }
});

// Get all invoices with pagination and filters
router.get('/:id', async (req, res) => {
  const companyId = req.params.id;
  try {
    const invoices = await Invoice.find({ companyId: companyId });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single invoice by ID
router.get('/id/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('companyId', 'fullName address phone email image digiImage')
      .populate('customerId', 'fullName address phone email image')
      .populate('items.productId', 'name description')
      .populate('userId', 'fullName')

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an invoice
router.put('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update invoice status
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Record payment for an invoice
router.post('/:id/payment', async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDate } = req.body;
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const newAmountPaid = (invoice.amountPaid || 0) + amount;
    const newBalanceDue = invoice.total - newAmountPaid;
    const newStatus = newBalanceDue <= 0 ? 'paid' : 'partial';

    invoice.amountPaid = newAmountPaid;
    invoice.balanceDue = newBalanceDue;
    invoice.status = newStatus;
    invoice.paymentMethod = paymentMethod;
    invoice.paymentDate = paymentDate || new Date();

    await invoice.save();
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get invoice statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $match: { companyId: req.user.companyId }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    const totalStats = await Invoice.aggregate([
      {
        $match: { companyId: req.user.companyId }
      },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$amountPaid' },
          totalDue: { $sum: '$balanceDue' }
        }
      }
    ]);

    res.json({
      statusBreakdown: stats,
      summary: totalStats[0] || {
        totalInvoices: 0,
        totalAmount: 0,
        totalPaid: 0,
        totalDue: 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
