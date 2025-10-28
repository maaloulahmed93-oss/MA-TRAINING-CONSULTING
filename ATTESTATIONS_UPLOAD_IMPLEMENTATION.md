## MATC — Attestations PDF Upload via Cloudinary

### Backend (Node.js/Express/MongoDB)

- config/cloudinary.js: v2 SDK configured from env vars (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- middlewares/upload.js: `multer` + `multer-storage-cloudinary` storing PDFs in `matc_attestations` with `resource_type=raw`, forced `format=pdf`, and unique `public_id`.
- controllers/attestationController.js: `uploadAndSave` validates the upload, reads the Cloudinary URL from `req.file.path`, generates an attestation ID, and persists the full `Attestation` record with the uploaded URL in `documents.attestation`.
- routes/attestationRoutes.js: `POST /api/attestations/upload` handles `multipart/form-data` with `file` field and returns `{ success, url }`.
- routes/attestations.js: download route redirects to Cloudinary URLs when a document path is http/https, otherwise streams local file.
- server.js: routes mounted under `/api/attestations` including `/upload`.

### Environment Variables (Render/Vercel)

Required:
- CLOUDINARY_CLOUD_NAME
- CLOUDINARY_API_KEY
- CLOUDINARY_API_SECRET

Example: see `backend/env.production.example`.

### Dependencies (backend)

Installed in `backend/package.json`:
- cloudinary
- multer
- multer-storage-cloudinary

### API — Postman Test (Step 7)

- Method: POST
- URL: `https://matc-backend.onrender.com/api/attestations/upload`
- Body: form-data
  - Key: `file` (type: File) → select a PDF
- Expected 201 response:
```
{ "success": true, "url": "https://res.cloudinary.com/.../matc_attestations/...pdf" }
```

### Admin Panel Integration (Step 8)

- Component: `admin-panel/src/components/attestations/AttestationForm.tsx`
  - Uses `attestationsApi.uploadPdf(file)` to upload to `/api/attestations/upload`.
  - Then creates the attestation record via `attestationsApi.create(...)`.
- Service: `admin-panel/src/services/attestationsApi.ts`
  - `uploadPdf(file)` posts `multipart/form-data` and returns the Cloudinary URL.

### Result

- PDFs are uploaded to Cloudinary, URLs saved in MongoDB.
- Downloading works from the main site via redirect to Cloudinary.
- No local storage dependency in production.


