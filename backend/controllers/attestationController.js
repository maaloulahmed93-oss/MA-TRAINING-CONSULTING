import Attestation from '../models/Attestation.js';
import Program from '../models/Program.js';

export const uploadAndSave = async (req, res) => {
  try {
    // Validate file
    if (!req.file || !req.file.path) {
      return res.status(400).json({ success: false, message: 'Fichier PDF requis' });
    }

    const { participantId = '', type = 'attestation' } = req.body || {};

    // Optional: verify participant via Partner collection if needed later

    const url = req.file.path; // Cloudinary URL from multer-storage-cloudinary

    // Get program info for ID generation
    const programId = req.body.programId || (await Program.findOne())?._id;
    const program = await Program.findById(programId);

    // If extra creation is requested, save minimal document
    const record = new Attestation({
      attestationId: await Attestation.generateAttestationId(
        req.body.fullName || 'Sans nom',
        program?.title || 'Programme'
      ),
      fullName: req.body.fullName || 'Sans nom',
      programId,
      dateObtention: req.body.dateObtention || new Date(),
      note: Number(req.body.note || 0),
      niveau: req.body.niveau || 'Débutant',
      skills: req.body.skills ? JSON.parse(req.body.skills) : [],
      techniques: req.body.techniques ? JSON.parse(req.body.techniques) : [],
      documents: { attestation: url },
    });

    if (!record.programId) {
      return res.status(400).json({ success: false, message: 'programId requis' });
    }

    await record.save();

    return res.status(201).json({ success: true, url, data: record });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


