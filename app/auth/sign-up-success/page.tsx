import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AsistanLogo } from '@/components/asistan-logo'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-background to-secondary/50 p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-4">
          <div className="flex justify-center">
            <AsistanLogo variant="dark" />
          </div>
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">E-postanızı Kontrol Edin</CardTitle>
          <CardDescription>
            Hesabınızı doğrulamak için e-posta adresinize bir onay bağlantısı gönderdik.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>E-postanızı alamadıysanız, lütfen spam klasörünüzü kontrol edin.</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/auth/login">Giriş Sayfasına Dön</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
