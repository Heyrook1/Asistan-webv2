import QRCode from 'qrcode'

/** Server-side QR as SVG for print + screen (clinic Rx verify URL). */
export async function renderPrescriptionQrSvg(verifyUrl: string): Promise<string> {
  return QRCode.toString(verifyUrl, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 144,
  })
}
