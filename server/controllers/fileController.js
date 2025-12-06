const { File } = require('../models');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { customName } = req.body;
        const userId = req.user.id;
        const publicId = crypto.randomBytes(8).toString('hex'); // Short random ID

        // Generate QR Code
        // We'll point the QR code to the frontend public view page
        // Use FRONTEND_URL from env or default to localhost
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const publicUrl = `${frontendUrl}/v/${publicId}`;

        const qrFileName = `qr-${publicId}.png`;
        const qrFilePath = path.join(__dirname, '../uploads', qrFileName);

        await QRCode.toFile(qrFilePath, publicUrl);

        const file = await File.create({
            userId,
            customName: customName || req.file.originalname,
            originalName: req.file.originalname,
            mimeType: req.file.mimetype,
            size: req.file.size,
            filePath: req.file.filename,
            qrCodePath: qrFileName,
            publicId,
        });

        res.status(201).json({
            message: 'File uploaded successfully',
            file
        });
    } catch (error) {
        console.error(error);
        // Clean up uploaded file if error
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getFiles = async (req, res) => {
    try {
        const files = await File.findAll({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
        });
        res.json(files);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const file = await File.findOne({
            where: { id: req.params.id, userId: req.user.id }
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        // Delete physical files
        const uploadDir = path.join(__dirname, '../uploads');
        const filePath = path.join(uploadDir, file.filePath);
        const qrPath = path.join(uploadDir, file.qrCodePath);

        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        if (fs.existsSync(qrPath)) fs.unlinkSync(qrPath);

        await file.destroy();

        res.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getPublicFile = async (req, res) => {
    try {
        const { publicId } = req.params;
        const file = await File.findOne({
            where: { publicId },
            attributes: ['customName', 'mimeType', 'filePath', 'createdAt'] // Don't expose internal paths if not needed, but we need filePath to serve it
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.json(file);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
