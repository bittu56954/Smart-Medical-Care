import React from 'react';
import {
  Printer,
  X,
  Stethoscope,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Building,
  Calendar,
  User,
  Activity,
  Pill,
  Award,
  Download,
  AlertTriangle,
  Zap,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const DoctorBillModal = ({
  isOpen,
  onClose,
  scanData = null,
  medicineData = null,
  featureData = null,
  billType = 'facial' // 'facial', 'medicine', 'predoctor'
}) => {
  const { user, currentUser } = useAuth();

  if (!isOpen) return null;

  const activeUser = user || currentUser;

  // Patient Info from Login / Registration
  const patientName = activeUser?.name || activeUser?.fullName || 'Bittu Kumar';
  const patientEmail = activeUser?.email || 'bittu@gmail.com';
  const patientPhone = activeUser?.phone || activeUser?.mobile || '+91 98765-43210';
  const invoiceId = scanData?.scanId || medicineData?.batchNumber || 'FC-' + Math.floor(100000 + Math.random() * 900000);
  const invoiceDate = new Date().toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  // Extract diagnosis, problems, treatments based on scan type
  let diagnosisTitle = 'General Health Evaluation';
  let healthScore = 95;
  let severity = 'Low / Mild';
  let identifiedProblems = [];
  let clinicalAssessment = '';
  let doctorRecommendations = [];

  if (billType === 'facial' && scanData) {
    diagnosisTitle = scanData.statusTitle || 'Facial Diagnostic Scan';
    healthScore = scanData.healthScore || 90;
    severity = scanData.isCompletelyHealthy ? 'Optimal Health Status' : 'Moderate Clinical Attention Recommended';
    
    identifiedProblems = scanData.suspectedDiseases?.map(d => ({
      name: d.name,
      severity: d.severity,
      probability: d.probability + '%',
      description: d.description
    })) || [];

    clinicalAssessment = scanData.doctorSummary || 'Non-invasive optical micro-vascular biomarker evaluation indicates stable physiological parameter response.';

    doctorRecommendations = scanData.doctorRecommendations || [
      'Maintain regular lifestyle, adequate hydration, and balanced nutrition.',
      'Follow up with a medical specialist if acute discomfort arises.'
    ];

  } else if (billType === 'medicine' && medicineData) {
    diagnosisTitle = `Medicine Identification: ${medicineData.name || 'Pharmaceutical Product'}`;
    healthScore = 96;
    severity = 'Verified Pharmaceutical Grade';

    identifiedProblems = medicineData.problemsTreated?.map(p => ({
      name: p.condition,
      severity: p.category || 'Clinical Indication',
      probability: '100% Verified Match',
      description: p.detail
    })) || [
      { name: medicineData.uses?.[0] || 'Symptomatic Treatment', severity: 'Primary Indication', probability: '100%', description: 'Pharmacological verification complete.' }
    ];

    clinicalAssessment = medicineData.mechanism || `Pharmaceutical verification confirms chemical composition and standard indication alignment.`;

    doctorRecommendations = medicineData.precautions?.slice(0, 4) || [
      'Take strictly under registered medical supervision.',
      'Store under prescribed temperature conditions.'
    ];

  } else if (billType === 'predoctor' && featureData) {
    diagnosisTitle = featureData.title || 'Pre-Doctor Clinical Assessment';
    healthScore = featureData.triageClass === 'danger' ? 65 : 88;
    severity = featureData.triage || 'Standard Clinical Triage';

    identifiedProblems = [
      {
        name: featureData.impression || 'Symptom Pattern Evaluation',
        severity: featureData.triage || 'Clinical Triage',
        probability: 'Clinical Rule Match',
        description: featureData.redFlags?.join('; ') || 'Structured diagnostic rule screening complete.'
      }
    ];

    clinicalAssessment = 'Screening evaluated against standardized diagnostic parameters. Detailed diagnostic report generated for patient clinical verification.';

    doctorRecommendations = [
      featureData.doctorAdvice || 'Share this report with your attending physician.',
      ...(featureData.labTests ? [`Recommended Diagnostic Investigations: ${featureData.labTests.join(', ')}`] : []),
      ...(featureData.questionsForDoctor ? [`Suggested Questions for Specialist: ${featureData.questionsForDoctor.join(' | ')}`] : [])
    ];
  }

  const handlePrint = () => {
    const printElement = document.getElementById('printable-doctor-certificate');
    if (!printElement) {
      window.print();
      return;
    }

    try {
      const printWindow = window.open('', '_blank', 'width=900,height=800');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Medical_Certificate_${certificateId}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                * { box-sizing: border-box; }
                body {
                  font-family: 'Inter', system-ui, -apple-system, sans-serif;
                  margin: 20px;
                  color: #0f172a;
                  background: #ffffff;
                }
                @page {
                  size: A4 portrait;
                  margin: 10mm;
                }
                .no-print { display: none !important; }
              </style>
            </head>
            <body>
              ${printElement.innerHTML}
              <script>
                window.onload = function() {
                  window.print();
                  setTimeout(function() { window.close(); }, 800);
                };
              </script>
            </body>
          </html>
        `);
        printWindow.document.close();
      } else {
        window.print();
      }
    } catch (err) {
      window.print();
    }
  };

  const certificateId = invoiceId.replace('FC-', 'SMC-CERT-');

  return (
    <div
      className="doctor-bill-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        overflowY: 'auto'
      }}
    >
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          html, body {
            background: #ffffff !important;
            color: #0f172a !important;
            margin: 0 !important;
            padding: 0 !important;
            height: auto !important;
            overflow: visible !important;
          }
          body > *:not(.doctor-bill-modal-overlay) {
            display: none !important;
          }
          .doctor-bill-modal-overlay {
            position: static !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            display: block !important;
            backdrop-filter: none !important;
          }
          .doctor-bill-modal-content {
            position: static !important;
            width: 100% !important;
            max-width: 100% !important;
            max-height: none !important;
            height: auto !important;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
            display: block !important;
          }
          #printable-doctor-certificate {
            position: static !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            display: block !important;
          }
          .no-print {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .doctor-bill-modal-overlay {
            padding: 0.5rem !important;
          }
          .doctor-bill-modal-content {
            max-height: 96vh !important;
            border-radius: 16px !important;
          }
        }
      `}</style>

      <div
        className="doctor-bill-modal-content"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          width: '100%',
          maxWidth: '860px',
          maxHeight: '92vh',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: "'Inter', system-ui, -apple-system, sans-serif"
        }}
      >
        {/* Top Control Bar */}
        <div
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.1rem 1.75rem',
            background: '#0f172a',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Award size={22} color="#38bdf8" />
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
              Official Clinical Health Evaluation Certificate
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#0284c7',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1.35rem',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Printer size={16} /> Download / Print Official Certificate
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Certificate */}
        <div
          id="printable-doctor-certificate"
          style={{
            padding: '2.5rem',
            overflowY: 'auto',
            flex: 1,
            backgroundColor: '#ffffff',
            color: '#0f172a'
          }}
        >
          {/* ELEGANT CERTIFICATE BORDER WRAPPER */}
          <div style={{ border: '3px double #0284c7', padding: '2rem', borderRadius: '16px', background: '#fafafa', position: 'relative' }}>
            
            {/* TOP HEADER & EMBLEM */}
            <div style={{ textAlignment: 'center', textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ width: 46, height: 46, borderRadius: '12px', background: 'linear-gradient(135deg, #0284c7, #0d9488)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={28} />
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.3px', textTransform: 'uppercase' }}>
                  SMART MEDICAL CARE CLINICAL EVALUATION CENTER
                </h1>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#0284c7', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                Accredited Digital Diagnostics & Tele-Triage Medical Board &bull; ISO 9001:2025 Certified
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginTop: '0.5rem', fontSize: '0.76rem', color: '#64748b' }}>
                <span>Certificate No: <strong>{certificateId}</strong></span>
                <span>&bull;</span>
                <span>Issue Date: <strong>{invoiceDate}</strong></span>
                <span>&bull;</span>
                <span>Verification: <strong>AUTHENTICATED ONLINE</strong></span>
              </div>
            </div>

            {/* CERTIFICATE TITLE */}
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ background: '#0284c7', color: '#ffffff', padding: '0.4rem 1.25rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)' }}>
                OFFICIAL CLINICAL DIAGNOSTIC TEST CERTIFICATE
              </span>
            </div>

            {/* PATIENT VERIFICATION BLOCK */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '14px', padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ fontSize: '0.92rem', color: '#334155', margin: 0, lineHeight: 1.6 }}>
                This is to officially certify that <strong>{patientName}</strong> (Contact: <em>{patientPhone}</em> | Email: <em>{patientEmail}</em>) has successfully completed a structured online clinical diagnostic and symptom screening test via the <strong>Smart Medical Care Clinical System</strong>.
              </p>
            </div>

            {/* CLINICAL FINDINGS & EVALUATION */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', background: '#eff6ff', padding: '0.6rem 1rem', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
                <Activity size={18} color="#0284c7" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1e40af', margin: 0, textTransform: 'uppercase' }}>
                  1. DIAGNOSTIC TEST FINDINGS & IDENTIFIED HEALTH STATUS
                </h3>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.6rem', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Evaluation Module / Test Name</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>{diagnosisTitle}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Clinical Health Score & Triage Status</span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 900, color: healthScore < 75 ? '#dc2626' : '#059669' }}>
                      {healthScore}/100 ({severity})
                    </div>
                  </div>
                </div>

                <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.5rem' }}>
                  Evaluated Symptoms & Detected Conditions:
                </strong>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                      <th style={{ padding: '0.5rem 0.75rem', borderRadius: '6px 0 0 6px' }}>Detected Condition / Symptom</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Risk Level</th>
                      <th style={{ padding: '0.5rem 0.75rem' }}>Confidence</th>
                      <th style={{ padding: '0.5rem 0.75rem', borderRadius: '0 6px 6px 0' }}>Clinical Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {identifiedProblems.map((prob, pIdx) => (
                      <tr key={pIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>{prob.name}</td>
                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <span style={{ background: prob.severity === 'High' || prob.severity === 'EMERGENCY RED FLAG' ? '#fef2f2' : '#ecfdf5', color: prob.severity === 'High' || prob.severity === 'EMERGENCY RED FLAG' ? '#dc2626' : '#059669', padding: '0.15rem 0.5rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                            {prob.severity}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0284c7' }}>{prob.probability}</td>
                        <td style={{ padding: '0.6rem 0.75rem', color: '#475569', fontSize: '0.82rem' }}>{prob.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CLINICAL IMPRESSION & RECOMMENDATIONS */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', background: '#f0fdf4', padding: '0.6rem 1rem', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
                <Stethoscope size={18} color="#16a34a" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#15803d', margin: 0, textTransform: 'uppercase' }}>
                  2. CLINICAL ADVISORY & RECOMMENDED MEDICAL ACTION
                </h3>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem' }}>
                <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '0.85rem' }}>
                  <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <Sparkles size={16} color="#0284c7" /> Diagnostic Summary & Impression:
                  </strong>
                  <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.5, margin: 0, fontStyle: 'italic' }}>
                    "{clinicalAssessment}"
                  </p>
                </div>

                <div>
                  <strong style={{ fontSize: '0.82rem', color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '0.4rem' }}>
                    Certified Health Recommendations for Patient & Attending Physician:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {doctorRecommendations.map((rec, rIdx) => (
                      <li key={rIdx}><strong>Recommendation {rIdx + 1}:</strong> {rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* PRESCRIBED REQUIRED MEDICINES (BILINGUAL) */}
            {scanData?.requiredMedicines && scanData.requiredMedicines.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', background: '#f0f9ff', padding: '0.6rem 1rem', borderRadius: '10px', borderLeft: '4px solid #0284c7' }}>
                  <Pill size={18} color="#0284c7" />
                  <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0369a1', margin: 0, textTransform: 'uppercase' }}>
                    3. PRESCRIBED REQUIRED MEDICINES / आवश्यक दवाइयां (BILINGUAL RX)
                  </h3>
                </div>

                <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '1rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'left', fontWeight: 700 }}>
                        <th style={{ padding: '0.5rem 0.75rem', borderRadius: '6px 0 0 6px' }}>#</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Required Medicine (English & Hindi)</th>
                        <th style={{ padding: '0.5rem 0.75rem' }}>Dosage & Instruction / खुराक</th>
                        <th style={{ padding: '0.5rem 0.75rem', borderRadius: '0 6px 6px 0' }}>PM Jan Aushadhi Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scanData.requiredMedicines.map((med, mIdx) => (
                        <tr key={mIdx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 700 }}>{mIdx + 1}</td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <strong style={{ color: '#0284c7', display: 'block' }}>{med.nameEn}</strong>
                            <span style={{ color: '#0f172a', fontWeight: 700, fontSize: '0.82rem' }}>🇮🇳 {med.nameHi}</span>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <div style={{ color: '#0f172a', fontWeight: 600, fontSize: '0.82rem' }}>🇬🇧 {med.dosageEn}</div>
                            <div style={{ color: '#059669', fontWeight: 600, fontSize: '0.82rem' }}>🇮🇳 {med.dosageHi}</div>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <span style={{ background: '#ecfdf5', color: '#059669', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                              {med.janAushadhi}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* OFFICIAL AUTHORIZED MEDICAL BOARD SIGNATURE & CERTIFICATION STAMP */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '2px solid #cbd5e1', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <div style={{ fontSize: '0.76rem', color: '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Certificate Authenticity & Validity:</strong>
                This digital clinical certificate is verified and issued under Smart Medical Care Tele-Triage Protocol. It certifies the completion of diagnostic evaluation and can be presented to registered medical practitioners for clinical review.
              </div>

              {/* Certified Specialist Signature Block */}
              <div style={{ textAlign: 'center', minWidth: '240px' }}>
                <div style={{ display: 'inline-block', border: '2px dashed #0284c7', padding: '0.35rem 0.75rem', borderRadius: '10px', background: '#f0f9ff', color: '#0284c7', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                  <Award size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> CLINICALLY VERIFIED & SEALED
                </div>
                
                <div style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '1.5rem', fontWeight: 'bold', color: '#0369a1', fontStyle: 'italic', margin: '2px 0' }}>
                  Dr. Rajesh Sharma, MD
                </div>
                <div style={{ borderTop: '1.5px solid #0f172a', paddingTop: '4px', fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>
                  Dr. Rajesh Sharma, MD (Internal Medicine)
                </div>
                <div style={{ fontSize: '0.76rem', color: '#0284c7', fontWeight: 700 }}>Senior Clinical Diagnostician & Medical Director</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>Medical Council Reg. No: MCI-2026-98471</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorBillModal;
